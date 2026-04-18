# Wagglebum Website — Claude Code Handoff

This package is a design handoff for **Claude Code** to implement the Wagglebum marketing website. Everything you need is here; no external design system fetching required.

## 📦 What's in this package

| File / folder | Purpose |
|---|---|
| `DESIGN_BRIEF.md` | Voice, tone, visual system, page inventory — **read this first** |
| `HANDOFF.md` | This file — setup instructions |
| `CLAUDE_CODE_PROMPT.md` | **Copy-paste prompt** to hand to Claude Code |
| `globals.css` | Font imports + CSS custom properties (drop into `app/globals.css`) |
| `tailwind-tokens.js` | Tailwind theme extension — colors, fonts, shadows, radii |
| `components.tsx` | React/TSX component library — Nav, Hero, Card, Footer, etc. |
| `reference/` | Pixel-fidelity HTML mocks of every page. **These are the target.** |
| `reference/logo.png` | Brand mark — copy to `public/brand/logo.png` |

## 🎯 Target stack

- **Next.js 14** (App Router)
- **Tailwind CSS** 3.4+
- **TypeScript**
- Hosted on Vercel

If the founder wants a different stack, adapt — the design intent in `DESIGN_BRIEF.md` and the `reference/` mocks are the source of truth, not the specific TSX.

---

## 🚀 Step-by-step

### 1. Scaffold
```bash
npx create-next-app@14 wagglebum-web --typescript --tailwind --app --no-src-dir
cd wagglebum-web
```

### 2. Install fonts + merge tokens

Copy `globals.css` → `app/globals.css` (replace the stock file).

Open `tailwind.config.ts` and merge the contents of `tailwind-tokens.js` into `theme.extend`:

```ts
import type { Config } from 'tailwindcss';
import tokens from './design/tailwind-tokens';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...tokens.theme.extend,
    },
  },
  plugins: [],
};
export default config;
```

### 3. Drop in components

Copy `components.tsx` → `components/wagglebum.tsx`. All components are exported by name:
- `NavBar`, `Footer`
- `Hero`, `Button`, `Tag`, `Eyebrow`
- `Card`, `ProductCard`, `GameCard`

### 4. Copy brand assets

```bash
mkdir -p public/brand
cp reference/logo.png public/brand/logo.png
```

### 5. Build pages

**Page inventory** (see `reference/` for mocks):

| Route | Reference mock | Notes |
|---|---|---|
| `/` | `reference/index.html` | Home — hero + games strip + plugins strip + studio pitch |
| `/games` | `reference/games.html` | Games listing grid |
| `/games/hello-good-dog` | `reference/game-hello-good-dog.html` | Single-game marketing page |
| `/plugins` | `reference/plugins.html` | Plugins listing |
| `/plugins/wagsave` | `reference/wagsave.html` | Single-plugin product page |
| `/plugins/wagsave/support` | `reference/wagsave-support.html` | Support center with sidebar + article layout |

For each route:
1. Open the reference HTML in a browser. Study it. It's the target.
2. Build the page as a Server Component (`app/<route>/page.tsx`).
3. Compose using the provided components. Reach for Tailwind classes only when the components don't cover it.
4. Screenshot your build vs. the reference. They should be near-identical.

### 6. Verify the vibe

Before shipping, check that:

- [ ] Paper background (`bg-paper`) is the default, not pure white
- [ ] All corners are rounded (nothing sharp)
- [ ] Primary CTAs have the chunky `shadow-pop` offset shadow
- [ ] Headings use Rubik 800/900 with tight `-0.02em` tracking
- [ ] The dog mark appears at least once per page (usually hero + footer)
- [ ] Copy is sentence case — never Title Case on buttons or headings
- [ ] No gradients, no emoji in UI chrome

---

## 🎨 Design system deep-dive

For anything not covered here, read in this order:
1. `DESIGN_BRIEF.md` — voice, tone, content patterns
2. `reference/_shared.css` — all the class-based equivalents of the Tailwind tokens
3. `reference/*.html` — real examples of every pattern

---

## ❓ Questions

If something is genuinely ambiguous (copy, a missing page, an animation), **flag it** — don't invent content. Add a `{/* QUESTION: ... */}` comment and surface it to the founder.

Ship it on Tuesday. 🦴
