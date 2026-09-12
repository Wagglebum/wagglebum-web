import Image from 'next/image';
import Link from 'next/link';
import { NavBar, Footer, Button, Eyebrow } from '@/components/wagglebum';
import { VimeoEmbed } from '@/components/VimeoEmbed';
import { pluginBySlug } from '@/lib/content';

const tagline = 'A settings and options menu system for Unity 2022.3+. Audio, display, graphics, control rebinding and accessibility, generated from one screen — and saving through WagSave the moment it is installed.';

export const metadata = {
  title: 'WagSettings',
  description: tagline,
  openGraph: {
    title: 'WagSettings — Unity Settings & Options Menu',
    description: tagline,
    images: [{ url: '/brand/wagsettings/Logo.png', width: 256, height: 256, alt: 'WagSettings' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'WagSettings — Unity Settings & Options Menu',
    description: tagline,
    images: ['/brand/wagsettings/Logo.png'],
  },
};

const plugin = pluginBySlug('wagsettings');
const forSale = plugin.buyLinks.length > 0 || Boolean(plugin.externalLink);

export default function WagSettingsPage() {
  return (
    <>
      <NavBar current="plugins" />

      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 pt-14 pb-6 text-center">
        <div className="mx-auto mb-5 flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-snow shadow-pop overflow-hidden border border-border">
          <Image src="/brand/wagsettings/Logo.png" alt="WagSettings" width={42} height={42} className="object-cover" />
        </div>
        <h1 className="mt-4 text-[72px] font-black leading-none tracking-[-0.03em]">WagSettings</h1>
        <p className="mx-auto mt-4 max-w-[620px] text-[20px] leading-relaxed text-fg-muted">
          {tagline}
        </p>
        <div className="mt-7 text-[40px] font-black leading-none tracking-[-0.02em]">
          {plugin.price}
          {forSale && <span className="ml-2 align-middle text-[16px] font-semibold text-fg-muted">one-time purchase</span>}
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2.5">
          {plugin.buyLinks.length > 0 ? (
            plugin.buyLinks.map(link => (
              <Button key={link.store} href={link.href} size="lg">Buy on {link.store} →</Button>
            ))
          ) : forSale ? (
            <Button href={plugin.externalLink} size="lg">Buy →</Button>
          ) : (
            <>
              <Button href="/docs/wagsettings/index" size="lg">Read the docs →</Button>
              <Button href="/plugins/wagsettings/support" variant="ghost" size="lg">Get notified</Button>
            </>
          )}
        </div>
      </section>

      {/* Price strip */}
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-8 px-6 py-5 text-[14px] font-semibold text-fg-muted">
        <div><strong className="font-extrabold text-ink">Unity 2022.3+</strong> · 2023 · 6</div>
        <div><strong className="font-extrabold text-ink">UI Toolkit</strong> · uGUI</div>
        <div><strong className="font-extrabold text-ink">One-time</strong> · no subscription</div>
      </div>

      {/* Hero image, once there is one */}
      {plugin.hero && (
        <section className="mx-auto max-w-[1100px] px-6 pb-14">
          <div className="rounded-[20px] bg-ink p-3.5 shadow-xl">
            <div className="relative overflow-hidden rounded-[10px]">
              <Image src={plugin.hero} alt="WagSettings in action" width={1072} height={603} className="w-full object-cover" />
            </div>
          </div>
        </section>
      )}

      {/* Video */}
      {plugin.vimeoUrl && (
        <section className="mx-auto max-w-[1100px] px-6 pb-14">
          <VimeoEmbed url={plugin.vimeoUrl} title={`${plugin.title} overview`} />
        </section>
      )}

      {/* Features */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14 text-center">
        <Eyebrow>Features</Eyebrow>
        <h2 className="mt-3 text-[40px] font-black leading-tight tracking-[-0.025em]">
          The options menu<br />you were going to write anyway.
        </h2>
        <p className="mx-auto mt-2.5 max-w-[480px] text-[17px] text-fg-muted">Every game needs one. None of them are interesting to build.</p>
        <div className="mt-9 grid grid-cols-1 gap-[18px] text-left md:grid-cols-3">
          {[
            { num: '01', title: 'Five categories, ready', body: 'Audio buses, resolution and window mode, quality tiers, control rebinding, and accessibility — subtitles, colour-blind modes, screen shake, text size. Each is a setting asset and an applier; nothing is hard-wired.' },
            { num: '02', title: 'Setup in one screen', body: 'Tick the categories, pick a UI framework and a store, watch the preview, press Generate. A profile, its settings, the mixer and the menu land in your project. Re-run it any time; it keeps what you added by hand.' },
            { num: '03', title: 'Two menus, one model', body: 'A UI Toolkit menu with a theme file, and a uGUI prefab with TextMeshPro. Same registry, same Apply / Revert / Reset, same search, same dirty-tracking. Restyle either without touching code.' },
            { num: '04', title: 'Rebinding that stays optional', body: 'Interactive rebinds, conflict detection and reset, on the Input System — in an assembly Unity only compiles when the package is present. No Input System, no rebinding, and everything else still works.' },
            { num: '05', title: 'Upgrades itself with WagSave', body: 'Stands alone on PlayerPrefs. Install WagSave and settings become versioned, migratable, encrypted and cloud-synced with nothing to change — the integration compiles only when WagSave is there.' },
            { num: '06', title: 'An editor you can live in', body: 'Summary, Setup, Settings Profile, Debugger and Help pages, each with its docs beside it, in six languages. Add a setting from a dialog; watch pending values in Play mode.' },
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
          <h2 className="mt-3 text-[36px] font-black leading-tight tracking-[-0.02em]">Three calls. Usually none.</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted">
            Run setup, press Play, and the menu is there — no code. When you do want a value, <code className="rounded-md bg-bone px-1.5 py-0.5 font-mono text-sm">WagSettings.Get</code> reads it, <code className="rounded-md bg-bone px-1.5 py-0.5 font-mono text-sm">Set</code> stages it, and <code className="rounded-md bg-bone px-1.5 py-0.5 font-mono text-sm">Apply</code> commits the batch. Appliers turn each value into the Unity effect for you.
          </p>
        </div>
        <pre className="overflow-x-auto rounded-[16px] bg-ink p-5 font-mono text-[13px] leading-relaxed text-snow shadow-md">
          <span className="text-stone">{'// Read a setting anywhere'}</span>{'\n'}
          {'using WaggleBum.WagSettings;\n\n'}
          <span className="text-blush-100">{'float'}</span>{' master = WagSettings.Get<'}<span className="text-blush-100">{'float'}</span>{'>('}<span className="text-[#b2d8b2]">{'"audio.master"'}</span>{');\n\n'}
          <span className="text-stone">{'// Change one - pending until Apply, so Revert still works'}</span>{'\n'}
          {'WagSettings.Set('}<span className="text-[#b2d8b2]">{'"display.fullscreen"'}</span>{', '}<span className="text-blush-100">{'false'}</span>{');\n'}
          {'WagSettings.Apply();\n\n'}
          <span className="text-stone">{'// Your own setting: one asset, one line to read it'}</span>{'\n'}
          <span className="text-blush-100">{'int'}</span>{' difficulty = WagSettings.Get<'}<span className="text-blush-100">{'int'}</span>{'>('}<span className="text-[#b2d8b2]">{'"gameplay.difficulty"'}</span>{');'}
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

      {/* Better together */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14">
        <div className="grid grid-cols-1 items-center gap-6 rounded-[28px] bg-bone px-10 py-10 md:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center gap-3">
            <div className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[14px] border border-border bg-snow">
              <Image src="/brand/wagsave/Logo.png" alt="WagSave" width={52} height={52} className="object-cover" />
            </div>
            <span className="text-[24px] font-black">+</span>
            <div className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[14px] border border-border bg-snow">
              <Image src="/brand/wagsettings/Logo.png" alt="WagSettings" width={52} height={52} className="object-cover" />
            </div>
          </div>
          <div>
            <Eyebrow>Better together</Eyebrow>
            <h3 className="mt-1.5 text-[22px] font-extrabold">Game foundations.</h3>
            <p className="mt-1 text-[14px] text-fg-muted">
              WagSettings persists through <Link href="/plugins/wagsave" className="font-bold text-ink">WagSave</Link> when it is installed: versioned settings that survive updates, multiple profiles, encryption, and cloud sync across devices. Neither needs the other; both are better with it.
            </p>
          </div>
          <Button href="/plugins/wagsave" variant="ghost">See WagSave →</Button>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14 text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="mt-3 text-[40px] font-black tracking-[-0.025em]">Buy once. Own it.</h2>
        <div className="mt-9 flex flex-wrap justify-center gap-[18px] text-left">
          {[
            {
              name: 'Standard', price: plugin.price, sub: forSale ? 'one-time' : 'on the Asset Store and Fab', desc: 'For any dev, any team size.',
              items: ['All five categories, both menus, the editor', 'Six languages, in the editor and the shipped menu', 'Best-effort support for bugs and feature requests'],
              featured: true, buyLinks: plugin.buyLinks, variant: 'primary' as const, href: forSale ? plugin.externalLink : '/plugins/wagsettings/support', cta: forSale ? 'Buy →' : 'Get notified →',
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
              {'buyLinks' in t && t.buyLinks && t.buyLinks.length > 0 ? (
                <div className="mt-auto flex flex-col gap-2">
                  {t.buyLinks.map(link => (
                    <Button key={link.store} href={link.href} variant={t.variant}>Buy on {link.store} →</Button>
                  ))}
                </div>
              ) : (
                <Button href={t.href!} variant={t.variant} className="mt-auto">{t.cta}</Button>
              )}
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
              q: 'Do I need WagSave?',
              a: 'No. WagSettings stands alone on PlayerPrefs. Install WagSave and it upgrades itself to versioned, encrypted, cloud-synced persistence with nothing to change; the integration is in an assembly Unity only compiles when WagSave is present.',
            },
            {
              q: 'Do I need the Input System package?',
              a: 'Only for control rebinding. Without it, the Controls category is simply unavailable and everything else works. Setup tells you which is which, and points you at the Package Manager if you want it.',
            },
            {
              q: 'UI Toolkit or uGUI?',
              a: 'Either. Setup generates a UI Toolkit menu with a theme file you can restyle, or a uGUI prefab with TextMeshPro. Both sit over the same model, so Apply / Revert / Reset, search and dirty-tracking work the same in each.',
            },
            {
              q: 'How do I add my own setting?',
              a: 'On the Settings Profile page, press Add Setting: pick a kind, type a key, set a default. The asset is made and added to the profile, and it is in the menu the next time you press Play. Read it with WagSettings.Get<T>("category.name"). Code only comes in when the value has to do something — an applier is a few lines.',
            },
            {
              q: 'Is it localized?',
              a: 'Yes. The editor, its page docs and these docs are in English, Spanish, Japanese, Korean, Simplified and Traditional Chinese, and the shipped menu can show the same six to players. Your own labels merge over the packaged ones.',
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
