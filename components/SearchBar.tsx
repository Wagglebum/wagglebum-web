'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { SearchResult } from '@/app/api/search/route';

const TYPE_LABEL: Record<string, string> = {
  doc:    'Doc',
  plugin: 'Plugin',
  game:   'Game',
  page:   'Page',
};

export function SearchBar() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [cursor, setCursor]   = useState(-1);

  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router       = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults([]);
    setCursor(-1);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json() as SearchResult[];
      setResults(data);
      setCursor(-1);
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open, close]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape')    { close(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, -1)); }
    if (e.key === 'Enter' && cursor >= 0) {
      router.push(results[cursor].url);
      close();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search…"
            className="w-36 rounded-full border border-border bg-paper px-3.5 py-1.5 text-sm outline-none placeholder:text-fg-subtle focus:border-ink sm:w-48"
          />
          <button onClick={close} className="rounded-full p-1.5 text-ink hover:bg-bone" aria-label="Close search">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full p-2 text-ink hover:bg-bone"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      )}

      {open && results.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-[16px] border border-border bg-paper shadow-xl">
          {results.map((r, i) => (
            <Link
              key={r.id}
              href={r.url}
              onClick={close}
              className={`flex flex-col gap-0.5 px-4 py-3 no-underline transition-colors ${i === cursor ? 'bg-bone' : 'hover:bg-bone'} ${i > 0 ? 'border-t border-border' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-ink">{r.title}</span>
                <span className="rounded-full bg-bone px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fg-muted">
                  {TYPE_LABEL[r.type] ?? r.type}
                </span>
              </div>
              {r.excerpt && (
                <p className="line-clamp-1 text-[12px] text-fg-muted">{r.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
