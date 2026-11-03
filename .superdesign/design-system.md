# TECPOINT retail design system

## Product and audience

TECPOINT is a Honduran technology-accessories retailer. The homepage should make products feel carefully selected, easy to understand and trustworthy. The primary audience shops on mobile and desktop and needs fast access to the catalog, categories, locations and WhatsApp ordering.

## Brand foundation

- Use the official TECPOINT logo; never replace it with text, initials, emoji or a fabricated mark.
- Core palette: near-black `#111817`, TECPOINT red `#c8102e`, bright red `#ef233c`, white `#ffffff`, soft gray `#f4f6f7`.
- Primary typeface: Poppins. Use bold, tightly tracked display headlines and clean, readable body copy.
- Geometry is crisp, editorial and technological. Prefer thin borders, confident rectangles and restrained rounded corners.
- Photography and product imagery stay undistorted and clearly visible.

## Seasonal direction: Black November with early Christmas accents

- Black November is the dominant idea: black glass, subtle red metallic glow, precise offer labels and premium contrast.
- Christmas is secondary and anticipatory: warm white micro-lights, very sparse snow, small gold glints and one restrained pine-green accent at most.
- Do not use cartoon Santa figures, oversized candy canes, loud green/red stripes or low-cost clip art.
- Remove all Halloween spiders, webs, bats, ghosts and horror effects.
- Seasonal decoration must never cover navigation, product cards, text, banners or calls to action and must use `pointer-events: none`.
- Keep performance light: CSS shapes and gradients, limited element count, no heavy video or large new images.

## Layout and components

- Preserve the existing homepage structure and content order: navigation, announcement, hero, promotions, categories, brands, selected products, experience, locations, reviews, closing CTA and footer.
- Add one slim Black November promotional ribbon near the top with a catalog CTA.
- Seasonal ambient decoration may sit at viewport edges and within the hero background, never above interactive content.
- Product and category cards remain white and legible; use seasonal accents only on borders, badges and hover shadows.
- Maintain mobile readability and avoid excessive vertical space.

## Motion and accessibility

- Motion should feel premium: slow drifting sparkles, occasional tiny snowflakes and gentle red/gold light pulses.
- Respect `prefers-reduced-motion`; all seasonal animation becomes static or hidden.
- Avoid layout shifts and continuous high-cost filters.
- Maintain visible focus rings and WCAG-conscious contrast.

## Hard constraints

- Do not change product data, prices, inventory, routes, checkout, WhatsApp numbers, admin, wholesale catalog or Firebase behavior.
- Keep Poppins and the TECPOINT palette.
- Use only the existing official logo assets.
