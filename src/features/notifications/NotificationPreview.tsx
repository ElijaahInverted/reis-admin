import { Bell, Users } from 'lucide-react';


interface NotificationPreviewProps {
  title: string;
  associationId: string | null;
  associationName?: string; // For alt text
}

export default function NotificationPreview({ title, associationId, associationName }: NotificationPreviewProps) {
  // Logic from reis/src/components/NotificationFeed.tsx
  const assocId = associationId || 'admin';
  const isAcademic = assocId.startsWith('academic_');
  const isAdmin = assocId === 'admin';
  
  const iconUrl = (isAcademic || isAdmin)
    ? null 
    : `/spolky/${assocId}.jpg`;

  return (
    <div className="w-full max-w-sm"> {/* Container for context */}
        <div className="text-sm font-bold text-base-content/50 uppercase tracking-wider mb-2">
            Náhled (jak to uvidí student)
        </div>
        
        {/* The Mock Dropdown Container - EXACT width of extension (w-96 = 384px) */}
        <div className="w-96 bg-base-100 border border-base-300 rounded-lg shadow-sm overflow-hidden pointer-events-none select-none">
            {/* Mock Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-100">
              <h3 className="font-semibold text-lg text-base-content">Novinky</h3>
              <div className="p-1 rounded text-base-content/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </div>
            </div>

            {/* Notification Item - EXACT COPY of reis component structure */}
            <div className="divide-y divide-base-300">
                <div className="w-full p-4 bg-base-100 flex items-center gap-3">
                    {/* Icon Section */}
                    <div className="flex-shrink-0">
                        {iconUrl ? (
                        <img 
                            src={iconUrl} 
                            alt={associationName || assocId} 
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        ) : null}
                        
                        {/* Fallback Icons */}
                        <div className={iconUrl ? 'hidden' : ''}>
                            {isAdmin ? (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Bell size={20} />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center text-base-content/50">
                                    <Users size={20} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            {/* The Title - THIS IS WHAT WE ARE PREVIEWING */}
                            <div className="font-semibold text-sm text-base-content line-clamp-1 flex-1">
                                {title || "Text notifikace..."}
                            </div>
                            
                            {/* Date */}
                            <div className="text-sm text-base-content flex-shrink-0">
                                Dnes
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
             {/* Mocking a second item to show list context */}
             <div className="w-full p-4 bg-base-100 flex items-center gap-3 opacity-50 border-t border-base-300">
                  <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Bell size={20} />
                      </div>
                  </div>
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-sm text-base-content line-clamp-1 flex-1">
                              Předchozí notifikace...
                          </div>
                          <div className="text-sm text-base-content flex-shrink-0">
                              Včera
                          </div>
                      </div>
                  </div>
             </div>
        </div>
        
        <div className="mt-2 text-sm text-base-content/50 px-1">
            * Maximální délka textu je omezena šířkou okna. Dlouhý text bude zkrácen (...).
        </div>
    </div>
  );
}
