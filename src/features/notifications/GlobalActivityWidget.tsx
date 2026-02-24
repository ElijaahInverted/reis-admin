import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';
import { Eye, MousePointer2, MessageSquarePlus } from 'lucide-react';

interface GlobalActivityWidgetProps {
  currentAssociationId: string | null;
  isReisAdmin?: boolean;
}

interface ActivityItem extends Tables<'notifications'> {
  association_name?: string;
}

export default function GlobalActivityWidget({ currentAssociationId, isReisAdmin }: GlobalActivityWidgetProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      try {
        let query = supabase
          .from('notifications')
          .select('*')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        if (!isReisAdmin && currentAssociationId) {
          query = query.neq('association_id', currentAssociationId);
        }

        const { data: notifications, error: nError } = await query;
        if (nError) throw nError;

        if (notifications && notifications.length > 0) {
          const assocIds = Array.from(new Set(notifications.map(n => n.association_id)));
          const { data: associations, error: aError } = await supabase
            .from('spolky_accounts')
            .select('association_id, association_name')
            .in('association_id', assocIds);

          if (aError) throw aError;

          setActivities(notifications.map(n => ({
            ...n,
            association_name: associations?.find(a => a.association_id === n.association_id)?.association_name || 'Neznámý spolek'
          })));
        } else {
          setActivities([]);
        }
      } catch (err) {
        console.error('Error fetching global activity:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [currentAssociationId, isReisAdmin]);

  if (loading) {
    return (
      <div className="card bg-base-200/50 border border-base-content/5 animate-pulse">
        <div className="card-body py-4 px-6">
          <div className="h-4 bg-base-300 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-base-300 rounded w-full"></div>
          <div className="h-3 bg-base-300 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card bg-base-200 border border-dashed border-base-content/20 shadow-sm overflow-hidden">
        <div className="card-body py-4 px-6 flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-base-300/30 flex items-center justify-center text-base-content/30">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-base-content/70">
              Zatím žádná nedávná aktivita od ostatních.
            </p>
            <p className="text-xs text-base-content/50">
              Buďte první, kdo inspiruje ostatní svým příspěvkem!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-sm border border-base-content/10">
      <div className="card-body p-0">
        <div className="px-6 pt-4 pb-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            {isReisAdmin ? 'Všechna aktivita' : 'Aktivita spolků'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Spolek</th>
                <th>Událost</th>
                <th className="text-center"><span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" /> Zobrazení</span></th>
                <th className="text-center"><span className="inline-flex items-center gap-1"><MousePointer2 className="w-4 h-4" /> Kliky</span></th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id} className="hover">
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar flex-shrink-0">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-base-200 border border-base-300">
                          <img
                            src={`/spolky/${a.association_id}.jpg`}
                            alt={a.association_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerText = a.association_name?.[0] || '?';
                                parent.className = "w-full h-full flex items-center justify-center text-xs font-bold text-primary";
                              }
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium truncate max-w-32">{a.association_name}</span>
                    </div>
                  </td>
                  <td className="text-sm truncate max-w-48">{a.title}</td>
                  <td className="text-center font-semibold">{a.view_count || 0}</td>
                  <td className="text-center font-semibold">{a.click_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
