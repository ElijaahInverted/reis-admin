import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import LoginScreen from '@/features/auth/LoginScreen';
import AppLayout from '@/components/AppLayout';
import NotificationsView from '@/features/notifications';
// import TutorialsView from '@/features/tutorials';

function App() {
  const [session, setSession] = useState<any>(null);
  const [association, setAssociation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      supabase
        .from('spolky_accounts')
        .select('association_id, association_name, role')
        .eq('email', session.user.email)
        .single()
        .then(({ data }) => {
           if (data) setAssociation(data);
        });
    } else {
        setAssociation(null);
    }
  }, [session]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );
  }

  const isReisAdmin = association?.role === 'reis_admin';

  return (
    <Router>
        <Toaster position="top-right" />

        {!session ? (
            <Routes>
                <Route path="*" element={<LoginScreen />} />
            </Routes>
        ) : (
            <AppLayout
                associationName={association?.association_name}
                associationId={association?.association_id}
                isReisAdmin={isReisAdmin}
            >
                <Routes>
                    <Route path="/" element={<Navigate to="/notifications" replace />} />
                    <Route path="/notifications" element={<NotificationsView associationId={association?.association_id || null} isReisAdmin={isReisAdmin} />} />
                    {/* <Route path="/tutorials" element={<TutorialsView associationId={association?.association_id || null} />} /> */}
                    <Route path="*" element={<Navigate to="/notifications" replace />} />
                </Routes>
            </AppLayout>
        )}
    </Router>
  );
}

export default App;
