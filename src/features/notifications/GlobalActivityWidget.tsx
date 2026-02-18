import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';
import { ChevronRight, ChevronLeft, MessageSquarePlus } from 'lucide-react';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      try {
        // 1. Fetch recent non-expired notifications
        let query = supabase
          .from('notifications')
          .select('*')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        // If not admin, exclude own notifications to show OTHER associations' activity
        if (!isReisAdmin && currentAssociationId) {
          query = query.neq('association_id', currentAssociationId);
        }

        const { data: notifications, error: nError } = await query;
        if (nError) throw nError;

        if (notifications && notifications.length > 0) {
          // 2. Fetch association names for these notifications
          const assocIds = Array.from(new Set(notifications.map(n => n.association_id)));
          const { data: associations, error: aError } = await supabase
            .from('spolky_accounts')
            .select('association_id, association_name')
            .in('association_id', assocIds);
          
          if (aError) throw aError;

          const enrichedActivities = notifications.map(n => ({
            ...n,
            association_name: associations?.find(a => a.association_id === n.association_id)?.association_name || 'Neznámý spolek'
          }));

          setActivities(enrichedActivities);
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

  const next = () => setCurrentIndex((prev) => (prev + 1) % activities.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + activities.length) % activities.length);

  if (loading) {
    return (
      <div className="card bg-base-200/50 border border-base-content/5 animate-pulse">
        <div className="card-body py-4 px-6 flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-base-300"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-base-300 rounded w-1/3"></div>
            <div className="h-3 bg-base-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state: "Spur to post"
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

  const current = activities[currentIndex];
  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `před ${diffDays} d${diffDays === 1 ? 'nem' : diffDays < 5 ? 'ny' : 'ní'}`;
    if (diffHours > 0) return `před ${diffHours} h`;
    return `před ${diffMins} min`;
  };

  return (
    <div className="card bg-primary/5 border border-primary/20 shadow-sm overflow-hidden group">
      <div className="card-body py-4 px-6">
        <div className="flex items-center justify-between gap-4">
          <div 
            key={current.id} 
            className="flex items-center gap-4 flex-1 min-w-0 animate-in fade-in slide-in-from-right-8 duration-300"
          >
            {/* Association Avatar */}
            <div className="avatar flex-shrink-0">
              <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-200 border border-base-300 flex items-center justify-center">
                <img
                  src={`/spolky/${current.association_id}.jpg`}
                  alt={current.association_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerText = current.association_name?.[0] || '?';
                      parent.className = "w-full h-full flex items-center justify-center font-bold text-primary";
                    }
                  }}
                />
              </div>
            </div>

            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {isReisAdmin ? 'Všechna aktivita' : 'Aktivita spolků'}
                </span>
                <span className="text-[10px] opacity-40">•</span>
                <span className="text-xs opacity-50 font-medium">{timeAgo(current.created_at)}</span>
              </div>
              <p className="text-sm font-semibold truncate text-base-content mt-0.5">
                {current.association_name} <span className="font-normal opacity-70">přidal(a):</span> {current.title}
              </p>
            </div>
          </div>

          {/* Navigation Controls - More Visible */}
          {activities.length > 1 && (
            <div className="flex items-center gap-2 bg-base-200/50 p-1 rounded-full border border-base-content/5">
              <button 
                onClick={prev}
                className="btn btn-ghost btn-xs btn-circle bg-base-100 hover:bg-primary/20 hover:text-primary shadow-sm"
                title="Předchozí"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold opacity-60 px-1 min-w-[32px] text-center">
                {currentIndex + 1}/{activities.length}
              </span>
              <button 
                onClick={next}
                className="btn btn-ghost btn-xs btn-circle bg-base-100 hover:bg-primary/20 hover:text-primary shadow-sm"
                title="Další"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-0.5 bg-primary/10 w-full overflow-hidden">
        <div 
          className="h-full bg-primary/40 transition-all duration-500 ease-out" 
          style={{ width: `${((currentIndex + 1) / activities.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
