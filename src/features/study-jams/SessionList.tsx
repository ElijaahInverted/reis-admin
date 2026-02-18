import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, Plus, X, Pencil, Ban } from 'lucide-react';
import { Tables } from '@/lib/database.types';

type KillerCourse = Tables<'killer_courses'>;

type SessionWithCourse = Tables<'study_jam_sessions'> & {
  killer_courses: Pick<KillerCourse, 'course_code' | 'course_name'> | null;
};

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-error',
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Naplánováno',
  completed: 'Dokončeno',
  cancelled: 'Zrušeno',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SessionList() {
  const [sessions, setSessions] = useState<SessionWithCourse[]>([]);
  const [courses, setCourses] = useState<KillerCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editSession, setEditSession] = useState<SessionWithCourse | null>(null);
  const editModalRef = useRef<HTMLDialogElement>(null);

  const emptyForm = {
    killer_course_id: '',
    location: '',
    scheduled_at: '',
    max_participants: 6,
    notes: '',
  };
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({
    killer_course_id: '',
    location: '',
    scheduled_at: '',
    max_participants: 6,
    notes: '',
    status: 'scheduled',
  });

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('study_jam_sessions')
        .select('*, killer_courses(course_code, course_name)')
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      setSessions((data as SessionWithCourse[]) || []);
    } catch {
      toast.error('Chyba načítání sessiony');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    const { data } = await supabase
      .from('killer_courses')
      .select('*')
      .eq('is_active', true)
      .order('course_code');
    setCourses(data || []);
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchCourses();
  }, [fetchSessions, fetchCourses]);

  useEffect(() => {
    if (editSession) {
      setEditForm({
        killer_course_id: editSession.killer_course_id,
        location: editSession.location,
        scheduled_at: toDatetimeLocal(editSession.scheduled_at),
        max_participants: editSession.max_participants,
        notes: editSession.notes ?? '',
        status: editSession.status,
      });
      editModalRef.current?.showModal();
    } else {
      editModalRef.current?.close();
    }
  }, [editSession]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.killer_course_id || !createForm.location || !createForm.scheduled_at) return;
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from('study_jam_sessions').insert({
        killer_course_id: createForm.killer_course_id,
        location: createForm.location.trim(),
        scheduled_at: new Date(createForm.scheduled_at).toISOString(),
        max_participants: createForm.max_participants,
        notes: createForm.notes.trim() || null,
        created_by: session?.user?.email || 'unknown',
      });
      if (error) throw error;
      toast.success('Session vytvořena');
      setCreateForm(emptyForm);
      setIsExpanded(false);
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Chyba při ukládání');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSession) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('study_jam_sessions')
        .update({
          killer_course_id: editForm.killer_course_id,
          location: editForm.location.trim(),
          scheduled_at: new Date(editForm.scheduled_at).toISOString(),
          max_participants: editForm.max_participants,
          notes: editForm.notes.trim() || null,
          status: editForm.status,
        })
        .eq('id', editSession.id);
      if (error) throw error;
      toast.success('Session uložena');
      setEditSession(null);
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Chyba při ukládání');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (session: SessionWithCourse) => {
    if (!confirm(`Zrušit session "${session.killer_courses?.course_code}" dne ${formatDate(session.scheduled_at)}?`)) return;
    const { error } = await supabase
      .from('study_jam_sessions')
      .update({ status: 'cancelled' })
      .eq('id', session.id);
    if (error) {
      toast.error(error.message || 'Chyba');
    } else {
      toast.success('Session zrušena');
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, status: 'cancelled' } : s))
      );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-xl px-1 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        Sessiony
      </h3>

      {/* Create form */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="btn btn-primary w-full gap-2 shadow-sm"
        >
          <Plus size={20} />
          Vytvořit novou session
        </button>
      ) : (
        <div className="card bg-base-100 shadow-md border border-base-content/10">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-xl">Nová session</h2>
              <button
                onClick={() => { setIsExpanded(false); setCreateForm(emptyForm); }}
                className="btn btn-ghost btn-sm btn-square"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control sm:col-span-2">
                  <label className="label pt-0 pb-1">
                    <span className="label-text font-semibold">Killer Course *</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={createForm.killer_course_id}
                    onChange={(e) => setCreateForm((f) => ({ ...f, killer_course_id: e.target.value }))}
                    required
                  >
                    <option value="">Vyberte předmět...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.course_code} – {c.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label pt-0 pb-1">
                    <span className="label-text font-semibold">Místo konání *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="např. Budova A, místnost 123"
                    value={createForm.location}
                    onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label pt-0 pb-1">
                    <span className="label-text font-semibold">Datum a čas *</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered w-full"
                    value={createForm.scheduled_at}
                    onChange={(e) => setCreateForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label pt-0 pb-1">
                    <span className="label-text font-semibold">Max. účastníků</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    min={1}
                    max={100}
                    value={createForm.max_participants}
                    onChange={(e) => setCreateForm((f) => ({ ...f, max_participants: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label pt-0 pb-1">
                    <span className="label-text font-semibold">Poznámky</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Volitelné poznámky..."
                    rows={2}
                    value={createForm.notes}
                    onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="card-actions justify-end pt-2 border-t border-base-200">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setIsExpanded(false); setCreateForm(emptyForm); }}
                  disabled={submitting}
                >
                  Zrušit
                </button>
                <button type="submit" className="btn btn-primary gap-2" disabled={submitting}>
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : <Plus size={18} />}
                  Vytvořit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions list */}
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20 w-full rounded-box opacity-20"></div>
          <div className="skeleton h-20 w-full rounded-box opacity-20"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center py-12">
            <Calendar className="w-10 h-10 text-base-content/30 mb-2" />
            <p className="text-base-content/60">Žádné sessiony</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="card bg-base-100 border border-base-300 shadow-sm group"
            >
              <div className="card-body p-4 flex-row items-center gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-outline font-mono text-xs">
                      {session.killer_courses?.course_code ?? '—'}
                    </span>
                    <span className="font-semibold text-sm truncate">
                      {session.killer_courses?.course_name ?? '—'}
                    </span>
                    <span className={`badge badge-sm ${STATUS_BADGE[session.status] ?? 'badge-ghost'}`}>
                      {STATUS_LABEL[session.status] ?? session.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(session.scheduled_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {session.current_count}/{session.max_participants}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-xs text-base-content/50 italic">{session.notes}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setEditSession(session)}
                    className="btn btn-ghost btn-xs"
                    title="Upravit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {session.status === 'scheduled' && (
                    <button
                      onClick={() => handleCancel(session)}
                      className="btn btn-ghost btn-xs text-error/60 hover:text-error hover:bg-error/10"
                      title="Zrušit"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      <dialog ref={editModalRef} className="modal bg-base-300/50 backdrop-blur-sm">
        <div className="modal-box p-0 overflow-hidden border border-base-content/10">
          <div className="flex items-center justify-between p-6 border-b border-base-content/10 bg-base-100">
            <h3 className="font-bold text-lg">Upravit session</h3>
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setEditSession(null)}
              >
                ✕
              </button>
            </form>
          </div>
          <div className="p-6">
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="form-control">
                <label className="label pt-0 pb-1">
                  <span className="label-text font-semibold">Killer Course</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={editForm.killer_course_id}
                  onChange={(e) => setEditForm((f) => ({ ...f, killer_course_id: e.target.value }))}
                  required
                >
                  <option value="">Vyberte předmět...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_code} – {c.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pt-0 pb-1">
                  <span className="label-text font-semibold">Místo konání</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editForm.location}
                  onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label pt-0 pb-1">
                  <span className="label-text font-semibold">Datum a čas</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={editForm.scheduled_at}
                  onChange={(e) => setEditForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label pt-0 pb-1">
                  <span className="label-text font-semibold">Max. účastníků</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  min={1}
                  max={100}
                  value={editForm.max_participants}
                  onChange={(e) => setEditForm((f) => ({ ...f, max_participants: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label pt-0 pb-1">
                  <span className="label-text font-semibold">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="scheduled">Naplánováno</option>
                  <option value="completed">Dokončeno</option>
                  <option value="cancelled">Zrušeno</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label pt-0 pb-1">
                  <span className="label-text font-semibold">Poznámky</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditSession(null)}
                >
                  Zrušit
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : 'Uložit'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setEditSession(null)}>close</button>
        </form>
      </dialog>
    </div>
  );
}
