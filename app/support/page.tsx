import { NavBar, Footer, Eyebrow, Button } from '@/components/wagglebum';

export const metadata = { title: 'Support — Wagglebum' };

const topics = [
  {
    icon: '🎮',
    title: 'Games',
    body: 'Bugs, crashes, save issues, or anything wrong with Hello, Good Dog, Shuttle Run, or any other Wagglebum title.',
  },
  {
    icon: '🔌',
    title: 'Plugins & tools',
    body: 'WagSave integration questions, licensing, Unity version compatibility, or unexpected behavior in your project.',
  },
  {
    icon: '🧾',
    title: 'Orders & billing',
    body: 'License keys, refunds, receipts, or transferring a license to a new machine or studio.',
  },
  {
    icon: '🤝',
    title: 'Press & partnerships',
    body: 'Review copies, media assets, co-marketing, or anything business-related.',
  },
];

const faqs = [
  {
    q: 'How fast will I get a reply?',
    a: "We aim to respond within one business day — usually sooner. We're a small team, so we read every message ourselves.",
  },
  {
    q: 'What should I include in my email?',
    a: "Your order number or invoice (if it's a billing question), the platform and OS you're on, and a short description of what went wrong. Screenshots or crash logs help a lot.",
  },
  {
    q: 'Is there a community forum or Discord?',
    a: 'Studio-tier WagSave customers get access to a private Discord channel. For everyone else, email is the fastest path to us.',
  },
];

export default function SupportPage() {
  return (
    <>
      <NavBar current="support" />

      {/* Hero */}
      <section className="mx-auto max-w-[760px] px-6 pt-16 pb-10 text-center">
        <Eyebrow>Support</Eyebrow>
        <h1 className="mt-4 text-[clamp(44px,6vw,72px)] font-black leading-[1.02] tracking-[-0.025em]">
          We&apos;re here to help.
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[19px] leading-relaxed text-fg-muted text-pretty">
          Got a bug, a billing question, or just stuck? Send us an email — a real person will read it and write back.
        </p>
      </section>

      {/* Email CTA — the main action */}
      <section className="mx-auto max-w-[760px] px-6 pb-14">
        <div className="rounded-[24px] border-2 border-ink bg-snow p-8 shadow-pop text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bone text-[28px]">
            ✉️
          </div>
          <h2 className="text-[28px] font-black tracking-[-0.02em]">Email us</h2>
          <p className="mx-auto mt-2 max-w-[400px] text-[16px] leading-relaxed text-fg-muted">
            One inbox, real humans. We typically reply within one business day.
          </p>
          <a
            href="mailto:support@wagglebum.com"
            className="mt-5 inline-block text-[22px] font-extrabold text-ink no-underline hover:underline"
          >
            support@wagglebum.com
          </a>
          <div className="mt-6">
            <Button href="mailto:support@wagglebum.com" size="lg">Send us an email →</Button>
          </div>
        </div>
      </section>

      {/* What we can help with */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14 text-center">
        <Eyebrow>What we can help with</Eyebrow>
        <h2 className="mt-3 text-[36px] font-black tracking-[-0.025em]">Any question, any product.</h2>
        <div className="mt-9 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {topics.map(t => (
            <div key={t.title} className="rounded-[18px] border border-border bg-snow p-6 shadow-xs">
              <div className="mb-3 text-[28px] leading-none">{t.icon}</div>
              <h3 className="text-[17px] font-extrabold">{t.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[760px] px-6 pb-20">
        <h2 className="mb-7 text-center text-[36px] font-black tracking-[-0.02em]">Common questions</h2>
        <div className="flex flex-col gap-2.5">
          {faqs.map(faq => (
            <div key={faq.q} className="rounded-[14px] border border-border bg-snow p-5">
              <strong className="block text-[15px] font-extrabold">{faq.q}</strong>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Bottom nudge */}
        <div className="mt-10 rounded-[18px] bg-bone px-8 py-7 text-center">
          <p className="text-[16px] font-semibold text-ink">Still need help?</p>
          <p className="mt-1 text-[14px] text-fg-muted">Drop us a line — no bots, no ticket queues.</p>
          <a
            href="mailto:support@wagglebum.com"
            className="mt-3 inline-block text-[15px] font-extrabold text-ink no-underline hover:underline"
          >
            support@wagglebum.com →
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
