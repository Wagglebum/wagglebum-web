import Image from 'next/image';
import Link from 'next/link';
import { NavBar, Footer, Button, Tag, Eyebrow } from '@/components/wagglebum';
import content from '@/data/content.json';

const featuredGames = content.games.slice(0, 3);
const featuredPlugins = content.plugins.slice(0, 3);
const newItems = [
  ...content.games.filter(g => g.new).map(g => ({ title: g.title, href: g.href })),
  ...content.plugins.filter(p => p.new).map(p => ({ title: p.title, href: p.href })),
];

export default function Home() {
  return (
    <>
      <NavBar current="home" />

      {/* Hero */}
      <section className="mx-auto max-w-[960px] px-6 pt-20 pb-10 text-center">
        {newItems.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {newItems.map(item => (
              <Tag key={item.href} tone="blush">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blush-500" />
                New · {item.title}
              </Tag>
            ))}
          </div>
        )}
        <h1 className="mt-6 text-[clamp(56px,8vw,104px)] font-black leading-[0.98] tracking-[-0.03em] text-balance">
          Tiny studio.<br />Waggly tools.
        </h1>
        <p className="mx-auto mt-6 max-w-[620px] text-[20px] leading-relaxed text-fg-muted text-pretty">
          Wagglebum makes indie games and builds the plugins that help other studios ship theirs. One dog-shaped team, two kinds of work.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/games" size="lg">Play our games →</Button>
          <Button href="/plugins" variant="secondary" size="lg">Browse plugins</Button>
        </div>
        <div className="mt-14 flex justify-center">
          <Image src="/brand/logo.png" alt="Wagglebum mascot" width={240} height={240} priority className="animate-wiggle" />
        </div>
      </section>

      {/* Games strip */}
      <section className="mx-auto max-w-[1100px] px-6 py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Games</Eyebrow>
            <h2 className="mt-1 text-[44px] font-black tracking-[-0.025em] leading-tight">Cozy, strange, small.</h2>
            <p className="mt-1.5 max-w-[480px] text-fg-muted">The games we make ourselves. Short, warm, built for an evening on the couch.</p>
          </div>
          <Button href="/games" variant="ghost">All games →</Button>
        </div>
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
          {featuredGames.map(game => (
            <Link key={game.slug} href={game.href} className="group flex flex-col overflow-hidden rounded-[20px] border border-border bg-snow shadow-sm no-underline transition-transform hover:-translate-y-0.5">
              {game.cover
                ? <Image src={game.cover} alt={game.title} width={600} height={375} className="aspect-[16/10] object-cover" />
                : <div className={`aspect-[16/10] flex items-center justify-center font-mono text-xs ${game.dark ? 'bg-ink-soft text-stone' : 'bg-bone text-stone'}`}>[ {game.title} — key art ]</div>
              }
              <div className="flex flex-col gap-2 p-5 flex-1">
                <Eyebrow>{game.status}</Eyebrow>
                <h3 className="text-[20px] font-extrabold tracking-tight">{game.title}</h3>
                <p className="text-sm text-fg-muted flex-1">{game.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <Tag>{game.tags[0]}</Tag>
                  <span className="text-sm font-bold text-ink transition-transform group-hover:translate-x-1">{game.cta}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Plugins strip */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Tools for devs</Eyebrow>
            <h2 className="mt-1 text-[44px] font-black tracking-[-0.025em] leading-tight">Plugins that work on Tuesday.</h2>
            <p className="mt-1.5 max-w-[480px] text-fg-muted">Drop-in Unity &amp; Unreal plugins, built by people who ship games. Buy once, own forever.</p>
          </div>
          <Button href="/plugins" variant="ghost">All plugins →</Button>
        </div>
        <div className="flex flex-col gap-2.5">
          {featuredPlugins.map(plugin => (
            <Link key={plugin.slug} href={plugin.href} className="flex items-center gap-4 rounded-[16px] border border-border bg-snow px-[22px] py-[18px] shadow-xs no-underline transition-shadow hover:shadow-sm">
              <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-[14px] border border-border bg-snow text-[18px] font-black">
                {plugin.logo
                  ? <Image src={plugin.logo} alt={plugin.title} width={48} height={48} className="object-cover" />
                  : plugin.icon
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-extrabold">{plugin.title}</h3>
                <p className="text-sm text-fg-muted">{plugin.body}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {plugin.tags.map(t => (
                  <Tag key={t.label} tone={t.tone as 'neutral' | 'blush'}>{t.label}</Tag>
                ))}
              </div>
              <span className="font-bold text-ink">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Band — Services */}
      <div className="mx-auto max-w-[1100px] px-6 py-14">
        <div className="relative overflow-hidden rounded-[28px] bg-ink px-12 py-14 flex items-center justify-between gap-10">
          <div className="relative z-10">
            <Eyebrow><span className="text-mist">Services</span></Eyebrow>
            <h2 className="mt-1.5 max-w-[520px] text-[40px] font-black leading-tight tracking-[-0.02em] text-snow">
              Need a port? We&apos;ve done a few.
            </h2>
            <p className="mt-2.5 max-w-[420px] text-mist">
              Switch, Steam Deck, iOS, web — we take your Unity game to the platforms it deserves.
            </p>
            <Button href="/services" variant="secondary" className="mt-5 bg-snow">Book a call →</Button>
          </div>
          <Image
            src="/brand/logo.png"
            alt=""
            width={260}
            height={260}
            className="absolute right-[-30px] bottom-[-40px] opacity-15 invert hue-rotate-180"
          />
        </div>
      </div>

      {/* Stats */}
      <section className="mx-auto max-w-[1100px] px-6 pb-16">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {[
            { num: '12k+', lbl: 'Devs using our plugins' },
            { num: '3', lbl: 'Games shipped' },
            { num: '6', lbl: 'Plugins in the wild' },
            { num: '1', lbl: 'Very good dog' },
          ].map(s => (
            <div key={s.lbl}>
              <div className="text-[48px] font-black leading-none tracking-[-0.03em]">{s.num}</div>
              <div className="mt-1 text-[13px] font-semibold text-fg-subtle">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
