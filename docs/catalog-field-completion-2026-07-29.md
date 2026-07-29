# TECPOINT — Completion of catalog fields

Date: 2026-07-29  
Source of current inventory: `ITEMS W31 ELIEZER.xlsx`

## Result

The 680 documents currently stored in the storefront collection were reviewed.
Only values supported by the inventory, the existing product record, the
validated catalog, or an approved local brand asset were completed.

| Field | Before | After |
| --- | ---: | ---: |
| Product name | 1 empty | 0 empty |
| Subcategory | 680 empty | 0 empty |
| Brand logo | 676 empty | 0 empty |
| Brand banner | 678 empty | 0 empty |
| Tags | 632 empty | 0 empty |
| Basic specifications | 327 empty | 0 empty |
| Retail price | 41 missing or zero | 9 missing or zero |
| UPC | 525 empty | 116 empty |
| Normalized color | 668 empty | 266 empty |

Brand names were consolidated into these canonical labels:

`Appacs`, `Apple`, `Deken`, `Ghostek`, `Hoco`, `HyperGear`, `Krieg`,
`Langsdom`, `Naztech`, `PowerPeak`, `Rock Space`, `Samsung`, `USG`, `XBase`
and `XO`.

## Remaining manual work

- 171 products do not have any verified product image.
- 41 products do not have a verified wholesale price.
- 116 products do not have a UPC in the available sources.
- 266 products do not describe a color that can be inferred safely.
- 9 products do not have a positive retail price in the available sources.
- One optional editorial `secciones` field remains empty.

These values were deliberately left blank instead of inventing commercial
data.

## Brand assets

The website now uses a single brand registry in `src/lib/brands.ts`. It maps
each canonical brand to its approved local logo and accent color. The same
registry enriches product records and drives the new brand section on the home
page.

## Safety and repetition

- A complete local backup is generated under `docs/backups/` before every
  applied update.
- `npm run catalog:audit` performs a read-only audit.
- `npm run catalog:fill` previews the proposed changes without writing.
- `npm run catalog:fill:apply` creates a backup and applies verified changes.
