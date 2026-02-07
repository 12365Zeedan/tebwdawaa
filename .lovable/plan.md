

# Color Scheme Update

## Summary
Update the website's color palette across the CSS variables and component styles to match the new brand colors.

## Color Mapping

| Element | Current | New Hex | New HSL |
|---------|---------|---------|---------|
| Background | `0 0% 100%` (white) | `#DFF2F3` | `183 47% 91%` |
| Header/Footer bg | `240 100% 16%` (#000053) | `#01012D` | `240 96% 9%` |
| Main website color | `266 4% 20.8%` (dark gray) | `#1B98E0` | `200 75% 49%` |
| Button color | (uses primary) | `#000000` | `0 0% 0%` |
| Link text | `0 0% 100%` (white) | `#FFFFFF` | `0 0% 100%` (no change) |
| Link hover | `197 75% 48%` | `#1E9ED8` | `198 73% 48%` |
| News banner bg | N/A (no component yet) | `#E74C3C` | `6 78% 57%` |

## Changes

### 1. Update CSS Variables (`src/index.css`)

**Light mode `:root`:**
- `--background`: Change from `0 0% 100%` to `183 47% 91%` (#DFF2F3)
- `--primary`: Change from `266 4% 20.8%` to `200 75% 49%` (#1B98E0 - main brand color)
- `--primary-foreground`: Keep `0 0% 100%` (white text on blue buttons/elements)
- `--header-background`: Change from `240 100% 16%` to `240 96% 9%` (#01012D)
- `--link-hover`: Change from `197 75% 48%` to `198 73% 48%` (#1E9ED8)
- Update `--gradient-hero` to use the new background teal tones
- Update `--gradient-card` to blend with the new background

**Button styling:** Add a new CSS variable or override the button component so the default button uses `#000000` (black) instead of the primary blue.

### 2. Update Button Component (`src/components/ui/button.tsx`)

Change the default variant from `bg-primary` to `bg-black text-white hover:bg-black/90` so buttons render in solid black per the requirement, while keeping `--primary` as the main brand accent color (#1B98E0) for links, highlights, and active nav states.

### 3. Create Moving News Banner Component

Since the project doesn't currently have a "moving news" banner, create a new `NewsBanner.tsx` component in `src/components/layout/` with:
- A horizontally scrolling/marquee-style text ticker
- Background color `#E74C3C` (red) with white text
- Positioned at the top of the page (above the header)
- Content pulled from admin settings or a static placeholder
- Integrated into `MainLayout.tsx`

### 4. Update Gradients in `src/index.css`

- `--gradient-primary`: Update to use #1B98E0 shades: `linear-gradient(135deg, hsl(200, 75%, 49%) 0%, hsl(198, 73%, 48%) 100%)`
- `--gradient-hero`: Update to use #DFF2F3 tones: `linear-gradient(180deg, hsl(183, 47%, 91%) 0%, hsl(183, 47%, 95%) 100%)` (already close, minor tweak)
- `--gradient-card`: Update to blend white with teal background

### 5. Dark Mode Adjustments

Update the `.dark` section in `index.css` to maintain visual coherence with the new palette -- slightly lighter variants of the new primary blue and adjusted background.

---

## Technical Details

### Files to modify:
1. **`src/index.css`** -- CSS custom properties (both `:root` and `.dark`)
2. **`src/components/ui/button.tsx`** -- Default button variant to black
3. **`src/components/layout/MainLayout.tsx`** -- Include the new news banner

### File to create:
1. **`src/components/layout/NewsBanner.tsx`** -- Red scrolling news ticker

### No database changes required.

