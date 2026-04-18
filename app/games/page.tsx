import Image from 'next/image';
import Link from 'next/link';
import { NavBar, Footer, Eyebrow, Tag } from '@/components/wagglebum';
import content from '@/data/content.json';

export default function GamesPage() {
  return (
    <>
      <NavBar current="games" />

      {/* Page header */}
      <section className="mx-auto max-w-[1100px] px-6 pb-6 pt-14 text-center">
        <Eyebrow>Our games</Eyebrow>
        <h1 className="mt-3 text-[64px] font-black leading-none tracking-[-0.03em]">
          Small games,<br />made with care.
        </h1>
        <p className="mx-auto mt-3.5 max-w-[560px] text-[18px] text-fg-muted">
          Short, warm, easy to finish in an evening. All made by the same tiny studio.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {['All (6)', 'Out now (3)', 'Coming soon (2)', 'Prototypes (1)'].map((f, i) => (
            <button key={f} className={`rounded-full border px-4 py-2 text-[13px] font-semibold ${i === 0 ? 'border-ink bg-ink text-snow' : 'border-border bg-snow text-ink hover:border-ink/40'}`}>
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Games grid */}
      <section className="mx-auto max-w-[1100px] px-6 pb-16">
        <div className="grid grid-cols-1 gap-[22px] pt-6 md:grid-cols-2">
          {content.games.map(game => (
            <Link
              key={game.slug}
              href={game.href}
              className={`flex flex-col overflow-hidden rounded-[24px] bg-snow no-underline shadow-sm transition-transform hover:-translate-y-0.5 ${game.featured ? 'border-2 border-ink shadow-pop' : 'border border-border'}`}
            >
              {game.cover
                ? <Image src={game.cover} alt={game.title} width={800} height={450} className="aspect-video object-cover" />
                : <div className={`aspect-video flex items-center justify-center font-mono text-xs ${game.dark ? 'bg-ink-soft text-mist' : 'bg-bone text-stone'}`}>
                    [ {game.title} — key art ]
                  </div>
              }
              <div className="flex flex-col gap-2.5 p-6">
                <div className="flex flex-wrap gap-1.5">
                  {game.tags.map(t => (
                    <Tag key={t} tone={t === 'Featured' ? 'blush' : 'neutral'}>{t}</Tag>
                  ))}
                </div>
                <h2 className="text-[26px] font-black leading-tight tracking-[-0.015em]">{game.title}</h2>
                <p className="text-[15px] text-fg-muted">{game.description}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-fg-subtle">{game.platforms}</span>
                  <span className="text-[15px] font-extrabold">{game.cta}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
