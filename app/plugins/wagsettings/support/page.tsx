import Link from 'next/link';
import { NavBar, Footer, Eyebrow, Button } from '@/components/wagglebum';

export const metadata = {
  title: 'WagSettings Support',
  description: 'Get help with WagSettings — setup, the menus, rebinding, WagSave integration, Unity version compatibility, and documentation.',
};

// Issues are public on GitHub so answers help the next person too. The repository holds issues
// only; the package source is private.
const issuesRepo = 'Wagglebum/WagSettings';

async function getIssues(): Promise<{ id: number; number: number; title: string; html_url: string; state: string; user: { login: string } }[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${issuesRepo}/issues?state=open`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Each topic goes straight to the page of the docs that answers it.
const topics = [
  { label: 'Installation', href: '/docs/wagsettings/GettingStarted' },
  { label: 'Setup', href: '/docs/wagsettings/Setup' },
  { label: 'The editor window', href: '/docs/wagsettings/EditorWindow' },
  { label: 'Adding a setting', href: '/docs/wagsettings/Extensibility' },
  { label: 'Rebinding', href: '/docs/wagsettings/Settings/Controls' },
  { label: 'Persistence & WagSave', href: '/docs/wagsettings/Persistence' },
  { label: 'Localization', href: '/docs/wagsettings/Localization' },
  { label: 'API reference', href: '/docs/wagsettings/API' },
];

const code = 'rounded bg-bone px-1.5 py-0.5 font-mono text-[13px]';

export default async function WagSettingsSupportPage() {
  const issues = await getIssues();

  return (
    <>
      <NavBar current="plugins" />

      {/* Sub-nav breadcrumb + tabs */}
      <div className="border-b border-border bg-bone">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-2 px-6 py-3">
          <span className="text-[13px] font-semibold text-fg-subtle">
            <Link href="/plugins" className="text-fg-subtle no-underline hover:underline">Plugins</Link>
            <span className="mx-1.5 opacity-50">/</span>
            <Link href="/plugins/wagsettings" className="text-fg-subtle no-underline hover:underline">WagSettings</Link>
            <span className="mx-1.5 opacity-50">/</span>
            <strong className="text-ink">Support</strong>
          </span>
          <div className="ml-auto flex gap-1">
            {[
              { label: 'Overview', href: '/plugins/wagsettings' },
              { label: 'Docs', href: '/docs/wagsettings/index' },
              { label: 'Support', href: '/plugins/wagsettings/support', active: true },
            ].map(t => (
              <Link
                key={t.label}
                href={t.href}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold no-underline ${t.active ? 'bg-ink text-snow' : 'text-fg-muted hover:text-ink'}`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Page hero */}
      <section className="mx-auto max-w-[1100px] px-6 pb-4 pt-10">
        <Eyebrow>WagSettings support</Eyebrow>
        <h1 className="mt-3 text-[48px] font-black leading-tight tracking-[-0.025em]">We&apos;ll help you get set up.</h1>
        <p className="mt-2.5 max-w-[560px] text-[17px] text-fg-muted">
          Real humans answer within 48h. Most questions are answered in the docs, which ship inside the package and live here too.
        </p>
      </section>

      {/* Three-column layout */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-7 px-6 pb-20 pt-8 md:grid-cols-[260px_1fr_260px] md:items-start">
        {/* Left sidebar — topics */}
        <aside className="md:sticky md:top-6">
          <h4 className="mb-2.5 px-2.5 text-[11px] font-extrabold uppercase tracking-widest text-fg-subtle">Topics</h4>
          <nav className="flex flex-col gap-0.5">
            {topics.map((t, i) => (
              <Link
                key={t.label}
                href={t.href}
                className={`flex items-center justify-between rounded-[10px] px-3 py-2 text-[14px] font-medium no-underline ${i === 0 ? 'bg-ink text-snow font-bold' : 'text-ink hover:bg-bone'}`}
              >
                {t.label}
                <span className="opacity-40">›</span>
              </Link>
            ))}
          </nav>
          {/* Contact card */}
          <div className="mt-3.5 rounded-[16px] bg-ink p-5 text-snow">
            <strong className="block text-[15px] font-extrabold">Still stuck?</strong>
            <p className="mt-1.5 text-[13px] leading-relaxed text-mist">
              Open an issue with your Unity version, the WagSettings version from the Help page, and what you expected to happen.
            </p>
            <Button href={`https://github.com/${issuesRepo}/issues/new`} variant="secondary" size="sm" className="mt-3 bg-snow">Open an issue →</Button>
          </div>
        </aside>

        {/* Main article */}
        <article className="rounded-[20px] border border-border bg-snow p-8 shadow-sm md:p-9">
          <div className="mb-4 flex gap-2.5 text-[12px] font-semibold text-fg-subtle">
            <span>Installation</span>
            <span>·</span>
            <span>Unity 2022.3+</span>
            <span>·</span>
            <span>5 min read</span>
          </div>
          <h1 className="mb-3 text-[36px] font-black leading-tight tracking-[-0.02em]">From empty project to working menu</h1>
          <p className="mb-4 text-[16px] leading-[1.7] text-fg-muted">
            WagSettings is a UPM package. Import it, open the editor, run setup, press Play. The full walkthrough is in{' '}
            <Link href="/docs/wagsettings/GettingStarted" className="font-bold text-ink">Getting Started</Link>; this is the short version.
          </p>

          <h2 className="mb-2.5 mt-7 text-[22px] font-extrabold tracking-tight">1 · Install</h2>
          <ol className="mb-4 flex flex-col gap-1.5 pl-5 text-[16px] leading-[1.7] text-fg-muted">
            <li>From the <strong className="font-bold text-ink">Asset Store</strong>: <strong className="font-bold text-ink">Window → Package Manager</strong>, switch to <strong className="font-bold text-ink">My Assets</strong>, <strong className="font-bold text-ink">Download</strong>, then <strong className="font-bold text-ink">Import</strong>.</li>
            <li>From a tarball: <strong className="font-bold text-ink">Package Manager → + → Add package from tarball…</strong> and choose the <code className={code}>.tgz</code>.</li>
            <li>Confirm it: <strong className="font-bold text-ink">Tools → WaggleBum → WagSettings</strong> is in the menu bar, and <code className={code}>WAGGLEBUM_WAGSETTINGS</code> is in your scripting defines.</li>
          </ol>

          <h2 className="mb-2.5 mt-7 text-[22px] font-extrabold tracking-tight">2 · Run setup</h2>
          <p className="mb-3 text-[16px] leading-[1.7] text-fg-muted">
            <strong className="font-bold text-ink">Tools → WaggleBum → WagSettings → Setup</strong>. Tick the categories you want, pick UI Toolkit or uGUI, pick a store, watch the preview, press <strong className="font-bold text-ink">Generate</strong>. A profile, its settings and the menu land in <code className={code}>Assets/WagSettings</code>. The Summary page then lists the two or three things left to do by hand.
          </p>

          <div className="my-4 rounded-[10px] border-l-[3px] border-blush-500 bg-blush-50 px-4 py-3.5 text-[14px] font-medium text-blush-700">
            Want rebinding? Install the <strong>Input System</strong> package first — the Summary page has a button that opens it in the Package Manager. Without it, everything except the Controls category works.
          </div>

          <h2 className="mb-2.5 mt-7 text-[22px] font-extrabold tracking-tight">3 · Press Play</h2>
          <p className="mb-3 text-[16px] leading-[1.7] text-fg-muted">
            The menu is in your scene and already saving. Reading a value from code is one line:
          </p>
          <pre className="mb-4 overflow-x-auto rounded-[14px] bg-ink p-5 font-mono text-[13px] leading-relaxed text-snow">
            <span className="text-blush-100">{'using'}</span>{' WaggleBum.WagSettings;\n\n'}
            <span className="text-blush-100">{'float'}</span>{' master = WagSettings.Get<'}<span className="text-blush-100">{'float'}</span>{'>('}<span className="text-[#b2d8b2]">{'"audio.master"'}</span>{');'}
          </pre>

          <h2 className="mb-2.5 mt-7 text-[22px] font-extrabold tracking-tight">Something off?</h2>
          <ul className="mb-4 flex flex-col gap-1.5 pl-5 text-[16px] leading-[1.7] text-fg-muted">
            <li><strong className="font-bold text-ink">The menu shows English.</strong> Call <code className={code}>SettingsMenuLocalization.Apply(&quot;ja&quot;)</code> before it opens; see <Link href="/docs/wagsettings/Localization" className="font-bold text-ink">Localization</Link>.</li>
            <li><strong className="font-bold text-ink">A setting is not in the menu.</strong> It has to be in the profile&apos;s list — the Settings Profile page shows what is, and flags a bad key.</li>
            <li><strong className="font-bold text-ink">Values do not survive a restart.</strong> Check the store on the profile, and that <code className={code}>Apply</code> is being called; <code className={code}>Set</code> is pending until then. See <Link href="/docs/wagsettings/Persistence" className="font-bold text-ink">Persistence</Link>.</li>
            <li><strong className="font-bold text-ink">Something throws.</strong> Every error names the fix in its message. The Debugger page shows the live state in Play mode.</li>
          </ul>

          {/* Open GitHub issues */}
          {issues.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-[22px] font-extrabold tracking-tight">Open issues on GitHub</h2>
              <div className="flex flex-col gap-2">
                {issues.slice(0, 10).map(issue => (
                  <Link
                    key={issue.id}
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-4 rounded-[12px] border border-border p-4 no-underline text-ink transition-shadow hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-[15px]">{issue.title}</span>
                      <div className="mt-1 text-[12px] text-fg-subtle">opened by {issue.user.login}</div>
                    </div>
                    <span className="flex-none text-[12px] font-semibold text-fg-subtle">#{issue.number}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link
            href={`https://github.com/${issuesRepo}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-[14px] font-bold text-ink no-underline"
          >
            Submit a new issue →
          </Link>
        </article>

        {/* Right sidebar — table of contents */}
        <aside className="md:sticky md:top-6">
          <h4 className="mb-2.5 px-2.5 text-[11px] font-extrabold uppercase tracking-widest text-fg-subtle">On this page</h4>
          <div className="flex flex-col gap-0.5">
            {[
              'Install',
              'Run setup',
              'Press Play',
              'Something off?',
            ].map((t, i) => (
              <span
                key={t}
                className={`block rounded-lg px-2.5 py-1.5 text-[13px] ${i === 0 ? 'bg-bone font-bold text-ink' : 'text-fg-muted'}`}
              >
                {t}
              </span>
            ))}
          </div>
          <h4 className="mb-2.5 mt-6 px-2.5 text-[11px] font-extrabold uppercase tracking-widest text-fg-subtle">Docs</h4>
          <div className="flex flex-col gap-0.5">
            {[
              { label: 'Getting Started', href: '/docs/wagsettings/GettingStarted' },
              { label: 'Cheatsheet', href: '/docs/wagsettings/Cheatsheet' },
              { label: 'Glossary', href: '/docs/wagsettings/Glossary' },
            ].map(d => (
              <Link key={d.href} href={d.href} className="block rounded-lg px-2.5 py-1.5 text-[13px] text-fg-muted no-underline hover:text-ink">
                {d.label}
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <Footer />
    </>
  );
}
