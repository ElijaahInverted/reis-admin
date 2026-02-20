import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, RefreshCw, Plus, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';

type AvailabilityRow = Tables<'study_jam_availability'>;

interface TutoringMatchRow {
  course_code: string;
  semester_id: string;
}

interface CourseAggregate {
  course_code: string;
  tutorCount: number;
  tuteeCount: number;
  matchedCount: number;
  oldestAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function aggregate(rows: AvailabilityRow[], matchRows: TutoringMatchRow[]): CourseAggregate[] {
  const map = new Map<string, CourseAggregate>();
  for (const row of rows) {
    const existing = map.get(row.course_code);
    if (!existing) {
      map.set(row.course_code, {
        course_code: row.course_code,
        tutorCount: row.role === 'tutor' ? 1 : 0,
        tuteeCount: row.role === 'tutee' ? 1 : 0,
        matchedCount: 0,
        oldestAt: row.created_at,
      });
    } else {
      if (row.role === 'tutor') existing.tutorCount++;
      if (row.role === 'tutee') existing.tuteeCount++;
      if (row.created_at < existing.oldestAt) existing.oldestAt = row.created_at;
    }
  }
  for (const match of matchRows) {
    const existing = map.get(match.course_code);
    if (existing) {
      existing.matchedCount++;
    } else {
      map.set(match.course_code, {
        course_code: match.course_code,
        tutorCount: 0,
        tuteeCount: 0,
        matchedCount: 1,
        oldestAt: new Date().toISOString(),
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.course_code.localeCompare(b.course_code));
}

export default function AvailabilityList() {
  const [rows, setRows] = useState<CourseAggregate[]>([]);
  const [rawRows, setRawRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [addForm, setAddForm] = useState({ studium: '', course_code: '', role: 'tutor' as 'tutor' | 'tutee', semester_id: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [availResult, matchResult] = await Promise.all([
        supabase.from('study_jam_availability').select('*'),
        supabase.from('tutoring_matches').select('course_code, semester_id'),
      ]);
      if (availResult.error) throw availResult.error;
      const availData = availResult.data || [];
      const matchRows: TutoringMatchRow[] = matchResult.data ?? [];
      setRawRows(availData);
      setRows(aggregate(availData, matchRows));
      setLastRefresh(new Date());
    } catch (e) {
      console.error('[AvailabilityList] fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.studium.trim() || !addForm.course_code.trim() || !addForm.semester_id.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('study_jam_availability').insert({
        studium: addForm.studium.trim(),
        course_code: addForm.course_code.trim(),
        role: addForm.role,
        semester_id: addForm.semester_id.trim(),
      });
      if (error) throw error;
      toast.success(`${addForm.role} ${addForm.studium} přidán pro ${addForm.course_code}`);
      setAddForm(f => ({ ...f, studium: '' }));
      fetchData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMatch = async (courseCode: string) => {
    const tutors = rawRows.filter(r => r.course_code === courseCode && r.role === 'tutor');
    const tutees = rawRows.filter(r => r.course_code === courseCode && r.role === 'tutee');
    if (tutors.length === 0 || tutees.length === 0) return;
    const tutor = tutors[Math.floor(Math.random() * tutors.length)];
    const tutee = tutees[Math.floor(Math.random() * tutees.length)];
    setMatching(courseCode);
    try {
      const { error: matchError } = await supabase.from('tutoring_matches').insert({
        tutor_studium: tutor.studium,
        tutee_studium: tutee.studium,
        course_code: courseCode,
        semester_id: tutor.semester_id,
      });
      if (matchError) throw matchError;
      await Promise.all([
        supabase.from('study_jam_availability').delete().eq('id', tutor.id),
        supabase.from('study_jam_availability').delete().eq('id', tutee.id),
      ]);
      toast.success(`Spárováno: tutor ${tutor.studium} ↔ tutee ${tutee.studium} (${courseCode})`);
      fetchData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Chyba při párování');
    } finally {
      setMatching(null);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-xl flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Opt-ins (Study Jam Availability)
        </h3>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-base-content/40">
              Obnoveno {lastRefresh.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn btn-ghost btn-sm gap-1"
            title="Obnovit"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </button>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end">
            <div className="form-control min-w-28">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-semibold">Studium *</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder="např. 12345"
                value={addForm.studium}
                onChange={(e) => setAddForm(f => ({ ...f, studium: e.target.value }))}
                required
              />
            </div>
            <div className="form-control min-w-28">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-semibold">Kód předmětu *</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder="např. AF1"
                value={addForm.course_code}
                onChange={(e) => setAddForm(f => ({ ...f, course_code: e.target.value }))}
                required
              />
            </div>
            <div className="form-control min-w-24">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-semibold">Role *</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={addForm.role}
                onChange={(e) => setAddForm(f => ({ ...f, role: e.target.value as 'tutor' | 'tutee' }))}
              >
                <option value="tutor">Tutor</option>
                <option value="tutee">Tutee</option>
              </select>
            </div>
            <div className="form-control min-w-24">
              <label className="label pt-0 pb-1">
                <span className="label-text text-xs font-semibold">Období *</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder="např. 801"
                value={addForm.semester_id}
                onChange={(e) => setAddForm(f => ({ ...f, semester_id: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm gap-1 self-end mb-0.5"
              disabled={submitting}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Přidat
            </button>
          </form>
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <div className="space-y-2">
          <div className="skeleton h-10 w-full rounded-box opacity-20"></div>
          <div className="skeleton h-10 w-full rounded-box opacity-20"></div>
        </div>
      ) : rows.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center py-12">
            <Users className="w-10 h-10 text-base-content/30 mb-2" />
            <p className="text-base-content/60">Žádné opt-iny</p>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="border-b border-base-300">
                  <th className="font-semibold text-base-content/70">Předmět</th>
                  <th className="font-semibold text-base-content/70 text-center">Tutoři čekají</th>
                  <th className="font-semibold text-base-content/70 text-center">Tutees čekají</th>
                  <th className="font-semibold text-base-content/70 text-center">Párováno</th>
                  <th className="font-semibold text-base-content/70">Nejstarší záznam</th>
                  <th className="font-semibold text-base-content/70 text-center">Akce</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.course_code} className="border-b border-base-200 hover:bg-base-200/40 transition-colors">
                    <td>
                      <span className="badge badge-outline font-mono text-xs">{row.course_code}</span>
                    </td>
                    <td className="text-center">
                      {row.tutorCount > 0 ? (
                        <span className="badge badge-success badge-sm font-semibold">{row.tutorCount}</span>
                      ) : (
                        <span className="text-base-content/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {row.tuteeCount > 0 ? (
                        <span className="badge badge-warning badge-sm font-semibold">{row.tuteeCount}</span>
                      ) : (
                        <span className="text-base-content/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {row.matchedCount > 0 ? (
                        <span className="badge badge-info badge-sm font-semibold">{row.matchedCount}</span>
                      ) : (
                        <span className="text-base-content/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="text-xs text-base-content/60">{formatDate(row.oldestAt)}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleMatch(row.course_code)}
                        disabled={row.tutorCount === 0 || row.tuteeCount === 0 || matching === row.course_code}
                        className="btn btn-xs btn-primary gap-1"
                        title="Náhodně spárovat 1 tutora + 1 tutea"
                      >
                        {matching === row.course_code ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Shuffle className="w-3 h-3" />
                        )}
                        Párovat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
