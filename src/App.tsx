import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import LoginScreen from '@/features/auth/LoginScreen';
import AppLayout from '@/components/AppLayout';
import NotificationsView from '@/features/notifications';
import UsersView from '@/features/users';
import StudyJamsView from '@/features/study-jams';

function App() {
  const [session, setSession] = useState<any>(null);
  const [association, setAssociation] = useState<any>(null);
  const [ghostingAssociation, setGhostingAssociation] = useState<{ id: string, name: string } | null>(() => {
    const saved = sessionStorage.getItem('ghosting_association');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionStorage.setItem('ghosting_association', JSON.stringify(ghostingAssociation));
  }, [ghostingAssociation]);

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
        setGhostingAssociation(null);
    }
  }, [session]);

  const handleGhostAssociation = (assoc: { id: string, name: string } | null) => {
    setGhostingAssociation(assoc);
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );
  }

  const isReisAdmin = association?.role === 'reis_admin';
  const effectiveAssociationId = ghostingAssociation?.id || association?.association_id || null;
  const effectiveAssociationName = ghostingAssociation?.name || association?.association_name;

  return (
    <Router>
        <Toaster position="top-right" />

        {!session ? (
            <Routes>
                <Route path="*" element={<LoginScreen />} />
            </Routes>
        ) : (
            <AppLayout
                associationName={effectiveAssociationName}
                associationId={effectiveAssociationId}
                isReisAdmin={isReisAdmin}
                ghostingAssociation={ghostingAssociation}
                onGhostSelect={handleGhostAssociation}
                ownAssociationId={association?.association_id}
            >
                <Routes>
                    <Route path="/" element={<Navigate to="/notifications" replace />} />
                    <Route path="/notifications" element={<NotificationsView associationId={effectiveAssociationId} isReisAdmin={isReisAdmin} isGhosting={ghostingAssociation !== null} />} />
                    <Route path="/accounts" element={<UsersView associationId={effectiveAssociationId} isReisAdmin={isReisAdmin} />} />
                    <Route path="/study-jams" element={<StudyJamsView isReisAdmin={isReisAdmin} />} />
                    <Route path="*" element={<Navigate to="/notifications" replace />} />
                </Routes>
            </AppLayout>
        )}
    </Router>
  );
}

export default App;
