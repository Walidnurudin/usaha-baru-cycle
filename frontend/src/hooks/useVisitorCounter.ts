'use client';

import { useEffect, useRef } from 'react';
import { logVisit } from '@/lib/api';

/**
 * Automatically triggers visitor count increment (+1) upon landing on the catalog page.
 * Uses sessionStorage to prevent duplicate counts during the same browsing session.
 */
export function useVisitorCounter() {
  const hasLogged = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sessionLogged = sessionStorage.getItem('ubc_visit_logged');
    if (!sessionLogged && !hasLogged.current) {
      hasLogged.current = true;
      logVisit()
        .then(() => {
          sessionStorage.setItem('ubc_visit_logged', 'true');
        })
        .catch((err) => {
          console.warn('Visitor log warning:', err);
        });
    }
  }, []);
}
