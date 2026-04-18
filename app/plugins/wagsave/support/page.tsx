import Link from 'next/link';
import { Search } from 'lucide-react';
import { NavBar, Footer, Eyebrow, Button } from '@/components/wagglebum';

export const metadata = { title: 'WagSave Support — Wagglebum' };

async function getIssues(): Promise<{ id: number; number: number; title: string; html_url: string; state: string; user: { login: string } }[]> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/Wagglebum/WagSave/issues?state=open',
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const topics = [
  'Installation', 'Cloud sync', 'Migrations', 'Encryption',
  'Platforms', 'Troubleshooting', 'Licensing', 'API reference',
];

export default async function WagSaveSupportPage() {
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
            <Link href="/plugins/wagsave" className="text-fg-subtle no-underline hover:underline">WagSave</Link>
            <span className="mx-1.5 opacity-50">/</span>
            <strong className="text-ink">Support</strong>
          </span>
          <div className="ml-auto flex gap-1">
            {[
              { label: 'Overview', href: '/plugins/wagsave' },
              { label: 'Docs', href: '#' },
              { label: 'Changelog', href: '#' },
              { label: 'Support', href: '/plugins/wagsave/support', active: true },
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
        <Eyebrow>WagSave support</Eyebrow>
        <h1 className="mt-3 text-[48px] font-black leading-tight tracking-[-0.025em]">We&apos;ll help you get saved.</h1>
        <p className="mt-2.5 max-w-[560px] text-[17px] text-fg-muted">
          Real humans answer within 48h. In the meantime, here are the answers to the 20 questions we get most.
        </p>
        <div className="mt-5 flex max-w-[520px] items-center gap-2.5 rounded-full border-2 border-ink bg-snow px-5 py-3 shadow-pop">
          <Search size={18} className="flex-none text-stone" />
          <input
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-stone font-sans"
            placeholder="Search 124 articles — try 'cloud sync'"
          />
        </div>
      </section>

      {/* Three-column layout */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-7 px-6 pb-20 pt-8 md:grid-cols-[260px_1fr_260px] md:items-start">
        {/* Left sidebar — topics */}
        <aside className="md:sticky md:top-6">
          <h4 className="mb-2.5 px-2.5 text-[11px] font-extrabold uppercase tracking-widest text-fg-subtle">Topics</h4>
          <nav className="flex flex-col gap-0.5">
            {topics.map((t, i) => (
              <Link
                key={t}
                href="#"
                className={`flex items-center justify-between rounded-[10px] px-3 py-2 text-[14px] font-medium no-underline ${i === 0 ? 'bg-ink text-snow font-bold' : 'text-ink hover:bg-bone'}`}
              >
                {t}
                <span className="opacity-40">›</span>
              </Link>
            ))}
          </nav>
          {/* Contact card */}
          <div className="mt-3.5 rounded-[16px] bg-ink p-5 text-snow">
            <strong className="block text-[15px] font-extrabold">Still stuck?</strong>
            <p className="mt-1.5 text-[13px] leading-relaxed text-mist">
              Email us with your project version and WagSave version. We reply within 48 hours.
            </p>
            <Button href="#" variant="secondary" size="sm" className="mt-3 bg-snow">Open a ticket →</Button>
          </div>
        </aside>

        {/* Main article */}
        <article className="rounded-[20px] border border-border bg-snow p-8 shadow-sm md:p-9">
          <div className="mb-4 flex gap-2.5 text-[12px] font-semibold text-fg-subtle">
            <span>Installation</span>
            <span>·</span>
            <span>Updated Mar 2026</span>
            <span>·</span>
            <span>5 min read</span>
          </div>
          <h1 className="mb-3 text-[36px] font-black leading-tight tracking-[-0.02em]">Installing WagSave in 60 seconds</h1>
          <p className="mb-4 text-[16px] leading-[1.7] text-fg-muted">
            WagSave ships as a single <code className="rounded bg-bone px-1.5 py-0.5 font-mono text-[13px]">.unitypackage</code> and as a package via Unity&apos;s package manager. Pick whichever matches how you manage dependencies — both ship identical code.
          </p>

          <h2 className="mb-2.5 mt-7 text-[22px] font-extrabold tracking-tight">Option 1 · Asset Store (recommended)</h2>
          <ol className="mb-4 flex flex-col gap-1.5 pl-5 text-[16px] leading-[1.7] text-fg-muted">
            <li>Buy WagSave from the <Link href="#" className="font-bold text-ink">Unity Asset Store</Link>.</li>
            <li>Open <strong className="font-bold text-ink">Window → Package Manager</strong> in Unity.</li>
            <li>Switch the dropdown to <strong className="font-bold text-ink">My Assets</strong> and click <strong className="font-bold text-ink">Download</strong>, then <strong className="font-bold text-ink">Import</strong>.</li>
            <li>When prompted, import the whole package. You can remove the <code className="rounded bg-bone px-1.5 py-0.5 font-mono text-[13px]">Samples/</code> folder later if you don&apos;t need it.</li>
          </ol>

          <div className="my-4 rounded-[10px] border-l-[3px] border-blush-500 bg-blush-50 px-4 py-3.5 text-[14px] font-medium text-blush-700">
            Already have PlayerPrefs or JsonUtility saves in your project? WagSave can import them. See{' '}
            <Link href="#" className="font-extrabold text-blush-700 underline">Migrating existing saves</Link>.
          </div>

          <h2 className="mb-2.5 mt-7 text-[22px] font-extrabold tracking-tight">Option 2 · Git URL (for teams)</h2>
          <p className="mb-3 text-[16px] leading-[1.7] text-fg-muted">
            If you use Unity&apos;s package manager with git URLs, add this line to your <code className="rounded bg-bone px-1.5 py-0.5 font-mono text-[13px]">manifest.json</code>:
          </p>
          <pre className="mb-4 overflow-x-auto rounded-[14px] bg-ink p-5 font-mono text-[13px] leading-relaxed text-snow">
            <span className="text-stone">{'// Packages/manifest.json'}</span>{'\n'}
            {'{\n  '}<span className="text-[#b2d8b2]">{'"dependencies"'}</span>{': {\n    '}
            <span className="text-[#b2d8b2]">{'"dev.wagglebum.wagsave"'}</span>{': '}
            <span className="text-[#b2d8b2]">{'"https://git.wagglebum.dev/wagsave.git#v2.0"'}</span>
            {'\n  }\n}'}
          </pre>

          <h2 className="mb-2.5 mt-7 text-[22px] font-extrabold tracking-tight">Option 3 · OpenUPM</h2>
          <p className="mb-3 text-[16px] leading-[1.7] text-fg-muted">Run this at the root of your Unity project:</p>
          <pre className="mb-4 overflow-x-auto rounded-[14px] bg-ink p-5 font-mono text-[13px] leading-relaxed text-snow">
            openupm add dev.wagglebum.wagsave
          </pre>

          <h2 className="mb-2.5 mt-7 text-[22px] font-extrabold tracking-tight">Verify it&apos;s working</h2>
          <p className="mb-3 text-[16px] leading-[1.7] text-fg-muted">
            Create a new MonoBehaviour and paste the following. If it prints <code className="rounded bg-bone px-1.5 py-0.5 font-mono text-[13px]">saved!</code> in the console, you&apos;re good to go.
          </p>
          <pre className="mb-4 overflow-x-auto rounded-[14px] bg-ink p-5 font-mono text-[13px] leading-relaxed text-snow">
            <span className="text-blush-100">{'using'}</span>{' Wagglebum.WagSave;\n\n'}
            <span className="text-blush-100">{'void'}</span>{' Start() {\n  WagSave.Save('}
            <span className="text-[#b2d8b2]">{'"test"'}</span>{', '}<span className="text-blush-100">{'new'}</span>{' { hello = '}
            <span className="text-[#b2d8b2]">{'"world"'}</span>{'  });\n  Debug.Log('}
            <span className="text-[#b2d8b2]">{'"saved!"'}</span>{');\n}'}
          </pre>

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
              <Link
                href="https://github.com/Wagglebum/WagSave/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-[14px] font-bold text-ink no-underline"
              >
                Submit a new issue →
              </Link>
            </div>
          )}

          {/* Helpful widget */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5 rounded-[14px] bg-bone px-6 py-5">
            <strong className="font-extrabold">Was this helpful?</strong>
            <span className="text-[14px] text-fg-muted">118 of 124 people said yes.</span>
            <div className="ml-auto flex gap-1.5">
              {['Yes', 'No'].map(v => (
                <button key={v} className="rounded-full border border-border-strong bg-snow px-4 py-1.5 text-[13px] font-bold hover:bg-bone">{v}</button>
              ))}
            </div>
          </div>
        </article>

        {/* Right sidebar — table of contents */}
        <aside className="md:sticky md:top-6">
          <h4 className="mb-2.5 px-2.5 text-[11px] font-extrabold uppercase tracking-widest text-fg-subtle">On this page</h4>
          <div className="flex flex-col gap-0.5">
            {[
              'Introduction',
              'Option 1 · Asset Store',
              'Option 2 · Git URL',
              'Option 3 · OpenUPM',
              "Verify it's working",
            ].map((t, i) => (
              <Link
                key={t}
                href="#"
                className={`block rounded-lg px-2.5 py-1.5 text-[13px] no-underline ${i === 1 ? 'bg-bone font-bold text-ink' : 'text-fg-muted hover:text-ink'}`}
              >
                {t}
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <Footer />
    </>
  );
}
