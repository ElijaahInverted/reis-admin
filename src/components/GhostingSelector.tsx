import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ghost } from 'lucide-react';
import { Tables } from '@/lib/database.types';

interface GhostingSelectorProps {
  currentGhosting: { id: string, name: string } | null;
  onSelect: (assoc: { id: string, name: string } | null) => void;
}

export default function GhostingSelector({ currentGhosting, onSelect }: GhostingSelectorProps) {
  const [associations, setAssociations] = useState<Tables<'spolky_accounts'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAssociations();
    }
  }, [isOpen]);

  const fetchAssociations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spolky_accounts')
        .select('*')
        .eq('is_active', true)
        .order('association_name');
      if (error) throw error;
      setAssociations(data || []);
    } catch (error) {
      console.error('Error fetching associations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (currentGhosting) {
    return (
      <div className="flex justify-center">
        <div className="tooltip tooltip-right" data-tip="Ukončit ghosting">
          <button
            onClick={() => onSelect(null)}
            className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-warning/20 text-warning hover:bg-warning/30 transition-all"
          >
            <Ghost className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center">
      <div className="tooltip tooltip-right" data-tip="Ghosting">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-base-content/40 hover:bg-warning/10 hover:text-warning transition-all"
        >
          <Ghost className={`w-5 h-5 ${isOpen ? 'text-warning' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-full top-0 ml-3 w-64 bg-base-100 rounded-2xl shadow-2xl border border-base-300 z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-200">
            {loading ? (
              <div className="py-6 text-center">
                <span className="loading loading-spinner loading-md text-primary"></span>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {associations.map((assoc) => (
                  <button
                    key={assoc.id}
                    className="flex items-center gap-3 w-full p-2.5 hover:bg-primary/10 hover:text-primary rounded-xl text-left transition-all group"
                    onClick={() => {
                      onSelect({ id: assoc.association_id || '', name: assoc.association_name || '' });
                      setIsOpen(false);
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-base-200 border border-base-300 flex items-center justify-center flex-shrink-0 group-hover:border-primary/50 transition-colors">
                      <img
                        src={`/spolky/${assoc.association_id}.jpg`}
                        alt={assoc.association_name || ''}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerText = assoc.association_name?.[0] || '?';
                          }
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{assoc.association_name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-base-content/40 font-mono group-hover:text-primary/60">{assoc.association_id}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
