import Image from 'next/image';
import Link from 'next/link';
import { NavBar, Footer, Button, Tag, Eyebrow } from '@/components/wagglebum';

export const metadata = { title: 'WagSave — Wagglebum' };

export default function WagSavePage() {
  return (
    <>
      <NavBar current="plugins" />

      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 pt-14 pb-6 text-center">
        <div className="mx-auto mb-5 flex h-[84px] w-[84px] items-center justify-center rounded-[22px] bg-snow shadow-pop overflow-hidden border border-border">
          <Image src="/brand/wagsave/Logo.png" alt="WagSave" width={84} height={84} className="object-cover" />
        </div>
        <Tag tone="blush">v2.0 · out today</Tag>
        <h1 className="mt-4 text-[72px] font-black leading-none tracking-[-0.03em]">WagSave</h1>
        <p className="mx-auto mt-4 max-w-[580px] text-[20px] leading-relaxed text-fg-muted">
          Save games without the boilerplate. Cloud sync, migrations, undo, and encryption — all in one drop-in Unity package.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Button href="#" size="lg">Buy — $49 →</Button>
          <Button href="#" variant="secondary" size="lg">Try free for 14 days</Button>
          <Button href="#" variant="ghost" size="lg">Read docs</Button>
        </div>
      </section>

      {/* Price strip */}
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-8 px-6 py-5 text-[14px] font-semibold text-fg-muted">
        <div><strong className="font-extrabold text-ink">Unity 2022+</strong> · 2023 · 6</div>
        <div><strong className="font-extrabold text-ink">One-time</strong> · no subscription</div>
        <div><strong className="font-extrabold text-ink">12 months</strong> of updates included</div>
        <div><strong className="font-extrabold text-ink">4.9 ★</strong> · Asset Store (112)</div>
      </div>

      {/* Card / hero image */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14">
        <div className="rounded-[20px] bg-ink p-3.5 shadow-xl">
          <div className="relative overflow-hidden rounded-[10px]">
            <Image src="/brand/wagsave/CardImage.png" alt="WagSave in action" width={1072} height={603} className="w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14 text-center">
        <Eyebrow>Features</Eyebrow>
        <h2 className="mt-3 text-[40px] font-black leading-tight tracking-[-0.025em]">
          The last save system<br />you&apos;ll ever add.
        </h2>
        <p className="mx-auto mt-2.5 max-w-[480px] text-[17px] text-fg-muted">Everything the engine should ship with. Small surface, sharp teeth.</p>
        <div className="mt-9 grid grid-cols-1 gap-[18px] text-left md:grid-cols-3">
          {[
            { num: '01', title: 'Cloud sync', body: 'Steam, Epic, GOG Galaxy, iCloud, Google Play — one API, no if/else soup.' },
            { num: '02', title: 'Migrations', body: 'Schema changes without tears. Write a migration function, ship next patch.' },
            { num: '03', title: 'Undo / redo', body: 'Built-in ring buffer. Three lines of code to wire into your editor or game.' },
            { num: '04', title: 'Encryption', body: 'Optional AES with per-save keys. Cheat-proofs your save files without slowing the editor.' },
            { num: '05', title: 'Compression', body: "LZ4 by default, Brotli for publishing. Saves ~70% smaller than Unity's PlayerPrefs soup." },
            { num: '06', title: 'Inspector', body: "Browse, edit, and diff any save from the Unity inspector. Works with your team's git." },
          ].map(f => (
            <div key={f.num} className="rounded-[18px] border border-border bg-snow p-6 shadow-xs">
              <div className="font-mono text-[11px] font-bold text-fg-subtle">{f.num}</div>
              <h3 className="mt-2 text-[18px] font-extrabold">{f.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code panel */}
      <section className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-6 pb-14 md:grid-cols-2 md:items-center">
        <div>
          <Eyebrow>Getting started</Eyebrow>
          <h2 className="mt-3 text-[36px] font-black leading-tight tracking-[-0.02em]">Three lines. That&apos;s the whole API.</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted">
            Drop the package in, create a schema, call <code className="rounded-md bg-bone px-1.5 py-0.5 font-mono text-sm">WagSave.Save()</code>. That&apos;s it. Cloud sync is opt-in from the inspector.
          </p>
          <Link href="#" className="mt-4 inline-block text-[15px] font-extrabold text-ink no-underline">Read the full docs →</Link>
        </div>
        <pre className="overflow-x-auto rounded-[16px] bg-ink p-5 font-mono text-[13px] leading-relaxed text-snow shadow-md">
          <span className="text-stone">{'// schema.cs'}</span>{'\n'}
          <span className="text-blush-100">{'public class'}</span>{' Run : WagSaveData {\n'}
          {'  '}<span className="text-blush-100">{'public int'}</span>{' level;\n'}
          {'  '}<span className="text-blush-100">{'public float'}</span>{' timePlayed;\n'}
          {'  '}<span className="text-blush-100">{'public'}</span>{' List<Item> inventory;\n'}{'}'}
          {'\n\n'}
          <span className="text-stone">{'// anywhere in your game:'}</span>{'\n'}
          {'WagSave.Save('}<span className="text-[#b2d8b2]">{'"run-1"'}</span>{', myRun);\n'}
          <span className="text-blush-100">{'var'}</span>{' loaded = WagSave.Load<Run>('}<span className="text-[#b2d8b2]">{'"run-1"'}</span>{');'}
        </pre>
      </section>

      {/* Compat */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14">
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {[
            { v: 'Unity 6', s: 'Fully supported' },
            { v: 'Unity 2023', s: 'Fully supported' },
            { v: 'Unity 2022 LTS', s: 'Fully supported' },
            { v: 'Unity 2021 LTS', s: 'Legacy builds only' },
          ].map(c => (
            <div key={c.v} className="rounded-[14px] border border-border bg-bone px-4 py-4 text-center">
              <strong className="block text-[15px] font-extrabold">{c.v}</strong>
              <span className="text-[12px] text-fg-muted">{c.s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14 text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="mt-3 text-[40px] font-black tracking-[-0.025em]">Buy once. Own it.</h2>
        <div className="mt-9 grid grid-cols-1 gap-[18px] text-left md:grid-cols-3">
          {[
            {
              name: 'Indie', price: '$49', sub: 'one-time', desc: 'For solo devs and teams under 3.',
              items: ['All features', '12 months of updates', 'GitHub-issue support'],
              featured: false, cta: 'Buy Indie →', variant: 'secondary' as const,
            },
            {
              name: 'Studio', price: '$199', sub: 'one-time', desc: 'Teams of 3–20. Seat-free.',
              items: ['Everything in Indie', 'Priority email support', 'Private Discord channel', '24 months of updates'],
              featured: true, cta: 'Buy Studio →', variant: 'primary' as const,
            },
            {
              name: 'Source', price: 'Talk', sub: 'to us', desc: 'Source access & royalty-free distribution.',
              items: ['Full source code', 'Internal forks OK', 'Custom SLA'],
              featured: false, cta: 'Get in touch →', variant: 'ghost' as const,
            },
          ].map(t => (
            <div key={t.name} className={`flex flex-col gap-3.5 rounded-[20px] p-7 ${t.featured ? 'border-2 border-ink bg-snow shadow-pop' : 'border border-border bg-snow shadow-sm'}`}>
              <h3 className="text-[18px] font-extrabold">{t.name}</h3>
              <div className="text-[48px] font-black leading-none tracking-[-0.02em]">
                {t.price}<small className="text-[14px] font-medium text-fg-muted"> · {t.sub}</small>
              </div>
              <p className="text-[14px] text-fg-muted">{t.desc}</p>
              <ul className="flex flex-col gap-2">
                {t.items.map(i => (
                  <li key={i} className="relative pl-5 text-[14px] text-fg-muted before:absolute before:left-0 before:font-black before:text-ok before:content-['✓']">{i}</li>
                ))}
              </ul>
              <Button href="#" variant={t.variant} className="mt-auto">{t.cta}</Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[760px] px-6 pb-16">
        <h2 className="mb-7 text-center text-[36px] font-black tracking-[-0.02em]">Fair questions</h2>
        <div className="flex flex-col gap-2.5">
          {[
            { q: 'Is this really a one-time purchase?', a: "Yes. We think subscriptions for dev tools are silly. Buy once, keep forever. Updates are free for 12 months; after that they're optional and cheap." },
            { q: 'Does it work with my save system?', a: 'Probably. WagSave can import from PlayerPrefs, JsonUtility, Odin Serializer, and Easy Save. See the migration guide.' },
            { q: "What's the refund policy?", a: "14 days, no questions, no forms. Email us and we'll refund you within a business day." },
            { q: 'Unreal?', a: 'See SaveKit. Same idea, different engine, separate purchase.' },
          ].map(faq => (
            <div key={faq.q} className="rounded-[14px] border border-border bg-snow p-5">
              <strong className="block text-[15px] font-extrabold">{faq.q}</strong>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
