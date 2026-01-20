import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import NotificationForm from './NotificationForm';
import NotificationList from './NotificationList';
import { Tables } from '@/lib/database.types';

interface NotificationsViewProps {
  associationId: string | null;
}

export default function NotificationsView({ associationId }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Tables<'notifications'>[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!associationId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Chyba načítání dat');
    } finally {
      setLoading(false);
    }
  }, [associationId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (!associationId) {
    return <div className="skeleton w-full h-32 rounded-box opacity-50"></div>;
  }

  return (
    <>
      <NotificationForm associationId={associationId} onSuccess={fetchNotifications} />
      
      <div className="space-y-4 pt-8">
        <h3 className="font-bold text-xl px-1 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Aktivní notifikace
        </h3>
        
        {loading ? (
             <div className="space-y-3">
                <div className="skeleton h-20 w-full rounded-box opacity-20"></div>
                <div className="skeleton h-20 w-full rounded-box opacity-20"></div>
             </div>
        ) : (
            <NotificationList notifications={notifications} onDelete={fetchNotifications} />
        )}
      </div>
    </>
  );
}
