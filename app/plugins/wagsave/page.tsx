import Image from 'next/image';
import { NavBar, Footer, Button, Eyebrow } from '@/components/wagglebum';
import content from '@/data/content.json';

export const metadata = { title: 'WagSave — Wagglebum' };

const plugin = content.plugins.find(p => p.slug === 'wagsave')!;

export default function WagSavePage() {
  return (
    <>
      <NavBar current="plugins" />

      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 pt-14 pb-6 text-center">
        <div className="mx-auto mb-5 flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-snow shadow-pop overflow-hidden border border-border">
          <Image src="/brand/wagsave/Logo.png" alt="WagSave" width={42} height={42} className="object-cover" />
        </div>
<h1 className="mt-4 text-[72px] font-black leading-none tracking-[-0.03em]">WagSave</h1>
        <p className="mx-auto mt-4 max-w-[580px] text-[20px] leading-relaxed text-fg-muted">
          A production-ready save system for Unity 2022.3+. Multiple formats, cloud sync, multi-slot support, autosave, and a full Editor toolset — drop it in and never write save code again.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Button href={plugin.externalLink} size="lg">Buy — {plugin.price} →</Button>
        </div>
      </section>

      {/* Price strip */}
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-8 px-6 py-5 text-[14px] font-semibold text-fg-muted">
        <div><strong className="font-extrabold text-ink">Unity 2022.3+</strong> · 2023 · 6</div>
        <div><strong className="font-extrabold text-ink">One-time</strong> · no subscription</div>
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
        <p className="mx-auto mt-2.5 max-w-[480px] text-[17px] text-fg-muted">Everything the engine should have shipped with.</p>
        <div className="mt-9 grid grid-cols-1 gap-[18px] text-left md:grid-cols-3">
          {[
            { num: '01', title: 'Multiple save formats', body: 'Binary, JSON, Text, and PlayerPrefs out of the box. Switch formats without changing your game code.' },
            { num: '02', title: 'Cloud save', body: 'Unity Cloud Save and Steam Cloud Save supported. Both are conditionally compiled — only active when the SDK is present.' },
            { num: '03', title: 'Save slots', body: 'Full multi-slot support so players can keep independent saves. Includes a ready-to-use slot selection UI you can customize.' },
            { num: '04', title: 'Autosave', body: 'Interval-based and event-driven autosave, configured visually in the Editor. No code required.' },
            { num: '05', title: 'Encryption, compression & signing', body: 'Composable per-profile: protect files from tampering, shrink them on disk, or sign them to detect corruption.' },
            { num: '06', title: 'Editor toolset', body: 'Visual config, debug views, and the ability to simulate save and load operations without entering Play Mode.' },
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
          <h2 className="mt-3 text-[36px] font-black leading-tight tracking-[-0.02em]">Two calls. That&apos;s just the start</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted">
            Drop the package in, configure your save profile in the Editor, then call <code className="rounded-md bg-bone px-1.5 py-0.5 font-mono text-sm">WagSave.Save()</code> and <code className="rounded-md bg-bone px-1.5 py-0.5 font-mono text-sm">WagSave.Load()</code>. Format, cloud, and encryption are all set from the inspector.
          </p>
        </div>
        <pre className="overflow-x-auto rounded-[16px] bg-ink p-5 font-mono text-[13px] leading-relaxed text-snow shadow-md">
          <span className="text-stone">{'// 1. Define your save data'}</span>{'\n'}
          <span className="text-blush-100">{'public class'}</span>{' MySaveData {\n'}
          {'  '}<span className="text-blush-100">{'public int'}</span>{' level;\n'}
          {'  '}<span className="text-blush-100">{'public float'}</span>{' timePlayed;\n'}
          {'  '}<span className="text-blush-100">{'public'}</span>{' List<string> unlockedItems;\n'}{'}'}
          {'\n\n'}
          <span className="text-stone">{'// 2. Save and load — that\'s it'}</span>{'\n'}
          {'using WaggleBum.WagSave;\n\n'}
          {'WagSave.Save(saveData);\n'}
          <span className="text-blush-100">{'var'}</span>{' data = WagSave.Load<MySaveData>();'}
        </pre>
      </section>

      {/* Compat */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {[
            { v: 'Unity 6', s: 'Fully supported' },
            { v: 'Unity 2023', s: 'Fully supported' },
            { v: 'Unity 2022.3', s: 'Minimum version' },
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
        <div className="mt-9 flex flex-wrap justify-center gap-[18px] text-left">
          {[
            {
              name: 'Standard', price: plugin.price, sub: 'one-time', desc: 'For any dev, any team size.',
              items: ['All features', 'Best-effort support for bugs and feature requests'],
              featured: true, cta: 'Buy now →', variant: 'primary' as const, href: plugin.externalLink,
            },
            {
              name: 'Source', price: 'Talk', sub: 'to us', desc: 'Source access & royalty-free distribution.',
              items: ['Full source code', 'Custom SLA'],
              featured: false, cta: 'Get in touch →', variant: 'ghost' as const, href: '/support',
            },
          ].map(t => (
            <div key={t.name} className={`w-full max-w-[340px] flex flex-col gap-3.5 rounded-[20px] p-7 ${t.featured ? 'border-2 border-ink bg-snow shadow-pop' : 'border border-border bg-snow shadow-sm'}`}>
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
              <Button href={t.href} variant={t.variant} className="mt-auto">{t.cta}</Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[760px] px-6 pb-16">
        <h2 className="mb-7 text-center text-[36px] font-black tracking-[-0.02em]">Fair questions</h2>
        <div className="flex flex-col gap-2.5">
          {[
            {
              q: 'Which Unity versions are supported?',
              a: 'Unity 2022.3 and above — including Unity 2023 and Unity 6. Versions before 2022 LTS are not supported.',
            },
            {
              q: 'Which platforms does WagSave run on?',
              a: 'Desktop (Windows, macOS, Linux), mobile (iOS, Android), WebGL, and console. Cloud save is available via Unity Gaming Services and Steam — both are optional and only activate if the SDK is present in your project.',
            },
            {
              q: 'Do I need Steamworks or Unity Gaming Services to use WagSave?',
              a: 'No — both are entirely optional. If the SDK is not in your project, those cloud formats are automatically disabled and will not appear in the Editor. Everything else works without them.',
            },
            {
              q: 'Can I use multiple save formats in the same project?',
              a: 'Yes. WagSave supports per-profile configuration, so you can use different formats for different use cases in the same game — for example, binary for save slots and PlayerPrefs for lightweight settings.',
            },
            {
              q: 'Can I use my own serializer or save format?',
              a: 'Yes. WagSave is built to be extended. You can implement the format interface to add a new output format, or override an existing one without modifying package source code. Same goes for serializers.',
            },
            {
              q: 'How do I debug save and load issues?',
              a: 'WagSave includes an extensive logging system and Editor debug views for inspecting save state, slot contents, and serializer output. You can also simulate save and load operations directly from the Editor without entering Play Mode.',
            },
            {
              q: 'Is this really a one-time purchase?',
              a: "Yes. Buy once, own it forever. We think subscriptions for dev tools are silly.",
            },
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
