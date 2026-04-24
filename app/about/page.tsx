import Image from 'next/image';
import { NavBar, Footer, Eyebrow, Button } from '@/components/wagglebum';

export const metadata = { title: 'About — Wagglebum' };

const values = [
  {
    num: '01',
    title: 'Finish things.',
    body: "A shipped prototype beats a perfect design doc. We bias toward done — small scope, real release, learn and go again.",
  },
  {
    num: '02',
    title: 'Build what we need.',
    body: "Every plugin started as something we were frustrated not to have. If it solves our problem well, it probably solves yours too.",
  },
  {
    num: '03',
    title: "Charge fairly, once.",
    body: "No subscriptions. No seat fees. Buy it, own it. We'd rather have happy customers than recurring billing anxiety.",
  },
  {
    num: '04',
    title: 'Stay small on purpose.',
    body: "Big teams make big games. We make small ones, carefully. That constraint is a feature, not a bug.",
  },
];

export default function AboutPage() {
  return (
    <>
      <NavBar current="about" />

      {/* Hero */}
      <section className="mx-auto max-w-[760px] px-6 pt-16 pb-12 text-center">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-4 text-[clamp(44px,6vw,72px)] font-black leading-[1.02] tracking-[-0.025em]">
          A tiny studio.<br />A waggly logo.
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[19px] leading-relaxed text-fg-muted text-pretty">
          Wagglebum is an independent game studio that also builds the tools we wish existed. We make cozy games and practical plugins — both with the same care.
        </p>
      </section>

      {/* Mascot */}
      <div className="flex justify-center pb-12">
        <Image
          src="/brand/logo.png"
          alt="Wagglebum mascot"
          width={180}
          height={180}
          className="animate-wiggle"
        />
      </div>

      {/* Story */}
      <section className="mx-auto max-w-[760px] px-6 pb-16">
        <div className="rounded-[24px] bg-bone px-10 py-10">
          <Eyebrow>Our story</Eyebrow>
          <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">
            Wagglebum started as a side project — one game, one plugin, one very opinionated save system. The name came from a dog, the logo followed, and somehow it turned into a studio.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">
            We spend half our time making games we want to play and the other half building tools that make that easier. The plugins are real — we use every one of them in our own projects before asking anyone else to pay for them.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">
            We&apos;re a small team. That means you&apos;re talking to the people who wrote the code when you email support.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-[1100px] px-6 pb-16 text-center">
        <Eyebrow>How we work</Eyebrow>
        <h2 className="mt-3 text-[36px] font-black tracking-[-0.025em]">Things we actually believe.</h2>
        <div className="mt-9 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {values.map(v => (
            <div key={v.num} className="rounded-[18px] border border-border bg-snow p-6 shadow-xs">
              <div className="font-mono text-[11px] font-bold text-fg-subtle">{v.num}</div>
              <h3 className="mt-2 text-[18px] font-extrabold">{v.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA row */}
      <section className="mx-auto max-w-[760px] px-6 pb-20 text-center">
        <h2 className="text-[32px] font-black tracking-[-0.02em]">Come find us.</h2>
        <p className="mx-auto mt-3 max-w-[440px] text-[16px] text-fg-muted">
          Play the games, try the plugins, or just say hello. We read every email.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href="/games" size="lg">Play our games →</Button>
          <Button href="/plugins" variant="secondary" size="lg">Browse plugins</Button>
          <Button href="/support" variant="ghost" size="lg">Get in touch</Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
