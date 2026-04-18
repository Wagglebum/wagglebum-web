'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WagSaveSupportRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/plugins/wagsave/support'); }, [router]);
  return null;
}
