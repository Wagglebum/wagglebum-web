'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WagSaveRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/plugins/wagsave'); }, [router]);
  return null;
}
