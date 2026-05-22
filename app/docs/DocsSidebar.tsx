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
            {section.docs.map((doc) => {
              const href = `/docs/${section.id}/${doc.slug}`;
              const active = pathname === href;
              return (
                <li key={doc.slug}>
                  <Link
                    href={href}
                    className={`block rounded-sm px-3 py-2 text-sm font-medium no-underline transition-colors ${
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
