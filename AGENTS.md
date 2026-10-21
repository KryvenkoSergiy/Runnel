# Runnel — instructions for coding agents

Demo site for a fictional freelancer-money product, built in four interchangeable design looks (A Paper, B Night, C Swiss, D Soft) with a switcher at the top. `README.md` explains the idea for humans; this file is how to work on the code.

## Commands
- `npx npm@11 install` — npm 10 crashes on Vitest's peer set (`Cannot read properties of null (reading 'edgesOut')`).
- `npm run dev` — Vite dev server on http://localhost:5173. `?look=night` opens a look directly; keys `1`–`4` switch looks, `?` toggles "How it's built".
- `npm run lint` — oxlint; warnings fail.
- `npm test` — Vitest (money maths, store, registry, RollingNumber).
- `npm run build` — type-check, then production build into `dist/`.
- `npm run preview` — serve `dist/` on http://localhost:4173.
- `npm run og` — regenerate `public/og.png` and `docs/looks/*.jpg` from a running `npm run preview` (needs local Chrome; `CHROME=` overrides the path, an argument overrides the URL).

A change is done when `npm run lint && npm test && npm run build` pass and the result is checked in a browser (see "Verify in a browser").

## Structure
```
src/
  main.tsx    renders after the first look's chunk and fonts load (capped at 800 ms) — keeps CLS at 0
  shell/      App (look switch: preload, circle View Transition, URL, keys, keeps the section), Nav, LookSwitcher, BuiltNotes
  themes/     types.ts (theme contract), registry.ts (looks, preloadLook = chunk + CSS + fonts)
              <id>/index.tsx (fonts, exports Hero, Month, notes), Hero.tsx, Month.tsx, theme.css
  styles/     base.css — structure and motion variables only, no colours or fonts
  domain/     money.ts — integer-cent maths, demo rates, split, simulateMonth (pure, tested)
  state/      store.tsx — one useReducer store above the look loader
  content.ts  shared copy, demo data and shared "How it's built" notes (BUILT)
  ui/         PaymentQueue, useAutoplay, MonthScene, HomeCurrency, RollingNumber, Segmented, Flows, Mark,
              useScrollProgress, motion.ts (wait with abort signal, replay, useReducedMotion)
  sections/   shared Rules, Currencies, Pricing, Faq, Waitlist, Footer; class names are the styling API
scripts/og.mjs  social preview and README screenshots
.github/workflows/deploy.yml  lint, test, build, deploy to GitHub Pages on every push to main
```

## Theme rules
- One shared store for all looks; switching never resets data or loses the reader's section.
- Each look is a lazy chunk. Its CSS lives in one `:root[data-look="<id>"] { … }` block with native nesting, because loaded CSS stays in the document after a switch. Keyframes are global: prefix them with the look id (`paper-rise`).
- A look exports `Hero`, `Month` and `notes`; every other section is shared markup it restyles. Fonts are imported inside the look's chunk, never globally, and listed in `registry.ts` for preloading.
- A look defines `--taxes`, `--savings`, `--spendable`; shared CSS uses only those and `currentColor`.
- Signature flow: the hero passes `route(p, signal)` to `useAutoplay(rootRef, route)`, which calls it whenever the hero is idle and on screen. Inside, keep the landed payment in local state, pass `signal` to every `wait()`, and dispatch `route(key)` when balances should roll. A look switch aborts the signal, so an unfinished payment stays queued for the next look.
- Render the queue with `<PaymentQueue landing={landingKey} />`: one row of fixed height, the next payment as a full chip, the rest as `waiting` avatars, paid ones `gone` as grey placeholders. All states animate on the same element and the row's height never changes, so the hero never reflows (Swiss shows paid rows as grey bars).
- Values a slider drives use `<RollingNumber instant>`; rolling digits lag behind the hand.
- Shapes that can coincide (chart lines, markers) must stay distinguishable when values are equal, e.g. Night's chart offsets each envelope into its own lane, so equal balances draw as parallel lines.
- `replay(el, cls)` restarts a one-shot animation; use it only on elements whose `className` React never changes.
- A Month is `<MonthScene view={(day, month) => …} />`: the scene owns the tall section, the sticky frame, scroll progress and the reduced-motion still frames; the look only draws one day.
- The hero's `<section className="hero">` has no `id`; every other section's `id` is its nav anchor and its "How it's built" key.
- Moves inside a section use FLIP with WAAPI (transform, clip-path), not View Transitions: a transition pauses rendering of its scope and swallows clicks, and morphing between different shapes stretches the snapshot. View Transitions are only for the look switch.
- Grid columns that hold huge type use `minmax(0, 1fr)`; plain `1fr` overflows on phones.

## Quality bars
- Text contrast ≥ 4.5:1 (≥ 3:1 for large type). A bright accent that misses it gets a darker text twin (Swiss `--red` / `--red-ink`).
- Touch targets ≥ 44px on `pointer: coarse`; no horizontal scroll at 375px.
- Every motion effect has a reduced-motion version. The hero plays itself on an endless loop (`useAutoplay`) and stays still under reduced motion.
- Budgets: start JS ≤ 85 kB gzip, each look ≤ 15 kB gzip JS, fonts per look ≤ 120 kB, Lighthouse desktop ≥ 95, mobile ≥ 85, Accessibility 100, CLS < 0.05, INP < 200 ms. Current numbers are in `README.md`; update them when they change.

## Verify in a browser
Check each touched look at desktop width and at 375px, and with reduced motion if motion changed. Known quirks of automated browsers:
- Animations can stall in a background or embedded pane. Finish them before reading the DOM:
  `document.getAnimations().forEach(a => { try { if (a.effect?.getTiming().iterations !== Infinity && (!a.timeline || a.timeline instanceof DocumentTimeline)) a.finish() } catch { a.cancel() } })`
- `html { scroll-behavior: smooth }` is on: scroll with `scrollTo({ top, behavior: 'instant' })`, or screenshots catch the page mid-scroll.
- Screenshots sometimes show the previous frame; confirm state with DOM queries.
- `chrome --screenshot` with virtual time freezes intro animations halfway; drive Chrome over CDP in real time (as `scripts/og.mjs` does).

## Security
- No secrets belong in this repo: there is no backend, no API, no analytics and no `.env`. The waitlist form sends nothing.
- Build HTML strings only from escaped values (`RollingNumber` escapes non-digit characters). Prefer JSX or `textContent`.
- New dependencies: exact version, published at least 14 days ago (`npm view <pkg> time --json`), and `npm audit` clean.
- Inline `style` attributes are used throughout, so a CSP needs `style-src 'self' 'unsafe-inline'`.

## Conventions
- Code, comments, commit messages and docs in English; comments explain why, not what.
- No Tailwind, no animation libraries: View Transitions, scroll-driven CSS, WAAPI, SVG.
- Money is integer minor units (cents); never float arithmetic.
- Commit messages: imperative subject, body explains why. No `Co-Authored-By` or other attribution trailers.
- Don't commit or push unless asked. Every push to `main` deploys to GitHub Pages (https://kryvenkosergiy.github.io/Runnel/).
- `vite.config.ts` uses `base: './'`: keep asset and public URLs relative (`./favicon.svg`), never root-absolute.
