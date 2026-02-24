import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Calendar, LogIn, ChevronRight, Check, X } from 'lucide-react';

interface CalendarImportModalProps {
  associationId: string;
  onSuccess: () => void;
}

interface CalendarEntry {
  id: string;
  summary: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  htmlLink?: string;
}

interface ImportRow {
  eventId: string;
  selected: boolean;
  title: string;
  link: string;
  eventDate: string;
  visibleFrom: string;
  expiresAt: string;
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function computeDates(eventDateStr: string) {
  const eventDate = new Date(eventDateStr + 'T00:00:00');
  const now = new Date();
  const sevenBefore = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const visibleFrom = sevenBefore > now ? sevenBefore : now;
  return {
    visibleFrom: visibleFrom.toISOString(),
    expiresAt: new Date(eventDateStr + 'T23:59:59').toISOString(),
  };
}

export default function CalendarImportModal({ associationId, onSuccess }: CalendarImportModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<CalendarEntry[]>([]);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const open = () => {
    setStep(accessToken ? 2 : 1);
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  const handleGoogleSignIn = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Client ID is not configured');
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      callback: async (response) => {
        if (response.error || !response.access_token) {
          toast.error('Google sign-in failed');
          return;
        }
        setAccessToken(response.access_token);
        setLoading(true);
        try {
          const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          const data = await res.json();
          setCalendars((data.items || []).map((c: { id: string; summary: string }) => ({
            id: c.id,
            summary: c.summary,
          })));
          setStep(2);
        } catch {
          toast.error('Failed to fetch calendars');
        } finally {
          setLoading(false);
        }
      },
    });
    client.requestAccessToken();
  }, []);

  const handleSelectCalendar = async (calendarId: string) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
          new URLSearchParams({
            timeMin: now,
            maxResults: '100',
            singleEvents: 'true',
            orderBy: 'startTime',
          }),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      const events: CalendarEvent[] = data.items || [];

      const importRows: ImportRow[] = events
        .filter((e) => e.summary)
        .map((e) => {
          const raw = e.start.date || (e.start.dateTime ? e.start.dateTime.split('T')[0] : '');
          if (!raw) return null;
          const { visibleFrom, expiresAt } = computeDates(raw);
          return {
            eventId: e.id,
            selected: true,
            title: e.summary,
            link: '',
            eventDate: raw,
            visibleFrom,
            expiresAt,
          };
        })
        .filter(Boolean) as ImportRow[];

      setRows(importRows);
      setStep(3);
    } catch {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (idx: number, patch: Partial<ImportRow>) => {
    setRows((prev) => prev.map((r, i) => {
      if (i !== idx) return r;
      const updated = { ...r, ...patch };
      if (patch.eventDate) {
        const { visibleFrom, expiresAt } = computeDates(patch.eventDate);
        updated.visibleFrom = visibleFrom;
        updated.expiresAt = expiresAt;
      }
      return updated;
    }));
  };

  const handleImport = async () => {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) {
      toast.error('Vyberte alespoň jednu událost');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const createdBy = session?.user?.email || 'unknown';

      const inserts = selected.map((r) => ({
        association_id: associationId,
        title: r.title,
        body: r.title,
        link: r.link || null,
        visible_from: r.visibleFrom,
        expires_at: r.expiresAt,
        created_by: createdBy,
      }));

      const { error } = await supabase.from('notifications').insert(inserts);
      if (error) throw error;

      toast.success(`Importováno ${selected.length} notifikací`);
      close();
      setRows([]);
      setStep(1);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Chyba při importu');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = rows.filter((r) => r.selected).length;

  return (
    <>
      <button onClick={open} className="btn btn-outline gap-2 w-full">
        <Calendar size={20} />
        Import z kalendáře
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Import z Google Calendar</h3>
            <button onClick={close} className="btn btn-ghost btn-sm btn-square">
              <X size={20} />
            </button>
          </div>

          {/* Step 1: Sign In */}
          {step === 1 && (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-base-content/70 text-center">
                Přihlaste se ke svému Google účtu pro přístup ke kalendářům.
              </p>
              <button onClick={handleGoogleSignIn} className="btn btn-primary gap-2" disabled={loading}>
                {loading ? <span className="loading loading-spinner loading-sm" /> : <LogIn size={18} />}
                Přihlásit se přes Google
              </button>
            </div>
          )}

          {/* Step 2: Select Calendar */}
          {step === 2 && (
            <div className="space-y-2">
              <p className="text-base-content/70 mb-3">Vyberte kalendář:</p>
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md" />
                </div>
              ) : (
                <div className="space-y-1">
                  {calendars.map((cal) => (
                    <button
                      key={cal.id}
                      onClick={() => handleSelectCalendar(cal.id)}
                      className="btn btn-ghost justify-between w-full text-left"
                    >
                      <span>{cal.summary}</span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Events Table */}
          {step === 3 && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md" />
                </div>
              ) : rows.length === 0 ? (
                <p className="text-center text-base-content/70 py-8">Žádné nadcházející události.</p>
              ) : (
                <>
                  <div className="overflow-x-auto max-h-96">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm"
                              checked={rows.every((r) => r.selected)}
                              onChange={(e) => setRows((prev) => prev.map((r) => ({ ...r, selected: e.target.checked })))}
                            />
                          </th>
                          <th>Název</th>
                          <th>Odkaz</th>
                          <th>Datum události</th>
                          <th>Viditelné od</th>
                          <th>Vyprší</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr key={row.eventId} className={row.selected ? '' : 'opacity-50'}>
                            <td>
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={row.selected}
                                onChange={(e) => updateRow(idx, { selected: e.target.checked })}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="input input-xs input-bordered w-full min-w-40"
                                value={row.title}
                                maxLength={100}
                                onChange={(e) => updateRow(idx, { title: e.target.value })}
                              />
                            </td>
                            <td>
                              <input
                                type="url"
                                className="input input-xs input-bordered w-full min-w-32"
                                value={row.link}
                                placeholder="https://..."
                                onChange={(e) => updateRow(idx, { link: e.target.value })}
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                className="input input-xs input-bordered"
                                value={row.eventDate}
                                onChange={(e) => updateRow(idx, { eventDate: e.target.value })}
                              />
                            </td>
                            <td className="text-xs text-base-content/60">
                              {toLocalDateString(new Date(row.visibleFrom))}
                            </td>
                            <td className="text-xs text-base-content/60">
                              {toLocalDateString(new Date(row.expiresAt))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-base-content/70">
                      Vybráno: {selectedCount} / {rows.length}
                    </span>
                    <button
                      onClick={handleImport}
                      className="btn btn-primary gap-2"
                      disabled={submitting || selectedCount === 0}
                    >
                      {submitting ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <Check size={18} />
                      )}
                      Přidat vybrané ({selectedCount})
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
