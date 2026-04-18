# Claude Code — one-paste prompt

Copy everything between the `===` lines into a new Claude Code session, **after** you've put the handoff package somewhere it can read (e.g. `./wagglebum-handoff/` next to your new project folder).

---

===

I'm building the **Wagglebum** marketing website. You are implementing it.

**Handoff package:** `./wagglebum-handoff/` (adjust path if different)

Read, in this order, before writing any code:
1. `wagglebum-handoff/HANDOFF.md` — setup + page inventory
2. `wagglebum-handoff/DESIGN_BRIEF.md` — voice, tone, visual system
3. `wagglebum-handoff/reference/index.html` — open in a browser, study it

## What I want

A production Next.js 14 + Tailwind + TypeScript site that matches the reference HTML mocks pixel-for-pixel.

## Non-negotiable design rules

- **Paper background** (`bg-paper`, #faf7f2) is the default — never pure white.
- **Everything is rounded.** No sharp corners. Pills for nav/buttons, 20px for cards, generous.
- **Primary CTAs use the chunky "pop" shadow** — `shadow-pop` (solid 4px offset, no blur).
- **Rubik 800/900** for all headings with tight `-0.02em` tracking.
- **Sentence case everywhere.** Never Title Case on buttons/headings. ALL CAPS only for the WAGGLEBUM wordmark and 11px eyebrow labels.
- **Monochrome + one blush accent.** No gradients. No emoji in UI chrome.
- **The dog mark appears at least once per page** (hero + footer usually).
- Voice: friendly senior dev with a dog on their lap. Plain English, short sentences, gentle wit.

## Process

1. Scaffold per `HANDOFF.md` step-by-step.
2. Build pages **one at a time** in this order: `/`, `/games`, `/games/hello-good-dog`, `/plugins`, `/plugins/wagsave`, `/plugins/wagsave/support`.
3. For each page: open its reference mock, build, then compare side-by-side. Screenshot if helpful.
4. Reach for the provided `components.tsx` first (NavBar, Hero, Card, ProductCard, GameCard, Footer, Button, Tag, Eyebrow). Only write custom Tailwind when the components don't fit.
5. **Flag ambiguity** — don't invent copy or sections. Add `{/* QUESTION: ... */}` comments and ask me.

## Vibe check (run before shipping any page)

- [ ] Paper background, not white
- [ ] All corners rounded
- [ ] Primary CTAs have `shadow-pop`
- [ ] Headings use Rubik 800/900, `-0.02em` tracking
- [ ] Dog mark visible at least once
- [ ] Sentence case on all headings + buttons
- [ ] No gradients, no emoji in UI

Start with step 1 of `HANDOFF.md`. Ask before skipping anything.

===

---

## Tips for working with Claude Code

- **Review each page before moving on.** "Show me the `/games` page" → screenshot or dev server → compare to `reference/games.html`.
- **If it drifts:** "Open `reference/<page>.html` again and bring yours closer — especially the [hero / card spacing / etc]."
- **Copy changes:** edit the reference HTML yourself first, then say "re-sync the home page copy from the updated reference."
- **New pages:** add a new `reference/*.html` mock, then ask Claude Code to build the route against it.
