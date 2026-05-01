'use client';

import { useEffect } from 'react';
import { useFitnessStore } from '@/lib/store';
import OnboardingFlow from '@/components/OnboardingFlow';
import AppShell from '@/components/AppShell';

export default function Home() {
  const { profile } = useFitnessStore();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  if (!profile.onboarded) {
    return <OnboardingFlow />;
  }

  return <AppShell />;
}
