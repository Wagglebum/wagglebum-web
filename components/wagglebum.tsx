import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

/* ---------- Atoms ---------- */

export function Button({
  children, href, variant = 'primary', size = 'md', className = '',
}: {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const base = 'inline-flex items-center gap-2 rounded-full font-extrabold transition-transform active:translate-y-px';
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-5 py-3 text-[15px]', lg: 'px-7 py-3.5 text-base' };
  const variants = {
    primary: 'bg-ink text-snow border-2 border-ink shadow-pop hover:-translate-y-0.5',
    secondary: 'bg-snow text-ink border-2 border-ink shadow-pop hover:-translate-y-0.5',
    ghost: 'bg-transparent text-ink hover:bg-bone',
  };
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  return href ? <Link href={href} className={cls}>{children}</Link> : <button className={cls}>{children}</button>;
}

export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'dark' | 'blush' | 'ok' }) {
  const tones = {
    neutral: 'bg-bone text-ink border border-border',
    dark: 'bg-ink text-snow',
    blush: 'bg-blush-50 text-blush-700',
    ok: 'bg-ok/10 text-ok',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-extrabold text-stone uppercase tracking-[0.08em]">{children}</span>;
}

/* ---------- Navigation ---------- */

export function NavBar({ current }: { current?: 'home' | 'games' | 'plugins' | 'services' | 'about' }) {
  const items: { id: string; label: string; href: string }[] = [
    { id: 'games', label: 'Games', href: '/games' },
    { id: 'plugins', label: 'Plugins', href: '/plugins' },
    { id: 'services', label: 'Services', href: '/services' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'blog', label: 'Blog', href: '/blog' },
  ];
  return (
    <nav className="sticky top-4 z-30 mx-auto mt-4 flex max-w-[1100px] items-center gap-4 rounded-full border border-border bg-paper/90 px-4 py-2.5 shadow-md backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2.5 text-ink no-underline">
        <Image src="/brand/logo.png" alt="" width={34} height={34} priority />
        <span className="text-[18px] font-black uppercase tracking-tight">Wagglebum</span>
      </Link>
      <div className="ml-3 flex gap-1">
        {items.map(i =>
          <Link key={i.id} href={i.href}
            className={`rounded-full px-3.5 py-2 text-sm font-semibold no-underline transition-colors ${current === i.id ? 'bg-ink text-snow' : 'text-ink hover:bg-bone'}`}>
            {i.label}
          </Link>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <Link href="/signin" className="px-3.5 py-2 text-sm font-bold text-ink no-underline">Sign in</Link>
        <Button href="/get-started" size="sm">Get started →</Button>
      </div>
    </nav>
  );
}

/* ---------- Cards ---------- */

export function Card({
  children, featured = false, className = '',
}: { children: ReactNode; featured?: boolean; className?: string }) {
  const cls = featured
    ? 'border-2 border-ink shadow-pop'
    : 'border border-border shadow-sm';
  return <div className={`rounded-[20px] bg-snow p-6 ${cls} ${className}`}>{children}</div>;
}

export function ProductCard({
  tag, title, body, href, featured,
}: { tag: string; title: string; body: string; href: string; featured?: boolean }) {
  return (
    <Card featured={featured} className="flex min-h-[180px] flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <Eyebrow>{tag}</Eyebrow>
        {featured && <Tag tone="blush">New</Tag>}
      </div>
      <h3 className="text-[22px] font-extrabold tracking-tight">{title}</h3>
      <p className="text-[15px] leading-relaxed text-fg-muted">{body}</p>
      <Link href={href} className="mt-auto text-sm font-bold text-ink no-underline">Learn more →</Link>
    </Card>
  );
}

export function GameCard({
  title, tag, href, cover,
}: { title: string; tag: string; href: string; cover?: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[20px] border border-border bg-snow no-underline shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] bg-bone">
        {cover && <Image src={cover} alt="" fill className="object-cover" />}
      </div>
      <div className="flex items-center justify-between gap-3 p-5">
        <div>
          <Eyebrow>{tag}</Eyebrow>
          <h3 className="mt-1 text-[20px] font-extrabold tracking-tight">{title}</h3>
        </div>
        <span aria-hidden className="text-xl text-ink transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}

/* ---------- Hero ---------- */

export function Hero({
  eyebrow, title, body, primary, secondary, mascot = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  body: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  mascot?: boolean;
}) {
  return (
    <section className="mx-auto max-w-[960px] px-6 pt-20 pb-10 text-center">
      {eyebrow && <Tag tone="blush"><span className="h-1.5 w-1.5 rounded-full bg-blush-500 inline-block" />{eyebrow}</Tag>}
      <h1 className="mt-6 text-[clamp(48px,7vw,88px)] font-black leading-[1.02] tracking-[-0.025em] text-balance">{title}</h1>
      <p className="mx-auto mt-5 max-w-[620px] text-[19px] leading-relaxed text-fg-muted text-pretty">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {primary && <Button href={primary.href} size="lg">{primary.label} →</Button>}
        {secondary && <Button href={secondary.href} variant="secondary" size="lg">{secondary.label}</Button>}
      </div>
      {mascot && (
        <div className="mt-14 flex justify-center">
          <Image src="/brand/logo.png" alt="Wagglebum mascot" width={240} height={240} priority className="animate-wiggle" />
        </div>
      )}
    </section>
  );
}

/* ---------- Footer ---------- */

export function Footer() {
  const cols: [string, { label: string; href: string }[]][] = [
    ['Games', [{ label: 'Hello, Good Dog', href: '/games/hello-good-dog' }, { label: 'Shuttle Run', href: '/games' }, { label: 'Sweepers', href: '/games' }, { label: 'All games →', href: '/games' }]],
    ['Plugins', [{ label: 'WagSave', href: '/plugins/wagsave' }, { label: 'Crowd AI', href: '/plugins' }, { label: 'SpriteBath', href: '/plugins' }]],
    ['Company', [{ label: 'About', href: '/about' }, { label: 'Blog', href: '/blog' }, { label: 'Press kit', href: '/press' }, { label: 'Contact', href: '/contact' }]],
  ];
  return (
    <footer className="mt-16 bg-ink px-6 pt-14 pb-8 text-snow">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <Image src="/brand/logo.png" alt="" width={42} height={42} className="invert hue-rotate-180" />
            <span className="text-[22px] font-black uppercase tracking-tight">Wagglebum</span>
          </div>
          <p className="max-w-[320px] text-sm leading-relaxed text-mist">
            Indie games and the tools to build them. A tiny studio, a waggly logo.
          </p>
        </div>
        {cols.map(([heading, items]) =>
          <div key={heading}>
            <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-widest text-mist">{heading}</div>
            <div className="flex flex-col gap-2.5">
              {items.map(i => (
                <Link key={i.label} href={i.href} className="text-sm font-medium text-snow no-underline hover:underline">
                  {i.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mx-auto mt-10 flex max-w-[1100px] justify-between border-t border-white/10 pt-6 text-xs text-mist">
        <div>© 2026 Wagglebum Studios — made with a waggle</div>
        <div>Boston, MA</div>
      </div>
    </footer>
  );
}
