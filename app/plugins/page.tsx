import Image from 'next/image';
import Link from 'next/link';
import { NavBar, Footer, Eyebrow, Tag } from '@/components/wagglebum';
import content from '@/data/content.json';

export const metadata = { title: 'Plugins — Wagglebum' };

export default function PluginsPage() {
  return (
    <>
      <NavBar current="plugins" />

      {/* Page header */}
      <section className="mx-auto max-w-[1100px] px-6 pb-6 pt-14 text-center">
        <Eyebrow>Plugins &amp; tools</Eyebrow>
        <h1 className="mt-3 text-[64px] font-black leading-none tracking-[-0.03em]">Ship on Tuesday.</h1>
        <p className="mx-auto mt-3.5 max-w-[560px] text-[18px] text-fg-muted">
          Drop-in plugins for Unity and Unreal. Built by people who ship games, tested in ours first. Buy once, own forever.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {['All (6)', 'Unity (4)', 'Unreal (2)', 'Standalone (1)', 'Free (2)'].map((f, i) => (
            <button key={f} className={`rounded-full border px-4 py-2 text-[13px] font-semibold ${i === 0 ? 'border-ink bg-ink text-snow' : 'border-border bg-snow text-ink hover:border-ink/40'}`}>
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Plugin grid */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14">
        <div className="grid grid-cols-1 gap-[18px] pt-6 md:grid-cols-3">
          {content.plugins.map(p => (
            <Link
              key={p.slug}
              href={p.href}
              className={`flex flex-col gap-3 rounded-[20px] bg-snow p-6 no-underline text-ink transition-all ${p.featured ? 'border-2 border-ink shadow-pop' : 'border border-border shadow-sm hover:-translate-y-0.5 hover:shadow-md'}`}
            >
              <div className={`flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[14px] border text-[22px] font-black ${p.logo ? 'border-border bg-snow' : p.featured ? 'border-ink bg-ink text-snow' : 'border-border bg-bone'}`}>
                {p.logo
                  ? <Image src={p.logo} alt={p.title} width={52} height={52} className="object-cover" />
                  : p.icon
                }
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map(t => <Tag key={t.label} tone={t.tone as 'neutral' | 'blush'}>{t.label}</Tag>)}
              </div>
              <h3 className="text-[20px] font-extrabold">{p.title}</h3>
              <p className="flex-1 text-[14px] text-fg-muted">{p.body}</p>
              <div className="flex items-center justify-between border-t border-dashed border-border-strong pt-2.5">
                <span className={`text-[18px] font-black ${p.free ? 'text-ok' : ''}`}>{p.price}</span>
                <span className="text-[14px] font-bold">{p.cta}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us band */}
      <section className="mx-auto max-w-[1100px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-6 rounded-[28px] bg-bone px-12 py-12 md:grid-cols-3">
          {[
            { eyebrow: 'Why us', title: 'We ship games too.', body: 'Every plugin is used in our own titles before we charge for it.' },
            { eyebrow: 'Fair pricing', title: 'Buy once. Own it.', body: 'No subscriptions. Free major-version upgrades for 12 months.' },
            { eyebrow: 'Real support', title: 'Real humans reply.', body: 'Open an issue on GitHub. A dog-adjacent human will answer within 48h.' },
          ].map(f => (
            <div key={f.title}>
              <Eyebrow>{f.eyebrow}</Eyebrow>
              <h3 className="mt-1.5 text-[18px] font-extrabold">{f.title}</h3>
              <p className="mt-1 text-[14px] text-fg-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
