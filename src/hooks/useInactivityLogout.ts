import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Custom hook to automatically sign out users after a specified period of inactivity.
 * Inactivity is defined as no mouse movement, keystrokes, clicks, touches, or scrolling.
 * 
 * @param isActive - Whether the inactivity monitor should be active (usually when a session exists)
 * @param timeoutMs - The timeout duration in milliseconds (default: 30 minutes)
 */
export function useInactivityLogout(isActive: boolean, timeoutMs: number = 15 * 60 * 1000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Avoid setting up listeners if not active
    if (!isActive) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        console.log('Inactivity timeout reached, signing out...');
        supabase.auth.signOut();
      }, timeoutMs);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    // Set up initial timer
    resetTimer();

    // Add listeners
    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isActive, timeoutMs]);
}
