# Key page dependency trees

## / (Home)
Entry: `src/pages/index.tsx`
Dependencies:
- `src/components/navbarmenu/page.tsx`
  - `src/styles/navigation2026.module.css`
  - `src/context/useAuth.tsx`
  - `src/lib/siteConfig.tsx`
- `src/components/Footer/page.tsx`
  - `src/styles/footer2026.module.css`
  - `src/lib/siteConfig.tsx`
- `src/components/AppIntro/page.tsx`
  - `src/components/AppIntro/styles.module.css`
- `src/components/MarketingContent/page.tsx`
  - `src/styles/marketingContent.module.css`
- `src/styles/home2026.module.css`
- `src/lib/catalog.ts`
- `src/lib/brands.ts`
- `src/lib/siteConfig.tsx`
- `src/lib/imageFallback.ts`
- `src/pages/_app.tsx`
  - `src/components/MotionSystem/page.tsx`
  - `src/components/HalloweenDecor/page.tsx`
  - `src/styles/globals.css`

## /shop
Entry: `src/pages/shop/index.tsx`
Dependencies:
- `src/components/navbarmenu/page.tsx`
- `src/components/Footer/page.tsx`
- `src/styles/shopHero2026.module.css`
- `src/lib/catalog.ts`

## /mayoreo/catalogo
Entry: `src/pages/mayoreo/catalogo.tsx`
Dependencies:
- `src/components/wholesale-ui/CatalogApp.tsx`
- `src/components/wholesale-ui/CatalogExperience.tsx`
- `src/components/wholesale-ui/CatalogSearch.tsx`
- `src/components/wholesale-ui/OrderDrawer.tsx`
- `src/styles/wholesale-ui/*.css`

## /admin/mayoreo and /mayoreo/admin
Entry: `src/pages/admin/mayoreo.tsx`
Dependencies:
- `src/styles/adminWholesale.module.css`
- `src/context/useAuth.tsx`
- `src/lib/adminAccess.ts`

