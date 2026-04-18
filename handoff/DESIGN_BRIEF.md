# Wagglebum Website — Design Brief

**For:** Claude Code, working in `wagglebum-web` (Next.js 14 App Router + Tailwind CSS)
**Source:** Wagglebum Design System (this package)

---

## 1. What Wagglebum is

Wagglebum is a tiny indie studio that **makes games AND builds the tools to make them**. The site needs to market both:

- **Games** — original indie titles (Hello Good Dog, Shuttle Run, Sweepers, etc.)
- **Tools** — plugins for Unity/Unreal (WagSave, Crowd AI, SaveKit) and dev services (porting, consulting)

The brand is named after Boston Terriers — no tail, so their whole **bum waggles**. Fun but professional. Monochromatic (black/white/grays) with one subtle blush accent. Chunky rounded shapes, heavy type, light wit.

## 2. Voice & tone — marketing-heavy

This is a **marketing site** — not a portfolio. Every page should drive an action:
- Games pages → Steam/itch.io/download
- Tool pages → Install / Buy / Get started
- Service pages → Contact / Book a call

Copy is plain-spoken, talks to one person, uses sentence case. See `../README.md` for full voice guidance.

## 3. Visual system (summary)

| Token | Value |
|---|---|
| Primary bg | `#faf7f2` (paper) |
| Raised bg | `#ffffff` (snow) |
| Sunken bg | `#f2efe9` (bone) |
| Ink | `#141414` |
| Body text | `#5c5c5c` (graphite) |
| Subtle text | `#8a8a8a` (stone) |
| Accent (sparingly) | `#b07a6d` (blush) |
| Font | Rubik (400–900), JetBrains Mono for code |
| Radii | 14–20px cards, 999px pills |
| Signature shadow | `0 4px 0 #141414` — the **"pop"** shadow on CTAs and featured cards |

Full tokens in `tailwind-tokens.js`. Full system in `../colors_and_type.css` and `../README.md`.

## 4. Pages to build

1. **`/`** — Home (marketing hero, featured games + tools)
2. **`/games`** — Games listing
3. **`/games/[slug]`** — Single game page (Hello Good Dog as the worked example)
4. **`/plugins`** — Plugins & tools listing
5. **`/wagsave`** — WagSave product landing (redesign)
6. **`/wagsave/support`** — WagSave support / issues page (redesign, keep the GitHub-issues fetch logic)

See `reference/` for HTML mocks of each page. Match layout, spacing, and component structure.

## 5. Non-negotiables

- **Monochromatic.** No gradients as primary backgrounds. No rainbow. One blush accent, used sparingly.
- **Rounded corners always.** No sharp corners anywhere.
- **The "pop" shadow** (`0 4px 0 ink`) is a signature — use it on primary CTAs and featured cards.
- **Sentence case** for buttons, headings, and navigation.
- **Sticky floating pill nav** — blurred paper background, max-width 1100, `shadow-md`.
- **Nunito/Inter are OUT** — use Rubik.
- **The dog mascot** (`/public/logo.png` — already in the repo) is the hero of the site. Use large in hero sections.

## 6. What NOT to do

- Don't add emoji to UI chrome (headings, buttons, nav). Informal copy is fine.
- Don't use dark mode as the default — the site is warm paper by default. (Dark mode is a later project.)
- Don't invent new colors beyond the token file.
- Don't use filled-icon sets; stay line-only (Lucide React is the pick — `lucide-react` on npm).
- Don't over-animate. Hover transitions at 150–200ms, that's it.
