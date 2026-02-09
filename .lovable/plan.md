

# Auto-Fix Process for Site Health Admin Page

## Overview
Add a comprehensive auto-fix system to the Site Health page that allows fixing all detected issues with one click, with a visual progress tracker and expanded fix coverage beyond the current SEO-only fixes.

## What Changes

### 1. Expand Auto-Fixable Checks
Currently only 5 SEO checks support auto-fix. We will expand this to cover more categories:

| Check ID | Category | Fix Action |
|---|---|---|
| `seo-meta-tags` | SEO | Already implemented |
| `seo-sitemap` | SEO | Already implemented |
| `seo-robots` | SEO | Already implemented |
| `seo-structured-data` | SEO | Already implemented |
| `seo-canonical` | SEO | Already implemented |
| `perf-image-optimization` | Performance | Compress product images via storage bucket optimization settings |
| `perf-caching` | Performance | Set caching config in app_settings for static assets |
| `sec-headers` | Security | Store recommended security headers config in app_settings |
| `a11y-alt-text` | Accessibility | Auto-generate alt text for product images using stored product names |
| `a11y-heading-hierarchy` | Accessibility | Persist heading audit flag to enable hierarchy enforcement |
| `a11y-aria-labels` | Accessibility | Enable ARIA enforcement setting in app_settings |
| `gen-broken-links` | General | Scan and flag broken internal links, remove dead references |

### 2. "Fix All Issues" Button and Progress UI
Add a prominent "Fix All Issues" button at the top of the health checks card that:
- Identifies all failed/warning checks that are auto-fixable
- Runs each fix sequentially with a progress bar
- Shows a summary dialog when complete (X fixed, Y skipped, Z failed)
- Re-runs a scan after all fixes to verify improvements

### 3. Auto-Fix Progress Dialog
A modal that appears during the batch fix process showing:
- Current fix being applied (with check name)
- Progress bar (e.g., "Fixing 3 of 7 issues...")
- Real-time status per check (pending, fixing, fixed, failed)
- Final summary with before/after score comparison

### 4. Fix History Tracking
Each applied fix gets logged so users can see what was changed and when.

---

## Technical Details

### Files to Create
- **`src/components/admin/sitehealth/AutoFixDialog.tsx`** -- Modal dialog showing fix progress with a list of fixable issues, real-time status icons, progress bar, and before/after score summary.
- **`src/components/admin/sitehealth/AutoFixSummary.tsx`** -- Summary card showing fix results (fixed count, failed count, score improvement).

### Files to Modify

**`src/data/healthChecks.ts`**
- Set `autoFixable: true` for the additional checks listed above
- Add `fixDescription` strings (EN) for each newly fixable check

**`src/hooks/useSeoFixes.ts`** (rename concept to `useHealthFixes.ts`)
- Create a new hook `useHealthFixes` that includes:
  - All existing SEO fixes (unchanged)
  - New performance fixes: `fixImageOptimization`, `fixCaching`
  - New security fixes: `fixSecurityHeaders`
  - New accessibility fixes: `fixAltText`, `fixHeadingHierarchy`, `fixAriaLabels`
  - New general fixes: `fixBrokenLinks`
- Each fix follows the same pattern: analyze the issue, apply a real fix (DOM/database), persist settings, return success/failure

**`src/hooks/useSiteHealth.ts`**
- Add `fixAllIssues` function that:
  1. Collects all failed/warning results where the check is auto-fixable
  2. Runs fixes sequentially, tracking progress
  3. Returns a summary object `{ fixed: string[], failed: string[], skipped: string[] }`
- Add `isFixingAll` and `fixProgress` state variables
- Update `applyFix` to use the expanded fix map

**`src/pages/admin/AdminSiteHealth.tsx`**
- Add "Fix All Issues" button next to "Run Full Scan" in the header
- Show count of fixable issues on the button (e.g., "Fix All (5 issues)")
- Wire up AutoFixDialog to show during batch fix process
- Add AutoFixSummary card that appears after batch fix completes
- Add "Re-scan after fix" automatic behavior

**`src/components/admin/sitehealth/HealthCheckItem.tsx`**
- No structural changes needed (already supports `onApplyFix` and `isFixing`)

### New Fix Implementations (Details)

**Performance - Image Optimization Fix:**
- Query products with images from the database
- Store an `image_optimization_enabled` setting in app_settings
- Show toast with count of images flagged for optimization

**Performance - Caching Fix:**
- Persist recommended cache-control settings in app_settings
- These can be referenced by deployment configuration

**Security - Headers Fix:**
- Store recommended security headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options) in app_settings
- Generate a downloadable `_headers` file for deployment

**Accessibility - Alt Text Fix:**
- Query all products with images but missing/empty alt text
- Auto-populate alt text from product name + category
- Update products table with generated alt text

**Accessibility - Heading Hierarchy Fix:**
- Persist a `heading_hierarchy_enforcement` setting
- The app's layout components can reference this to enforce single H1

**Accessibility - ARIA Labels Fix:**
- Persist an `aria_labels_enforcement` setting
- Flag the setting as enabled for component-level enforcement

### Auto-Fix Dialog Flow

```text
+------------------------------------------+
|          Auto-Fix Progress                |
|                                           |
|  Fixing 3 of 7 issues...                 |
|  [=========>          ] 43%               |
|                                           |
|  [check] Meta Tags         -- Fixed       |
|  [check] Sitemap.xml       -- Fixed       |
|  [spin]  Canonical URLs    -- Fixing...   |
|  [dot]   Security Headers  -- Pending     |
|  [dot]   Alt Text          -- Pending     |
|  [dot]   Heading Hierarchy -- Pending     |
|  [dot]   ARIA Labels       -- Pending     |
|                                           |
|  Score: 58 -> ...                         |
+------------------------------------------+
```

After completion:

```text
+------------------------------------------+
|       Auto-Fix Complete!                  |
|                                           |
|  Score: 58 -> 87  (+29 improvement)       |
|                                           |
|  5 Fixed | 1 Failed | 1 Skipped          |
|                                           |
|  [Re-scan Now]  [Close]                   |
+------------------------------------------+
```

### No Database Changes Required
All fix results are persisted via the existing `app_settings` table and `site_health_scans` table. No new tables or migrations needed.

