import Image from 'next/image';
import { NavBar, Footer, Button, Tag, Eyebrow } from '@/components/wagglebum';

export const metadata = {
  title: 'Hello, Good Dog — Wagglebum',
};

export default function HelloGoodDogPage() {
  return (
    <>
      <NavBar current="games" />

      {/* Split hero */}
      <section className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-6 pt-12 pb-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="aspect-[4/3] rounded-[24px] border border-border bg-bone shadow-md flex items-center justify-center font-mono text-sm text-stone">
          [ Hero key-art · 1600×1200 ]
        </div>
        <div>
          <Tag tone="blush">Out now</Tag>
          <h1 className="mt-3.5 text-[72px] font-black leading-none tracking-[-0.03em]">
            Hello,<br />Good Dog.
          </h1>
          <p className="mt-4 max-w-[480px] text-[19px] leading-relaxed text-fg-muted">
            A cozy puzzler about walking a very good dog through a very small town. 2–4 hours. No tutorials. Just vibes.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button href="#" size="lg">Buy on Steam — $14.99 →</Button>
            <Button href="#" variant="secondary" size="lg">itch.io</Button>
          </div>
        </div>
      </section>

      {/* Meta strip */}
      <div className="mx-auto my-8 flex max-w-[1100px] flex-wrap items-center justify-center gap-8 rounded-full bg-ink px-12 py-4 text-[14px] font-semibold text-snow mx-6 md:mx-auto">
        <div><span className="text-mist">Released</span> · Apr 2026</div>
        <div><span className="text-mist">Playtime</span> · 2–4h</div>
        <div><span className="text-mist">Platforms</span> · Steam · itch.io · Switch</div>
        <div><span className="text-mist">Made by</span> · Wagglebum</div>
      </div>

      {/* Gallery */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-3 gap-3.5 px-6">
        <div className="col-span-1 row-span-2 rounded-[16px] border border-border bg-ink-soft flex items-center justify-center font-mono text-xs text-mist" style={{ minHeight: '240px' }}>
          [ Screenshot · gameplay ]
        </div>
        <div className="aspect-[16/10] rounded-[16px] border border-border bg-bone flex items-center justify-center font-mono text-xs text-stone">[ Screenshot 2 ]</div>
        <div className="aspect-[16/10] rounded-[16px] border border-border bg-bone flex items-center justify-center font-mono text-xs text-stone">[ Screenshot 3 ]</div>
        <div className="aspect-[16/10] rounded-[16px] border border-border bg-bone flex items-center justify-center font-mono text-xs text-stone">[ Screenshot 4 ]</div>
        <div className="aspect-[16/10] rounded-[16px] border border-border bg-bone flex items-center justify-center font-mono text-xs text-stone">[ Screenshot 5 ]</div>
      </div>

      {/* About */}
      <section className="mx-auto max-w-[820px] px-6 py-14">
        <Eyebrow>About the game</Eyebrow>
        <h2 className="mt-3 text-[40px] font-black leading-tight tracking-[-0.025em]">
          You and your dog. That&apos;s it. That&apos;s the game.
        </h2>
        <p className="mt-3.5 text-[17px] leading-[1.7] text-fg-muted">
          You&apos;ve just moved to a small town on the coast. You don&apos;t know anyone. But your dog — your very good dog — does. Walk every morning, meet the neighbours, solve small puzzles about who&apos;s where when.
        </p>
        <p className="mt-3.5 text-[17px] leading-[1.7] text-fg-muted">
          Hello, Good Dog is deliberately small. No inventory. No currency. No enemies. Just a route, a leash, and a warm pile of people to get to know.
        </p>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { title: '≈20 gentle puzzles', body: 'Based on routes, routines, and who was where yesterday.' },
            { title: '12 neighbours', body: 'Each with their own story, written with care, told slowly.' },
            { title: 'One very good dog', body: "Named whatever you'd like. She knows the way." },
          ].map(f => (
            <div key={f.title} className="rounded-[18px] border border-border bg-snow p-5 shadow-xs">
              <h3 className="text-[17px] font-extrabold">{f.title}</h3>
              <p className="mt-1.5 text-[14px] text-fg-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-[720px] px-6 pb-14 text-center">
        <blockquote className="text-[28px] font-bold leading-[1.3] tracking-[-0.015em]">
          &ldquo;The rarest kind of game — one that&apos;s fine if you only play it for ten minutes.&rdquo;
        </blockquote>
        <cite className="mt-4 block text-[14px] font-semibold not-italic text-fg-subtle">— Rock Paper Shotgun</cite>
      </section>

      {/* Buy CTA */}
      <div className="mx-auto max-w-[1100px] px-6 pb-16">
        <div className="relative overflow-hidden rounded-[24px] bg-ink py-14 px-14 text-center">
          <Image
            src="/brand/logo.png"
            alt=""
            width={180}
            height={180}
            className="absolute right-[-20px] bottom-[-20px] opacity-20 invert hue-rotate-180"
          />
          <h2 className="relative text-[44px] font-black tracking-[-0.025em] text-snow">Good boy?</h2>
          <p className="relative mt-3.5 text-[18px] text-mist">$14.99. One-time purchase. No DLC planned. Ever.</p>
          <Button href="#" variant="secondary" size="lg" className="relative mt-6 bg-snow">Buy on Steam →</Button>
        </div>
      </div>

      <Footer />
    </>
  );
}
