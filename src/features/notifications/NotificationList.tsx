import { useState } from 'react';
import { Trash2, Eye, MousePointer2, BellOff, Check, X, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Tables } from '@/lib/database.types';
import { computeDates, toLocalDateString } from '@/lib/utils';

interface NotificationListProps {
  notifications: Tables<'notifications'>[];
  onDelete: () => void;
}

interface EditState {
  id: string;
  title: string;
  date: string;
  link: string;
}

function needsLink(n: Tables<'notifications'>): boolean {
  return !n.link && new Date(n.expires_at) >= new Date();
}

export default function NotificationList({ notifications, onDelete }: NotificationListProps) {
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  const active = notifications.filter(n => new Date(n.expires_at) >= new Date());

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu smazat tuto událost?')) return;
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      toast.success('Událost smazána');
      onDelete();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Chyba mazání');
    }
  };

  const startEdit = (n: Tables<'notifications'>) => {
    setEditing({
      id: n.id,
      title: n.title,
      date: toLocalDateString(new Date(n.expires_at)),
      link: n.link || '',
    });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing || !editing.date || !editing.title) return;
    setSaving(true);
    try {
      const { visibleFrom, expiresAt } = computeDates(editing.date);
      const { error } = await supabase
        .from('notifications')
        .update({
          title: editing.title,
          body: editing.title,
          link: editing.link || null,
          visible_from: visibleFrom,
          expires_at: expiresAt,
        })
        .eq('id', editing.id);
      if (error) throw error;
      toast.success('Uloženo');
      setEditing(null);
      onDelete();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  if (!active.length) {
    return (
      <div className="text-center py-8 opacity-40">
        <BellOff className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Žádné aktivní události</p>
      </div>
    );
  }

  const sorted = [...active].sort((a, b) => {
    const aN = needsLink(a) ? 0 : 1;
    const bN = needsLink(b) ? 0 : 1;
    return aN - bN;
  });

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Událost</th>
            <th className="w-28">Datum</th>
            <th className="w-24">Stav</th>
            <th className="text-center w-16"><Eye className="w-4 h-4 inline" /></th>
            <th className="text-center w-16"><MousePointer2 className="w-4 h-4 inline" /></th>
            <th>Odkaz</th>
            <th className="w-24"></th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((n) => {
            const missing = needsLink(n);
            const isEditing = editing?.id === n.id;

            if (isEditing) {
              return (
                <tr key={n.id} className="bg-base-200/50">
                  <td>
                    <input
                      type="text"
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      className="input input-sm input-bordered w-full min-w-40"
                      maxLength={100}
                      autoFocus
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editing.date}
                      onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                      min={toLocalDateString(new Date())}
                      className="input input-sm input-bordered [color-scheme:dark] cursor-pointer"
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    <input
                      type="url"
                      value={editing.link}
                      onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                      placeholder="https://..."
                      className="input input-sm input-bordered w-full"
                      maxLength={200}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary gap-1" onClick={saveEdit} disabled={saving}>
                      {saving ? <span className="loading loading-spinner loading-sm" /> : <Check size={16} />}
                      Uložit
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-ghost btn-square" onClick={cancelEdit}>
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={n.id}>
                <td className="font-medium">{n.title}</td>
                <td className="text-sm text-base-content/70">
                  {new Date(n.expires_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                </td>
                <td>
                  {missing
                    ? <span className="badge badge-outline badge-sm font-bold text-warning border-warning whitespace-nowrap">Chybí odkaz</span>
                    : <span className="badge badge-success badge-sm font-bold text-success-content whitespace-nowrap">Připraveno</span>}
                </td>
                <td className="text-center font-semibold">{n.view_count || 0}</td>
                <td className="text-center font-semibold">{n.click_count || 0}</td>
                <td>
                  {n.link ? (
                    <a href={n.link} target="_blank" rel="noopener noreferrer" className="link link-hover text-xs truncate max-w-48 block">
                      {n.link}
                    </a>
                  ) : (
                    <span className="text-xs text-base-content/30">—</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-ghost btn-xs gap-1" onClick={() => startEdit(n)}>
                    <Pencil size={12} /> Upravit
                  </button>
                </td>
                <td>
                  <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => handleDelete(n.id)} title="Smazat">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
