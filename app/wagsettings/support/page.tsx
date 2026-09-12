'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WagSettingsSupportRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/plugins/wagsettings/support'); }, [router]);
  return null;
}
