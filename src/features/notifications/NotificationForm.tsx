import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, X, Send, Link as LinkIcon, Calendar } from 'lucide-react';
import NotificationPreview from './NotificationPreview';

interface NotificationFormProps {
  associationId: string | null;
  associationName?: string;
  onSuccess: () => void;
}

export default function NotificationForm({ associationId, associationName, onSuccess }: NotificationFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associationId) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from('notifications').insert([{
        association_id: associationId,
        title: title,
        body: title,
        link: link || null,
        expires_at: new Date(expiresAt).toISOString(),
        created_by: session?.user?.email || 'unknown',
      }]);

      if (error) throw error;

      toast.success('Notifikace byla publikována');
      setTitle('');
      setLink('');
      // Keep expanded if user wants to send another, or collapse? 
      // Let's collapse for cleaner UX or ask user. For now, collapse.
      setIsExpanded(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Chyba při ukládání');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    // Optional: clear fields? standard behavior is usually keeping draft
  };

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="btn btn-primary w-full gap-2 shadow-sm animate-fade-in"
      >
        <Plus size={20} />
        Vytvořit novou notifikaci
      </button>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md border border-base-content/10 animate-fade-in-up">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title text-xl">Nová notifikace</h2>
          <button onClick={handleCancel} className="btn btn-ghost btn-sm btn-square">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* LEFT COLUMN: Inputs */}
            <div className="flex-1 space-y-5">
              
              {/* Message Input */}
              <div className="form-control">
                <label className="label pt-0 pb-1">
                  <span className="label-text font-semibold">Zpráva notifikace *</span>
                  <span className={`label-text-alt text-sm ${title.length > 90 ? 'text-warning' : 'opacity-70'}`}>
                    {title.length}/100
                  </span>
                </label>
                <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Např. Přijďte dnes na náš event!" 
                    className="input input-bordered w-full bg-base-100" 
                    required 
                    maxLength={100}
                    autoFocus
                />
                <div className="label pt-1 pb-0">
                  <span className="label-text-alt text-sm text-base-content/70">
                    Text se zobrazí v seznamu novinek. Dlouhé texty se zkrátí (...).
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Link Input */}
                <div className="form-control">
                  <label className="label pt-0 pb-1">
                    <span className="label-text font-semibold flex items-center gap-1">
                      <LinkIcon size={14} /> Odkaz
                    </span>
                  </label>
                  <input 
                    type="url" 
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder="https://..." 
                    className="input input-bordered w-full input-sm h-10" 
                    maxLength={200}
                  />
                </div>

                {/* Expiration Input */}
                <div className="form-control">
                  <label className="label pt-0 pb-1">
                    <span className="label-text font-semibold flex items-center gap-1">
                      <Calendar size={14} /> Expirace
                    </span>
                  </label>
                  <input 
                    type="date" 
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    className="input input-bordered w-full input-sm h-10" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Preview */}
            <div className="flex-shrink-0 flex justify-center xl:justify-start xl:block border-t xl:border-t-0 xl:border-l border-base-200 pt-6 xl:pt-0 xl:pl-8">
                <NotificationPreview 
                    title={title} 
                    associationId={associationId}
                    associationName={associationName}
                />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="card-actions justify-end mt-6 pt-4 border-t border-base-200">
             <button type="button" onClick={handleCancel} className="btn btn-ghost" disabled={submitting}>
              Zrušit
            </button>
            <button type="submit" className="btn btn-primary gap-2 px-8" disabled={submitting}>
              {submitting ? <span className="loading loading-spinner"></span> : (
                <>
                  <Send size={18} />
                  Publikovat
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
