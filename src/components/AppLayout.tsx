import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import ThemeToggle from './ThemeToggle';
import SettingsModal from '@/features/auth/SettingsModal';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AppLayoutProps {
  children: ReactNode;
  associationName?: string;
  associationId?: string;
  currentView?: string; // e.g. 'notifications', 'tutorials'
}

export default function AppLayout({ children, associationName, associationId, currentView }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleViewChange = (view: string) => {
    navigate(`/${view}`);
  };

  const inferredView = currentView || location.pathname.replace('/', '') || 'notifications';

  return (
    <div className="flex min-h-screen bg-base-200 text-base-content font-inter">
      <Sidebar 
        currentView={inferredView} 
        onViewChange={handleViewChange}
        associationName={associationName}
        associationId={associationId}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-20 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Top Header - Consolidated */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2 bg-base-200/90 backdrop-blur-md border-b border-base-300">
            <div>
                <h1 className="text-lg font-semibold tracking-tight text-base-content">
                    {inferredView === 'notifications' && 'Notifikace'}
                    {inferredView === 'tutorials' && 'Tutoriály'}
                </h1>
                <p className="text-sm text-base-content/70 font-medium">
                    {associationName || 'Načítání...'}
                </p>
            </div>
            
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <SettingsModal />
                <div className="divider divider-horizontal mx-1 py-2"></div>
                <button 
                    onClick={() => supabase.auth.signOut()}
                    className="btn btn-ghost btn-circle text-error hover:bg-error/10"
                    title="Odhlásit se"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>

        <div className="px-6 py-8 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
        </div>
      </main>
    </div>
  );
}

