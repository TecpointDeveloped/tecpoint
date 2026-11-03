# Extractable components

## NavbarMenu
- Source: `src/components/navbarmenu/page.tsx`
- Category: layout
- Description: Retail navigation with brand mark, store links, account and cart actions.
- Extractable props: active route, cart count, authenticated state.
- Hardcoded: official logo assets, core retail labels, icon style.

## Footer
- Source: `src/components/Footer/page.tsx`
- Category: layout
- Description: Branded footer with service and contact navigation.
- Extractable props: locations, WhatsApp URL.
- Hardcoded: TECPOINT identity and footer typography.

## MarketingContent
- Source: `src/components/MarketingContent/page.tsx`
- Category: basic
- Description: Responsive banner and promotional media presentation.
- Extractable props: assets, image/video URLs, CTA labels and URLs.
- Hardcoded: carousel behavior and responsive rendering.

## Button
- Source: `src/components/ui/button.tsx`
- Category: basic
- Description: Shared variant-based action button.
- Extractable props: variant, size, disabled state.
- Hardcoded: class variants.

## Input
- Source: `src/components/ui/input.tsx`
- Category: basic
- Description: Shared accessible text input.
- Extractable props: type, value, placeholder, disabled state.
- Hardcoded: base class tokens.

## SeasonalDecor
- Current source: `src/components/HalloweenDecor/page.tsx`
- Category: layout
- Description: Non-interactive global seasonal overlay mounted only on retail pages.
- Extractable props: active season, reduced-motion preference.
- Hardcoded: pointer-events none, safe zones and decorative assets.

