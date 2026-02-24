import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, X, Send } from 'lucide-react';
import { computeDates, toLocalDateString } from '@/lib/utils';
import DatePicker from '@/components/DatePicker';

interface NotificationFormProps {
  associationId: string | null;
  onRefresh: () => void;
}

export default function NotificationForm({ associationId, onRefresh }: NotificationFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associationId || !eventDate) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { visibleFrom, expiresAt } = computeDates(eventDate);

      const { error } = await supabase.from('notifications').insert([{
        association_id: associationId,
        title: title,
        body: title,
        link: link || null,
        visible_from: visibleFrom,
        expires_at: expiresAt,
        created_by: session?.user?.email || 'unknown',
      }]);

      if (error) throw error;

      toast.success('Událost byla naplánována');
      setTitle('');
      setLink('');
      setEventDate('');
      setIsExpanded(false);
      onRefresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Chyba při ukládání';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
  };

  const todayStr = toLocalDateString(new Date());

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="btn btn-primary w-full gap-2 shadow-sm animate-fade-in"
      >
        <Plus size={20} />
        Vytvořit novou událost
      </button>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md border border-base-content/10 animate-fade-in-up">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title text-xl">Nová událost</h2>
          <button onClick={handleCancel} className="btn btn-ghost btn-sm btn-square">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label pt-0 pb-1">
              <span className="label-text font-semibold">Datum události *</span>
            </label>
            <DatePicker
              value={eventDate}
              onChange={setEventDate}
              min={todayStr}
            />
          </div>

          <div className="form-control">
            <label className="label pt-0 pb-1">
              <span className="label-text font-semibold">Zpráva *</span>
              <span className={`label-text-alt text-sm ${title.length > 30 ? 'text-warning font-bold' : 'opacity-70'}`}>
                {title.length}/35
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Např. Přijďte na náš event!"
              className="input input-bordered w-full"
              required
              maxLength={35}
              autoFocus
            />
            <div className="label pt-1 pb-0">
              <span className="label-text-alt text-xs text-base-content/50">
                Krátký text — dlouhý se v okně zkrátí.
              </span>
            </div>
          </div>

          <div className="form-control">
            <label className="label pt-0 pb-1">
              <span className="label-text font-semibold">Odkaz</span>
              <span className="label-text-alt text-xs text-base-content/50">
                Lze přidat i později
              </span>
            </label>
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://..."
              className="input input-bordered w-full"
              maxLength={200}
            />
          </div>

          <div className="card-actions justify-end pt-2 border-t border-base-200">
            <button type="button" onClick={handleCancel} className="btn btn-ghost" disabled={submitting}>
              Zrušit
            </button>
            <button type="submit" className="btn btn-primary gap-2 px-8" disabled={submitting || !eventDate}>
              {submitting ? <span className="loading loading-spinner"></span> : (
                <>
                  <Send size={18} />
                  Naplánovat
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
