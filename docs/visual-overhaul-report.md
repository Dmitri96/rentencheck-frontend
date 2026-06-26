# Visual Overhaul Report — Phase 3 + Phase 4

Direction: trust-first financial, warm-ivory paper register (`docs/design-brief.md`).
Branch: `design/trust-first-financial`. Builds on `ee5b1f3` (Phase 1+2).

## Surfaces touched

- **Auth (3)** — `(auth)/layout.tsx`, `auth-layout.tsx`, `login-form.tsx`,
  `register-form.tsx`. Card centered 440px on ivory, serif "R" monogram,
  no gradients, `(optional)` tagging, removed all `required *`.
- **Clients (6)** — `client-dashboard.tsx`, `create-client-form.tsx`,
  `client-detail-view.tsx`, `client-info-section.tsx`, `client-contact-card.tsx`,
  `client-stats-card.tsx`, `rentenchecks-card.tsx`, `loading-states.tsx`.
  Status helpers in `lib/utils/client-utils.ts` switched from raw
  class strings to Badge variants (`getClientStatusVariant`,
  `getRentencheckStatusVariant`).
- **Wizard (13)** — `rentenblick-form.tsx` (full rewrite of stepper +
  navigation), 5 form-step files, 7 form-step section files. Emoji icons
  replaced with lucide (`User2`, `Target`, `FileText`, `Star`,
  `CheckCircle2`). Step discs token-based: confirmed = filled navy +
  `Check`, current = outlined ring, future = `bg-muted` + step icon.
  Progress connector flips from `border-subtle` to `bg-primary` when
  both endpoints confirmed.
- **Rentencheck shell (1)** — page wrapper with header `#R-{id}` mono ID
  - status badge + Fraunces progress KPI.
- **Pension results (4)** — `pension-results-overview.tsx` rebuilt as
  moneymaker; `pension-chart.tsx` KPI tiles + parameter cells; new
  `pension-results-table.tsx` with `Th`/`Td` primitives; `disability-income-diagram.tsx`
  chart colors aligned to brief series (navy → amber → terracotta →
  forest).
- **Admin (4)** — `admin-dashboard.tsx`, `advisor-management.tsx`,
  `create-advisor-form.tsx`, `pension-settings-panel.tsx`. Same StatTile
  pattern with Fraunces KPI numbers + label-uppercase eyebrows.
- **Marketing + analysis + chrome (5)** — `app/page.tsx` (landing),
  analysis page, `role-guard.tsx`, `error-boundary.tsx`,
  `(protected-pages)/layout.tsx` + `dashboard-shell.tsx` get `no-print`
  on sidebar/topbar.

Total: **~37 files restyled**, plus Fraunces font config + globals.css
print rule.

## Hardcoded color sweeps

Across 12 form-step + 7 section + ~18 other restyled files, perl-substituted:
~140 hits of `text-gray-{400,500,600,700,800,900}`,
~40 of `bg-gray-{50,100,200,900}`,
~25 of `border-gray-{100,200,300}`,
~30 of `text-blue-/bg-blue-/from-blue-/to-indigo-`,
~20 of `text-red-/bg-red-`,
~20 of `text-green-/bg-green-`,
~15 of `text-yellow-/text-orange-`,
~15 gradient stanzas (`bg-gradient-to-r from-X to-Y`),
~12 emoji UI tokens (`👤🎯📄⭐✅📋👥✨⏸️❌⚠️`).

Final scan: 0 hardcoded color classes left in restyled tree
(grep `bg-blue-|text-blue-|bg-gray-|text-gray-|from-blue-|from-indigo-|to-indigo-|text-red-6|...`
returns empty). 0 emoji left in UI text.

## Phase 4 motion implementations

Installed `framer-motion@12.42.0`. Three patterns landed:

1. **Wizard step transition** — `AnimatePresence mode="wait"` around step
   render with `initial={{ opacity:0, x:16 }} → animate → exit={{ opacity:0, x:-16 }}`,
   360ms with `[0.16,1,0.3,1]`. No scale, no overshoot.
2. **Confirmed-step `Check` scale-in** — `motion.span` wrapping lucide
   `Check` in the stepper disc: `scale:0.6→1, opacity:0→1` over 240ms.
3. **Hero KPI count-up** — `framer-motion/animate()` controls a state cell
   in `pension-results-overview.tsx`, animating 0 → final gap over 600ms.
   Formatted with `Intl.NumberFormat('de-DE', {style:'currency',currency:'EUR',maximumFractionDigits:0})`.

Print stylesheet: `.no-print { display: none !important }` block added
inside the existing `@media print` in `globals.css`. Sidebar wrapper and
DashboardShell `<header>` carry the class. Results-page action card
also carries it.

## Verification

- `bun run typecheck` — 0 errors
- `bun lint` — 0 errors (10 pre-existing warnings, all unchanged)
- `bun vitest run` — 63 pass, 13 skipped (no regressions)
- `bun run build` — succeeds, all 13 routes generate

## Side fix

`src/app/layout.tsx` Fraunces font config had `weight:[...]` alongside
`axes:[opsz,SOFT]`. `next/font` Next 15 rejects this combination at
build time. Dropped the `weight` array so Fraunces stays a true variable
font, which is what the `font-variation-settings: "opsz" N` rules in
`globals.css` need anyway. Pre-existing bug, surfaced by `bun run build`.

## Open questions

- The marketing `app/page.tsx` was restyled in-place but the structure
  (gradient hero on a public landing page) is not part of the trust-first
  advisor surface area — kept its layout but moved to token colors.
  Confirm with stakeholder whether this should follow the same paper
  register or stay marketing-flavored.
- The disability-income-diagram chart's `borderColor` arrays are
  duplicated across both datasets; if a designer adds more series later,
  consolidate into a `seriesColors` constant.
- The analysis page (`[rentencheckId]/analysis/page.tsx`) was swept by
  perl but not given the full hand-restyle treatment — it currently still
  uses some `flex-col` gradient backgrounds via the substituted
  `bg-background`. Worth a deeper pass if it's a high-traffic surface.
