# Rentencheck Design Brief

_Direction: Trust-first financial · Light-mode only · German B2B advisor tool_

## Register

Not Silicon Valley fintech. Not generic shadcn-tailwind. The register is **a thoughtful financial paper** — Frankfurter Allgemeine meets Stripe. Advisors are reading projections to clients in meetings; the UI should feel like something printed by a private bank, not a SaaS dashboard.

**The one thing someone remembers**: the **serif display headings** (Fraunces). Almost nobody in B2B fintech uses serif for top-level numbers and titles.

---

## Typography

| Role                                | Family                       | Why                                                                                 |
| ----------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| Display (h1–h3, KPI numbers)        | **Fraunces** (variable, OFL) | Optical-size axis. Monumental at 48px, humane at 18px. German long-words graceful.  |
| Body (paragraphs, tables, forms)    | **Geist** (OFL)              | Geometric sans. Distinctive without being trendy. Reads umlauts cleanly. NOT Inter. |
| Mono (codes, IDs, tabular numerals) | **Geist Mono**               | Matches Geist. Use for `#R-2024-001`-style identifiers and tabular numbers.         |

**Scale**:

```
--text-display-xl: clamp(2.5rem, 4vw, 3.5rem)   /* 40–56px — page hero KPIs only */
--text-display-lg: clamp(2rem, 3vw, 2.5rem)     /* 32–40px — h1 */
--text-display-md: 1.75rem                       /* 28px   — h2 */
--text-display-sm: 1.375rem                      /* 22px   — h3 / large card titles */
--text-body-lg:    1.0625rem                     /* 17px   — body in result views */
--text-body:       0.9375rem                     /* 15px   — default body */
--text-body-sm:    0.8125rem                     /* 13px   — secondary text */
--text-mono:       0.875rem                      /* 14px   — IDs, codes */
```

**Banned**: Inter, Roboto, Arial. Emoji in UI text (replace step icons with lucide).

---

## Color (OKLCH for perceptual uniformity)

### Surfaces — warm, not stark

- `--background` warm ivory paper (was pure white)
- `--surface` pure white for cards on background
- `--surface-subtle` nested surfaces (hovers, table stripes)
- `--surface-muted` dividers, disabled fills

### Ink — slightly warm dark

- `--ink` primary text
- `--ink-secondary` secondary text
- `--ink-tertiary` captions, hints
- `--ink-disabled` disabled labels

### Primary — slate navy, not corporate blue

- `--primary` deep ink-blue (~hsl(220 60% 28%))
- `--primary-hover` darker
- `--primary-fg` ivory foreground

### Restrained accents

- `--positive` forest green for positive deltas only (~hsl(155 45% 35%))
- `--critical` terracotta, not stop-sign red (~hsl(2 60% 45%))
- `--warning` muted amber for "incomplete" states (~hsl(35 75% 45%))

### Chart series (financial-data)

1. navy — legal pension
2. muted teal — private pension
3. forest green — BAV/Riester
4. amber — desired gap
5. terracotta — critical gap

### Why warm + ink-navy + restrained accents

Stripe/Wise/N26 all lean on cool grays + bright primaries. **Warm ivory + ink navy** signals "private bank document", not "SaaS dashboard". Bigger differentiation lever than picking a different blue.

---

## Spacing — named, not numbered (kills `space-y-6` magic numbers)

```
--space-2xs  4px   tight icon+text gaps
--space-xs   8px   input padding
--space-sm   12px  table cell vertical
--space-md   16px  card padding sm
--space-lg   24px  card padding lg, section breaks
--space-xl   32px  between cards
--space-2xl  48px  page section breaks
--space-3xl  64px  top-level page padding
--space-4xl  96px  hero spacing on results page
```

**Density rule**: dashboard tables use `--space-sm`. Wizard steps use `--space-lg` between fields. Results page uses `--space-xl` between sections. Generous, never cramped, never floaty.

---

## Border radius — disciplined

```
--radius-sm    2px    badges, tags
--radius-md    6px    buttons, inputs
--radius-lg    10px   cards
--radius-xl    14px   hero cards (results)
--radius-full  9999px avatars, status dots
```

Serious financial UIs use 4–10px radius. shadcn defaults to 8–14px (too consumer-app).

---

## Shadows — paper-soft, multi-layer (NO material glow)

```
--shadow-xs    1-layer hairline       cards in dashboard
--shadow-sm    2-layer thin            results KPI cards
--shadow-md    2-layer mid             modals, popovers
--shadow-lg    2-layer high            critical dialogs
--shadow-focus 3px primary ring        a11y focus
```

**Rules**: No glows. No neumorphism. No glassmorphism. Paper, not glass.

---

## Motion — calm, not bouncy

```
--ease-out      cubic-bezier(0.16, 1, 0.3, 1)   default
--ease-in-out   cubic-bezier(0.65, 0, 0.35, 1)  dialogs, drawers
--ease-linear   linear                          progress bars only

--duration-instant  100ms  hover color shifts
--duration-fast     180ms  button press, focus ring
--duration-base     240ms  card hover, accordion
--duration-slow     360ms  dialog open, page transitions
--duration-slowest  600ms  hero number count-up
```

**Specific**:

- Wizard step transition: subtle horizontal slide + crossfade (--duration-slow), no zoom
- Step confirmation: green check scales 0.6 → 1.0 with --ease-out (--duration-base), no spring overshoot
- KPI number on results: counts up over --duration-slowest with `Intl.NumberFormat('de-DE')` — this is the moment of theater, one per page
- Button hover: ONLY color shift, NO transform (lifting buttons = toy)

---

## Iconography

- **Library**: `lucide-react` (already installed). 24×24 default, 16×16 in compact contexts.
- **Stroke**: 1.5 default, 1.25 in dense tables.
- **NO emoji in UI text.** Replace step `icon` field (`👤`, `🎯`, `📄`, `⭐`, `✅`) with lucide.
- **NO custom icon font.**

---

## Layout patterns

### Dashboard shell

- Sidebar 264px fixed, `--surface` bg, `--border-subtle` right border. No shadow.
- Top bar 64px height. Breadcrumb + user menu only. Logout moves into user dropdown.
- Content max-width 1280px, `--space-3xl` horizontal padding, `--space-2xl` vertical.
- Page title is **Fraunces display-md** (28px), not centered, not capitalized.

### Cards

- Border-only by default (`1px solid var(--border-subtle)`), no shadow.
- Elevated (results KPIs, dialogs): `--shadow-sm`, no border.
- Padding: `--space-lg` standard, `--space-xl` emphasized.

### Tables

- Zebra via `--surface-subtle`, NOT borders between rows.
- Header row: `--text-body-sm`, uppercase, letter-spacing 0.04em, `--ink-secondary`.
- Numeric columns: right-aligned, `Geist Mono` for the value.

### Forms (wizard steps)

- Field label: `--text-body-sm`, `--ink-secondary`, sentence case.
- Input: 40px height, `--radius-md`, `--border-default`, `--space-sm` horizontal padding.
- Focus: `--shadow-focus` ring + `--border-strong`.
- Error: `--critical` border + helper text in `--critical`.
- Optional tagged `(optional)` in `--ink-tertiary`, never `*` for required.

### Results page (the moneymaker)

Advisor opens this in front of the client.

- Full-width hero with central gap number in `--text-display-xl` Fraunces.
- Subtitle in body-lg with `Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'})`.
- Below: KPI grid (3 cards), then chart, then breakdown table.
- `--space-2xl` between sections.
- Print stylesheet: A4 portrait optimized (advisors print this).

---

## Explicitly NOT doing

- Dark mode
- Glassmorphism / frosted backgrounds
- Gradient buttons or hero gradients
- 3D shadows / neumorphism
- Emoji icons
- Inter font
- Bright primary blue (corporate default)
- Card hover-lift transforms
- Pulse-skeleton loaders (use thin top progress bar)
- Toasts with bright fill colors (muted bg + colored border)

---

## Implementation phases

**Phase 1 — tokens + primitives** (THIS BRANCH STARTS HERE)

1. `next/font/google` → add Fraunces
2. Rewrite `globals.css` with full token system above (Tailwind v4 `@theme` directive)
3. Refresh `src/components/ui/{button,input,card,badge,table,label,select,checkbox,form,dialog,sonner}.tsx` to use new tokens

**Phase 2 — shell + nav** 4. Restyle `DashboardShell` per layout patterns 5. Logout into user dropdown 6. Sidebar nav lucide icons + spacing

**Phase 3 — pages, by advisor visibility** 7. Login + register 8. Advisor dashboard (client list) 9. Client detail 10. Wizard steps 1–5 (biggest payoff) 11. Results page (hero KPI, print stylesheet) 12. Admin panel (lowest priority)

**Phase 4 — polish** 13. Wizard step transition animation 14. KPI count-up on results 15. Print stylesheet 16. Visual QA pass against this brief

---

## Branch

`design/trust-first-financial` (off `refactor/full`). Mergeable when Phase 4 lands and visual QA passes. Revertable as a single branch operation if direction is rejected.
