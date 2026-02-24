import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CalendarDays } from 'lucide-react';
import NotificationForm from './NotificationForm';
import NotificationList from './NotificationList';
import CalendarImportModal from './CalendarImportModal';
import GlobalActivityWidget from './GlobalActivityWidget';
import { Tables } from '@/lib/database.types';

interface NotificationsViewProps {
  associationId: string | null;
  isReisAdmin: boolean;
  isGhosting: boolean;
}

export default function NotificationsView({ associationId, isReisAdmin, isGhosting }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Tables<'notifications'>[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isReisAdmin && !associationId) return;
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!isReisAdmin || isGhosting) query = query.eq('association_id', associationId!);
      const { data, error } = await query;

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: unknown) {
      console.error('Fetch error:', error);
      toast.error('Chyba načítání dat');
    } finally {
      setLoading(false);
    }
  }, [associationId, isReisAdmin, isGhosting]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (!isReisAdmin && !associationId) {
    return <div className="skeleton w-full h-32 rounded-box opacity-50"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Events list first */}
      <div className="space-y-4">
        <h3 className="font-bold text-xl px-1 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Vaše události
        </h3>

        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-20 w-full rounded-box opacity-20"></div>
            <div className="skeleton h-20 w-full rounded-box opacity-20"></div>
          </div>
        ) : (
          <NotificationList notifications={notifications} onDelete={fetchNotifications} isReisAdmin={isReisAdmin} />
        )}
      </div>

      {/* Create form + calendar import */}
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3">
          <NotificationForm associationId={associationId} onSuccess={fetchNotifications} />
        </div>
        {associationId && (
          <CalendarImportModal associationId={associationId} onSuccess={fetchNotifications} />
        )}
      </div>

      {/* Activity from other spolky */}
      <GlobalActivityWidget currentAssociationId={associationId} isReisAdmin={isReisAdmin} />
    </div>
  );
}
