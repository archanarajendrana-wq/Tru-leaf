# Truleaf Site — Build Rules

This is a static HTML/CSS/JS site (no framework, no build step). These 4 rules
apply to every section, past and future. When adding or editing a section,
check it against all four before considering the work done.

## 1. No raw values — design tokens only

Every color, spacing, radius, and typography value must trace back to a CSS
custom property in `:root` (defined once in `tokens.css`, mirrored inline in
`index.html`'s embedded `<style>`).

- If a value you need doesn't match an existing token, **add a new semantic
  token** to `:root` (both files) rather than hardcoding a one-off number/hex.
  Name it for its role, not its value (`--bg-olive-deep`, not `--olive-dark-1`).
- If a raw hex/px value shows up in a Figma export, check `get_variable_defs`
  first. If Figma has no bound variable either, map the raw value to the
  *closest existing token* — don't invent a fresh color that isn't in the
  palette scale (indigo / pacific-blue / olive / neutral, steps 1–11).
- Typography: prefer an existing `.t-*` utility class over a bespoke
  `font-size`. Only write a literal size when no utility fits, and scope it
  to that one component (don't duplicate an existing utility's number under a
  different selector).

**Accepted exceptions** (things the token system intentionally doesn't model):
breakpoint values (`920px` / `680px` / `520px`), `aspect-ratio`, flex-basis
percentages, one-off icon pixel sizes (e.g. `width:56px` on an svg), and
translucent overlay `rgba()` values used for scrims/glass effects (the palette
has no alpha tiers).

## 2. Every element is a component

No inline styles, and no bespoke one-off class that reimplements something a
component already does.

- Before writing new CSS for a button, card, badge, etc., check whether
  `.btn` (+ a modifier like `.btn-brand` / `.btn-glass` / `.btn-primary-img`),
  or an existing card/step pattern already covers it. Extend with a modifier
  class instead of writing a parallel implementation.
- If nothing fits, add a properly named, reusable block (`.thing`,
  `.thing-part`, `.thing--modifier`) so the *next* section can reuse it too —
  don't name it after the page section that happens to use it first.

## 3. Fold margins are uniform across every section

Every full-bleed `<section>` uses the same rhythm:

- **Horizontal:** `var(--page-margin)` — always, no exceptions.
- **Vertical:** `var(--space-section)` top **and** bottom on desktop,
  `var(--space-section-sm)` top **and** bottom at `≤920px`. Symmetric only —
  no asymmetric top/bottom padding.
- **Content container:** `max-width: var(--container-max)` (1240px) for every
  section's inner wrapper, so left/right edges line up down the whole page.
  The one allowed exception is a deliberately narrower centered-prose block
  (`var(--container-narrow)`, 1040px, used by `.mission-inner`) — mark it with
  a comment explaining why when you use it, so it isn't "fixed" back by mistake.

## 4. All sections must be responsive

Every section needs explicit, tested behavior at both shared breakpoints —
`≤920px` and `≤520px` — reusing those two breakpoints rather than inventing a
new one per section unless a layout genuinely needs an intermediate step
(document why, inline, if you add one — e.g. `.cap-cards` needs `≤680px` for
its 2×2→1-col card collapse).

Before calling a section done: resize to desktop / ~800px / ~390px and check
text doesn't overflow its container, images keep a sane aspect-ratio, and
nothing overlaps.

---

### Token additions made while conforming existing sections to these rules

`--container-max`, `--container-narrow`, `--space-head`, `--space-head-sm`,
`--bg-olive-deep`, `--text-accent-warm` — added to `:root` in both
`tokens.css` and `index.html` when auditing found values with no existing
token (see git history / conversation for the specific fixes: sourcing's
asymmetric padding, capabilities/howwe container-width mismatch, the
`howwe-cta` one-off button replaced with `.btn.btn-brand`, and sitewide raw
`#fff` → `var(--white)`).
