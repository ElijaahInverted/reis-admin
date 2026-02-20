import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, RefreshCw } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [availResult, matchResult] = await Promise.all([
        supabase.from('study_jam_availability').select('*'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from('tutoring_matches').select('course_code, semester_id'),
      ]);
      if (availResult.error) throw availResult.error;
      const matchRows: TutoringMatchRow[] = matchResult.data ?? [];
      setRows(aggregate(availResult.data || [], matchRows));
      setLastRefresh(new Date());
    } catch (e) {
      console.error('[AvailabilityList] fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

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
