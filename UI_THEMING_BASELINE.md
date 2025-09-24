# Zamio UI Theming Baseline

## Goals
- Catalogue the theming assets that already exist across the Zamio web and mobile properties.
- Highlight mismatches that currently break light/dark fidelity or diverge from the shared brand language.
- Establish a forward palette and implementation plan so every surface consumes the same design tokens.

## Current Inventory
| Surface | Primary theme assets | Notes |
| --- | --- | --- |
| Artist Web (`zamio_frontend`) | `tailwind.config.cjs` exposes Tailwind tokens that already reference CSS custom properties for the key brand colors; runtime `ThemeContext` swaps the CSS variables and toggles the `dark` class; global styles in `src/css/style.css` harden problematic utility classes for light vs. dark. | Good foundation: runtime tokens already exist, but a number of Tailwind colors (`green`, `purple`, etc.) remain static hexes, and components still hard-code `bg-white`/`text-white` which causes mismatched surfaces in dark mode. |
| Admin Web (`zamio_admin`) | Shares the same Tailwind configuration but most tokens are static hex values; `ThemeContext` mirrors the artist app yet several components bypass it. Global CSS lacks the light/dark guard rails that the artist app has. | Needs to align Tailwind tokens with CSS variables and port the guard-rail utilities to stop white cards from leaking into dark mode. |
| Station Web (`zamio_stations`) | Tailwind + ThemeContext mirror the artist app (static hex palette). | Same fixes as admin. |
| Publisher Web (`zamio_publisher`) | Tailwind + ThemeContext mirror the artist app (static hex palette). | Same fixes as admin. |
| Backend admin (Django) | Uses Django templates with bespoke SCSS (to be audited in later pass). | Will need Bootstrap/SCSS token mapping in a future sprint. |
| Mobile (`zamio_app`) | Flutter theme configured via `ThemeData` (currently bespoke colors). | Needs a generated `ColorScheme` fed from the same palette via Dart constants.

## Proposed Cross-Brand Palette
| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `--color-primary` | `#3D0C6B` | `#C77DFF` | Core brand accent for CTAs, focus, selection. |
| `--color-secondary` | `#0EA5E9` | `#38BDF8` | Supportive accent for highlights, charts, onboarding badges. |
| `--color-background` | `#F8FAFC` | `#050B16` | Page background. |
| `--color-surface` | `#FFFFFF` | `#101B2D` | Cards, modals, table rows. |
| `--color-text` | `#0F172A` | `#F8FAFC` | Primary text. |
| `--color-text-secondary` | `#475569` | `#94A3B8` | Body copy, helper text. |
| `--color-border` | `#CBD5E1` | `#1E293B` | Dividers, outlines. |
| `--color-success` | `#16A34A` | `#22C55E` | Positive states, payouts. |
| `--color-warning` | `#F59E0B` | `#FBBF24` | Pending attention items. |
| `--color-error` | `#DC2626` | `#F87171` | Validation, failed payouts. |
| `--color-info` | `#2563EB` | `#60A5FA` | Informational banners, neutral alerts. |

Supplementary neutrals (Tailwind style scale) can be derived programmatically (`slate-50` → `slate-900`) and mapped to semantic tokens (`surface-muted`, `surface-raised`, etc.) during implementation.

## Implementation Plan
1. **Centralise tokens**
   - Add a `design-tokens.ts` (or JSON) package in a new shared workspace (e.g., `packages/design-system`) that exports the palette above as semantic tokens.
   - Generate `theme.css` from those tokens so each React app can import identical CSS variables.
2. **Update Tailwind configs**
   - Replace static hex definitions across all React apps with `var(--color-*)` references, mirroring the approach already started in `zamio_frontend/tailwind.config.cjs` for core tokens.
   - Introduce semantic aliases (`primary/DEFAULT`, `primary/foreground`, etc.) to discourage raw utility usage.
3. **Harden global styles**
   - Port the guard-rail utilities from `zamio_frontend/src/css/style.css` into every app and extend them to cover inputs, tables, scroll areas, and third-party widgets that currently flash white in dark mode.
   - Standardise font sizing via the ThemeContext typography map so heading utilities render consistently.
4. **Component sweep**
   - Replace `bg-white`, `text-white`, `bg-gray-900`, etc., with semantic Tailwind classes (e.g., `bg-surface`, `text-primary-foreground`) or CSS variable-backed classes.
   - Audit modals/forms for focus rings and placeholder contrast, using tokens instead of raw colors.
5. **Cross-app theme sync**
   - Promote the existing `THEME_SYNC_EVENT` (see `src/contexts/ThemeContext.tsx`) to use the `BroadcastChannel` API so separate browser tabs or micro-frontends remain in sync without manual toggles.
   - Persist the resolved palette in `localStorage` and, on load, hydrate CSS variables before React mounts to avoid light-mode flashes.
6. **Flutter alignment**
   - Create a Dart `zamio_theme.dart` exporting `ThemeData` and `ColorScheme` derived from the same palette.
   - Map typography tokens to `TextTheme` styles; ensure `brightness` toggles the background/surface pairs.
7. **Validation**
   - Add visual regression tests (Chromatic/Playwright) capturing light and dark snapshots for critical flows (dashboards, onboarding, payout approvals).
   - Expand manual QA checklists in `.SuperTest/` to cover theme toggling, ensuring zero white panels in dark mode and correct text contrast everywhere.

## Immediate Next Steps
- Stand up the shared token package and wire it into `zamio_frontend` first as the pilot.
- Backfill Tailwind token references in `zamio_admin`, `zamio_publisher`, and `zamio_stations`.
- Draft Flutter token mapping to unblock mobile alignment.
- Schedule a design review with stakeholders to approve the palette before mass refactors.
