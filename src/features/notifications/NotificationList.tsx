import { useState } from 'react';
import { Trash2, Eye, MousePointer2, Calendar, Link as LinkIcon, BellOff, Check, X, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';

interface NotificationListProps {
  notifications: Tables<'notifications'>[];
  onDelete: () => void;
  isReisAdmin?: boolean;
}

type NotificationStatus = 'scheduled' | 'active' | 'active_no_link' | 'expired';

function getStatus(n: Tables<'notifications'>): NotificationStatus {
  const now = new Date();
  if (new Date(n.expires_at) < now) return 'expired';
  if (n.visible_from && new Date(n.visible_from) > now) return 'scheduled';
  if (!n.link) return 'active_no_link';
  return 'active';
}

const statusConfig: Record<NotificationStatus, { label: string; className: string }> = {
  scheduled: { label: 'Naplánováno', className: 'badge-warning text-warning-content' },
  active: { label: 'Aktivní', className: 'badge-success text-white' },
  active_no_link: { label: 'Aktivní – chybí odkaz', className: 'badge-warning badge-outline' },
  expired: { label: 'Expirováno', className: 'badge-ghost opacity-60' },
};

export default function NotificationList({ notifications, onDelete, isReisAdmin }: NotificationListProps) {
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkValue, setLinkValue] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu smazat tuto notifikaci?')) return;
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      toast.success('Notifikace smazána');
      onDelete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Chyba mazání';
      toast.error(message);
    }
  };

  const startEditLink = (n: Tables<'notifications'>) => {
    setEditingLinkId(n.id);
    setLinkValue(n.link || '');
  };

  const cancelEditLink = () => {
    setEditingLinkId(null);
    setLinkValue('');
  };

  const saveLink = async (id: string) => {
    setSavingLink(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ link: linkValue || null })
        .eq('id', id);
      if (error) throw error;
      toast.success('Odkaz uložen');
      setEditingLinkId(null);
      onDelete(); // triggers refetch
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Chyba při ukládání odkazu';
      toast.error(message);
    } finally {
      setSavingLink(false);
    }
  };

  if (!notifications?.length) {
    return (
      <div className="card bg-base-100 border border-base-content/10">
        <div className="card-body text-center py-12 opacity-50">
          <BellOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base">Zatím žádné události</p>
          <p className="text-sm opacity-70">Vytvořte první událost výše</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((n) => {
        const status = getStatus(n);
        const badge = statusConfig[status];
        const isEditing = editingLinkId === n.id;

        return (
          <div key={n.id} className="card bg-base-100 shadow-md border border-base-content/10 hover:shadow-lg hover:border-primary/30 transition-all group">
            <div className="card-body flex-row justify-between items-center py-5 px-6">

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-semibold text-base truncate">{n.title}</span>
                  <span className={`badge badge-sm font-bold ${badge.className}`}>{badge.label}</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="badge badge-sm gap-1 font-semibold"><Eye className="w-3.5 h-3.5" /> {n.view_count || 0} zobrazení</span>
                    <span className="badge badge-sm gap-1 font-semibold"><MousePointer2 className="w-3.5 h-3.5" /> {n.click_count || 0} kliků</span>
                  </span>
                  {isReisAdmin && (
                    <span className="badge badge-sm badge-outline font-mono opacity-60" title={n.association_id}>
                      {n.association_id.slice(0, 8)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-base-content/60">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {n.created_at ? new Date(n.created_at).toLocaleDateString('cs-CZ') : '-'}</span>
                  {!isEditing && n.link && (
                    <a href={n.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <LinkIcon className="w-4 h-4" /> Odkaz
                    </a>
                  )}
                </div>

                {/* Inline link editing */}
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="url"
                      value={linkValue}
                      onChange={(e) => setLinkValue(e.target.value)}
                      placeholder="https://..."
                      className="input input-sm input-bordered flex-1"
                      maxLength={200}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); saveLink(n.id); }
                        if (e.key === 'Escape') cancelEditLink();
                      }}
                    />
                    <button
                      className="btn btn-sm btn-primary btn-square"
                      onClick={() => saveLink(n.id)}
                      disabled={savingLink}
                    >
                      {savingLink ? <span className="loading loading-spinner loading-xs" /> : <Check size={16} />}
                    </button>
                    <button className="btn btn-sm btn-ghost btn-square" onClick={cancelEditLink}>
                      <X size={16} />
                    </button>
                  </div>
                ) : status !== 'expired' && (
                  <button
                    className="btn btn-xs btn-ghost gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => startEditLink(n)}
                  >
                    <Pencil size={12} />
                    {n.link ? 'Upravit odkaz' : 'Přidat odkaz'}
                  </button>
                )}
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
