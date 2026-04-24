'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const items = [
  { id: 'games',   label: 'Games',   href: '/games' },
  { id: 'plugins', label: 'Plugins', href: '/plugins' },
  { id: 'support', label: 'Support', href: '/support' },
  { id: 'about',   label: 'About',   href: '/about' },
];

export function NavBar({ current }: { current?: 'home' | 'games' | 'plugins' | 'about' | 'support' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Pill nav */}
      <nav className="sticky top-4 z-30 mx-auto mt-4 flex max-w-[1100px] items-center gap-4 rounded-full border border-border bg-paper/90 px-4 py-2.5 shadow-md backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 text-ink no-underline" onClick={() => setOpen(false)}>
          <Image src="/brand/logo.png" alt="" width={34} height={34} priority />
          <span className="text-[18px] font-black uppercase tracking-tight">Wagglebum</span>
        </Link>

        {/* Desktop links */}
        <div className="ml-3 hidden gap-1 md:flex">
          {items.map(i => (
            <Link key={i.id} href={i.href}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold no-underline transition-colors ${current === i.id ? 'bg-ink text-snow' : 'text-ink hover:bg-bone'}`}>
              {i.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="ml-auto rounded-full p-2 text-ink hover:bg-bone md:hidden"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-20 flex flex-col bg-paper pt-24 px-6 md:hidden">
          <nav className="flex flex-col gap-1">
            {items.map(i => (
              <Link key={i.id} href={i.href} onClick={() => setOpen(false)}
                className={`rounded-[14px] px-4 py-3.5 text-[18px] font-bold no-underline transition-colors ${current === i.id ? 'bg-ink text-snow' : 'text-ink hover:bg-bone'}`}>
                {i.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
