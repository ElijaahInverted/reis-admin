import { Trash2, Eye, MousePointer2, Calendar, Link as LinkIcon, BellOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';

interface NotificationListProps {
  notifications: Tables<'notifications'>[];
  onDelete: () => void;
  isReisAdmin?: boolean;
}

export default function NotificationList({ notifications, onDelete, isReisAdmin: _isReisAdmin }: NotificationListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu smazat tuto notifikaci?')) return;

    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      toast.success('Notifikace smazána');
      onDelete();
    } catch (error: any) {
      toast.error('Chyba mazání: ' + error.message);
    }
  };

  if (!notifications?.length) {
    return (
        <div className="card bg-base-100 border border-base-content/10">
            <div className="card-body text-center py-12 opacity-50">
            <BellOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base">Zatím žádné notifikace</p>
            <p className="text-sm opacity-70">Vytvořte první notifikaci výše</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((n) => {
        const isExpired = new Date(n.expires_at) < new Date();
        return (
          <div key={n.id} className="card bg-base-100 shadow-md border border-base-content/10 hover:shadow-lg hover:border-primary/30 transition-all group">
            <div className="card-body flex-row justify-between items-center py-5 px-6">
              
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-base truncate">{n.title}</span>
                  {isExpired 
                    ? <span className="badge badge-sm badge-ghost font-bold opacity-60">Expirováno</span> 
                    : <span className="badge badge-sm badge-success font-bold text-white">Aktivní</span>}
                </div>

                
                <div className="flex items-center gap-4 text-sm opacity-60 group-hover:opacity-80 transition-opacity">
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {n.view_count || 0}</span>
                  <span className="flex items-center gap-1"><MousePointer2 className="w-4 h-4" /> {n.click_count || 0}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {n.created_at ? new Date(n.created_at).toLocaleDateString('cs-CZ') : '-'}</span>
                  {n.link && (
                    <a href={n.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <LinkIcon className="w-4 h-4" /> Odkaz
                    </a>
                  )}
                </div>
              </div>

              <button 
                className="btn btn-ghost btn-sm btn-square text-error opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={() => handleDelete(n.id)} 
                title="Smazat"
              >
                <Trash2 className="w-4 h-4" />
              </button>

            </div>
          </div>
        );
      })}
    </div>
  );
}
