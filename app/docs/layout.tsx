import Link from 'next/link';
import Image from 'next/image';
import { getNavStructure } from '@/lib/docs';
import { DocsSidebar } from './DocsSidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const sections = getNavStructure();

  return (
    <div className="min-h-screen bg-paper font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5 text-ink no-underline">
            <Image src="/brand/logo.png" alt="" width={30} height={30} priority />
            <span className="text-[17px] font-black uppercase tracking-tight">Wagglebum</span>
          </Link>
          <span className="text-mist">/</span>
          <span className="text-sm font-semibold text-graphite">Docs</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px] gap-0">
        {/* Sidebar — hidden on mobile, fixed-width on md+ */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-[57px] max-h-[calc(100vh-57px)] overflow-y-auto px-4 py-8">
            <DocsSidebar sections={sections} />
          </div>
        </aside>

        {/* Divider */}
        <div className="hidden md:block w-px bg-border shrink-0" />

        {/* Main content */}
        <main className="min-w-0 flex-1 px-6 py-10 md:px-10 md:py-12">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — scrollable section/doc list */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-paper/95 backdrop-blur-md md:hidden">
        <div className="overflow-x-auto px-4 py-3">
          <div className="flex gap-1">
            {sections.flatMap((section) =>
              section.docs.map((doc) => ({
                href: `/docs/${section.id}/${doc.slug}`,
                label: doc.title,
                key: `${section.id}/${doc.slug}`,
              }))
            ).map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="shrink-0 rounded-full border border-border bg-bone px-3 py-1.5 text-xs font-semibold text-charcoal no-underline whitespace-nowrap hover:bg-pearl"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
