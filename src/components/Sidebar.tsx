import {
  Bell,
  Users,
  // GraduationCap,
  LogOut
} from 'lucide-react';
import { NavItem, MenuItem } from './Sidebar/NavItem';
import { supabase } from '@/lib/supabase';
import GhostingSelector from './GhostingSelector';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  associationName?: string;
  associationId?: string;
  isReisAdmin?: boolean;
  ghostingAssociation?: { id: string; name: string } | null;
  onGhostSelect?: (assoc: { id: string; name: string } | null) => void;
  ownAssociationId?: string | null;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'notifications', label: 'Notifikace', icon: Bell },
  // { id: 'tutorials', label: 'Tutoriály', icon: GraduationCap },
];

export const Sidebar = ({ currentView, onViewChange, associationName, associationId, isReisAdmin, ghostingAssociation, onGhostSelect, ownAssociationId }: SidebarProps) => {
  // Logo constants
  const MENDELU_LOGO_PATH = '/mendelu_logo_128.png';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 h-screen bg-base-200 border-r border-base-300 fixed left-0 top-0 z-40 items-center py-6">
        {/* Logo - click to dashboard */}
        <button
          type="button"
          onClick={() => onViewChange('notifications')}
          className="mb-8 w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden hover:shadow-md transition-shadow border border-base-300/50"
          title="reIS Admin"
        >
          <img src={MENDELU_LOGO_PATH} alt="Mendelu Logo" className="w-8 h-8 object-contain" />
        </button>

        {/* Navigation Items */}
        <div className="flex flex-col gap-3 w-full px-2">
          {MENU_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
              onClick={() => onViewChange(item.id)}
            />
          ))}
          {isReisAdmin && (
            <NavItem
              item={{ id: 'accounts', label: 'Správa účtů', icon: Users }}
              isActive={currentView === 'accounts'}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
              onClick={() => onViewChange('accounts')}
            />
          )}
          {isReisAdmin && onGhostSelect && (
            <GhostingSelector
              currentGhosting={ghostingAssociation ?? null}
              onSelect={onGhostSelect}
              excludeId={ownAssociationId}
            />
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 mb-2 w-full px-2 items-center">
            
            {/* Divider */}
            <div className="h-px bg-base-300 w-full my-1" />

            {/* Association "Profile" */}
            <div className="flex flex-col items-center gap-1 group relative">
                <div className="tooltip tooltip-right" data-tip={associationName}>
                    <div className="avatar transition-all cursor-help hover:scale-105">
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm bg-base-100 flex items-center justify-center border border-base-300">
                            {associationId ? (
                                <img 
                                    src={`/spolky/${associationId}.jpg`} 
                                    className="w-full h-full object-cover"
                                    alt={associationName}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.parentElement) {
                                            e.currentTarget.parentElement.innerText = associationName?.[0] || '?';
                                        }
                                    }}
                                />
                            ) : (
                                <span className="text-xs font-bold">{associationName?.[0] || '?'}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* Logout */}
            <button
                onClick={() => supabase.auth.signOut()}
                className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-base-content/50 hover:bg-error/10 hover:text-error transition-all"
                title="Odhlásit se"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
      </aside>

      {/* Mobile Navbar (Simplified) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 z-50 flex justify-around p-2 pb-safe">
        {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
                <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`p-2 rounded-lg flex flex-col items-center ${active ? 'text-primary' : 'text-base-content/60'}`}
                >
                    <Icon size={24} />
                    <span className="text-[10px] mt-1">{item.label}</span>
                </button>
            )
        })}
        {isReisAdmin && (
            <button
                onClick={() => onViewChange('accounts')}
                className={`p-2 rounded-lg flex flex-col items-center ${currentView === 'accounts' ? 'text-primary' : 'text-base-content/60'}`}
            >
                <Users size={24} />
                <span className="text-[10px] mt-1">Účty</span>
            </button>
        )}
        <button
            onClick={() => supabase.auth.signOut()}
            className="p-2 rounded-lg flex flex-col items-center text-error/70"
        >
            <LogOut size={24} />
            <span className="text-[10px] mt-1">Exit</span>
        </button>
      </div>
    </>
  );
};
