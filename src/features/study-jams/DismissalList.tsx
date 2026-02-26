import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Ban, RefreshCw, Trash2, User, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface DismissalRow {
  id: string;
  student_id: string;
  course_code: string;
  created_at: string;
}

export default function DismissalList() {
  const [dismissals, setDismissals] = useState<DismissalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Bypassing stale types by using any for the from() call
      const { data, error } = await (supabase.from('study_jam_dismissals' as any))
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDismissals((data as any[]) || []);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('[DismissalList] fetch error', e);
      toast.error('Chyba při načítání odmitnutí');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRevert = async (id: string, studentId: string, courseCode: string) => {
    try {
      const { error } = await (supabase.from('study_jam_dismissals' as any))
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Odmitnutí studenta ${studentId} pro ${courseCode} zrušeno`);
      fetchData();
    } catch (e) {
      console.error('[DismissalList] revert error', e);
      toast.error('Chyba při rušení odmitnutí');
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-xl flex items-center gap-2">
          <Ban className="w-5 h-5 text-error" />
          Odmitnutí (Dismissals)
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
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </button>
        </div>
      </div>

      {loading && dismissals.length === 0 ? (
        <div className="space-y-2">
          <div className="skeleton h-12 w-full rounded-box opacity-20"></div>
          <div className="skeleton h-12 w-full rounded-box opacity-20"></div>
          <div className="skeleton h-12 w-full rounded-box opacity-20"></div>
        </div>
      ) : dismissals.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center py-12">
            <Ban className="w-10 h-10 text-base-content/30 mb-2" />
            <p className="text-base-content/60">Žádná odmitnutí</p>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="border-b border-base-300">
                  <th className="font-semibold text-base-content/70">Student ID</th>
                  <th className="font-semibold text-base-content/70">Předmět</th>
                  <th className="font-semibold text-base-content/70">Datum</th>
                  <th className="font-semibold text-base-content/70 text-center">Akce</th>
                </tr>
              </thead>
              <tbody>
                {dismissals.map((d) => (
                  <tr key={d.id} className="border-b border-base-200 hover:bg-base-200/40 transition-colors">
                    <td>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-base-content/40" />
                        <span className="font-mono text-sm">{d.student_id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-base-content/40" />
                        <span className="badge badge-outline badge-sm font-mono">{d.course_code}</span>
                      </div>
                    </td>
                    <td className="text-xs text-base-content/60">
                      {new Date(d.created_at).toLocaleString('cs-CZ')}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleRevert(d.id, d.student_id, d.course_code)}
                        className="btn btn-xs btn-ghost text-error hover:bg-error/10 gap-1"
                        title="Zrušit odmitnutí"
                      >
                        <Trash2 className="w-3 h-3" />
                        Zrušit
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
