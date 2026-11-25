'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WagSaveProRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/plugins/wagsave-pro'); }, [router]);
  return null;
}
