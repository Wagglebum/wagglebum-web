'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WagSettingsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/plugins/wagsettings'); }, [router]);
  return null;
}
