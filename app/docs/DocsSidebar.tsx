'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavSection } from '@/lib/docs';

export function DocsSidebar({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      {sections.map((section) => (
        <div key={section.id}>
          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-stone">
            {section.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.docs.map((doc, i) => {
              const href = `/docs/${section.id}/${doc.slug}`;
              const active = pathname === href;
              // A folder's pages sit under a small heading, indented.
              const startsGroup = doc.group !== '' && (i === 0 || section.docs[i - 1].group !== doc.group);
              return (
                <li key={doc.slug}>
                  {startsGroup && (
                    <p className="mb-1 mt-3 px-3 text-[11px] font-bold uppercase tracking-widest text-stone">
                      {doc.group}
                    </p>
                  )}
                  <Link
                    href={href}
                    className={`block rounded-sm py-2 text-sm font-medium no-underline transition-colors ${doc.group ? 'pl-5 pr-3' : 'px-3'} ${
                      active
                        ? 'bg-ink text-snow'
                        : 'text-charcoal hover:bg-bone hover:text-ink'
                    }`}
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
