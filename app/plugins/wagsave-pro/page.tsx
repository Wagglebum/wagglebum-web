import Image from 'next/image';
import Link from 'next/link';
import { NavBar, Footer, Button, Eyebrow } from '@/components/wagglebum';
import { VimeoEmbed } from '@/components/VimeoEmbed';
import { pluginBySlug } from '@/lib/content';

const tagline = 'Everything in WagSave, plus the complete source code of the core save system. Step through it, review it, change it, or use it outside Unity.';

export const metadata = {
  title: 'WagSave Pro',
  description: tagline,
  openGraph: {
    title: 'WagSave Pro — Unity Save System with Source',
    description: tagline,
    images: [{ url: '/brand/wagsave-pro/Social.jpg', width: 1200, height: 630, alt: 'WagSave Pro' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WagSave Pro — Unity Save System with Source',
    description: tagline,
    images: ['/brand/wagsave-pro/Social.jpg'],
  },
};

const plugin = pluginBySlug('wagsave-pro');
const standard = pluginBySlug('wagsave');

// What differs between the two editions is only how WagSave Core ships; everything else is the same.
const comparison: { label: string; standard: string; pro: string }[] = [
  { label: 'Price', standard: standard.price, pro: plugin.price },
  { label: 'Save formats, cloud save, slots, autosave', standard: 'Included', pro: 'Included' },
  { label: 'Encryption, compression, signing', standard: 'Included', pro: 'Included' },
  { label: 'Editor toolset, six languages', standard: 'Included', pro: 'Included' },
  { label: 'WagSave Core', standard: 'Precompiled DLL', pro: 'Full C# source' },
];

export default function WagSaveProPage() {
  return (
    <>
      <NavBar current="plugins" />

      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 pt-14 pb-6 text-center">
        <div className="mx-auto mb-5 flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-snow shadow-pop overflow-hidden border border-border">
          <Image src={plugin.logo} alt="WagSave Pro" width={42} height={42} className="object-cover" />
        </div>
        <h1 className="mt-4 text-[clamp(48px,9vw,72px)] font-black leading-none tracking-[-0.03em]">WagSave Pro</h1>
        <p className="mx-auto mt-4 max-w-[620px] text-[20px] leading-relaxed text-fg-muted">
          {tagline}
        </p>
        <div className="mt-7 text-[40px] font-black leading-none tracking-[-0.02em]">
          {plugin.price}<span className="ml-2 align-middle text-[16px] font-semibold text-fg-muted">one-time purchase</span>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2.5">
          {plugin.buyLinks.map(link => (
            <Button key={link.store} href={link.href} size="lg">Buy on {link.store} →</Button>
          ))}
          <Button href={standard.href} variant="ghost" size="lg">Start with free WagSave</Button>
        </div>
      </section>

      {/* Price strip */}
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-8 px-6 py-5 text-[14px] font-semibold text-fg-muted">
        <div><strong className="font-extrabold text-ink">Unity 2022.3+</strong> · 2023 · 6</div>
        <div><strong className="font-extrabold text-ink">Full source</strong> · core included</div>
        <div><strong className="font-extrabold text-ink">One-time</strong> · no subscription</div>
      </div>

      {/* Hero image */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14">
        <div className="rounded-[20px] bg-ink p-3.5 shadow-xl">
          <div className="relative overflow-hidden rounded-[10px]">
            <Image src={plugin.hero} alt="WagSave Pro: the friendly save system for everyone" width={1950} height={1300} className="w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Video */}
      {plugin.vimeoUrl && (
        <section className="mx-auto max-w-[1100px] px-6 pb-14">
          <VimeoEmbed url={plugin.vimeoUrl} title={`${plugin.title} overview`} />
        </section>
      )}

      {/* Why Pro */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14 text-center">
        <Eyebrow>Why Pro</Eyebrow>
        <h2 className="mt-3 text-[40px] font-black leading-tight tracking-[-0.025em]">
          Nothing hidden<br />behind a DLL.
        </h2>
        <p className="mx-auto mt-2.5 max-w-[560px] text-[17px] text-fg-muted">
          WagSave Core handles serialization, save files, encryption, compression, signing and save slots. In Pro it is ordinary C#, compiled with the rest of your project.
        </p>
        <div className="mt-9 grid grid-cols-1 gap-[18px] text-left md:grid-cols-2">
          {[
            { num: '01', title: 'Debug all the way through', body: 'Step from your code through WagSave and into Core, with breakpoints and a complete call stack.' },
            { num: '02', title: 'See what happens to your data', body: 'Read the code that encrypts, signs, compresses and writes your saves. Useful for security reviews, platform certification, and problems in shipped saves.' },
            { num: '03', title: 'Change Core to fit your game', body: 'Fix an issue or adjust how Core behaves without waiting for a release. Changes are yours to reapply after an update, so keep them small.' },
            { num: '04', title: 'Use Core outside Unity', body: 'Core has no Unity dependencies. Compile it into your own .NET tools — a save inspector, a server, a build step — that read and write the same save files.' },
          ].map(f => (
            <div key={f.num} className="rounded-[18px] border border-border bg-snow p-6 shadow-xs">
              <div className="font-mono text-[11px] font-bold text-fg-subtle">{f.num}</div>
              <h3 className="mt-2 text-[18px] font-extrabold">{f.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compare */}
      <section className="mx-auto max-w-[860px] px-6 pb-14 text-center">
        <Eyebrow>Compare</Eyebrow>
        <h2 className="mt-3 text-[40px] font-black tracking-[-0.025em]">Same features. One difference.</h2>
        <div className="relative mt-9 overflow-x-auto rounded-[20px] border border-border bg-snow text-left shadow-sm">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-border bg-bone">
                <th scope="col" className="px-3 py-3.5 sm:px-5"><span className="sr-only">Feature</span></th>
                <th scope="col" className="px-3 py-3.5 sm:px-5 font-extrabold">WagSave</th>
                <th scope="col" className="px-3 py-3.5 sm:px-5 font-extrabold">WagSave Pro</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(row => (
                <tr key={row.label} className="border-b border-border last:border-b-0">
                  <th scope="row" className="px-3 py-3.5 sm:px-5 text-left font-semibold text-fg-muted">{row.label}</th>
                  <td className="px-3 py-3.5 sm:px-5">{row.standard}</td>
                  <td className="px-3 py-3.5 sm:px-5 font-bold">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-[14px] text-fg-muted">
          See the full feature list on the <Link href={standard.href} className="font-bold text-ink">WagSave page</Link>.
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[760px] px-6 pb-16">
        <h2 className="mb-7 text-center text-[36px] font-black tracking-[-0.02em]">Fair questions</h2>
        <div className="flex flex-col gap-2.5">
          {[
            {
              q: 'Do I need Pro?',
              a: 'If you only need to save and load data from Unity, and extend WagSave through its extension points, the free edition does everything you need. Pro is for teams that want the source.',
            },
            {
              q: 'How do I move from WagSave to WagSave Pro?',
              a: 'Remove WagSave first; the two editions cannot be installed together. For an Asset Store install, delete Assets/WaggleBum/WagSave/Core/WaggleBum.WagSave.Core.dll, then import WagSave Pro over the existing folder. If your own assembly definitions use Core types directly, add WaggleBum.WagSave.Core to their references.',
            },
            {
              q: 'Will my existing saves keep working?',
              a: 'Yes. Pro uses the same namespaces, class names, asset GUIDs and save-file formats, so your scenes, WagSave assets and existing save files carry over.',
            },
            {
              q: 'Which Unity versions are supported?',
              a: 'Unity 2022.3 and above — including Unity 2023 and Unity 6. Versions before 2022 LTS are not supported.',
            },
            {
              q: 'Is this really a one-time purchase?',
              a: 'Yes. Buy once, own it forever. We think subscriptions for dev tools are silly.',
            },
          ].map(faq => (
            <div key={faq.q} className="rounded-[14px] border border-border bg-snow p-5">
              <strong className="block text-[15px] font-extrabold">{faq.q}</strong>
              <p className="mt-1.5 break-words text-[14px] leading-relaxed text-fg-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
