# Routes

Framework: Next.js Pages Router.

- `/` → `src/pages/index.tsx` — retail homepage with hero, promotions, brands, selected products, experience, locations and reviews.
- `/shop` → `src/pages/shop/index.tsx` — searchable retail catalog.
- `/shop/[slug]` → `src/pages/shop/[slug].tsx` — retail product detail.
- `/categories` → `src/pages/categories/index.tsx` — category directory.
- `/categories/[slug]` → `src/pages/categories/[slug].tsx` — category landing.
- `/colecciones/[slug]` → `src/pages/colecciones/[slug].tsx` — collection landing.
- `/cart` → `src/pages/cart/index.tsx` — retail cart.
- `/checkout` → `src/pages/checkout/index.tsx` — retail checkout.
- `/mayoreo/catalogo` → `src/pages/mayoreo/catalogo.tsx` — independent wholesale catalog.
- `/mayoreo/admin` → `src/pages/mayoreo/admin/index.tsx` — standalone wholesale administration.
- `/admin/*` → `src/pages/admin/*.tsx` — authenticated administration.

All routes use `src/pages/_app.tsx`. Retail routes receive Navbar/Footer from their page dependency trees; seasonal decoration is mounted in _app only outside /admin and /mayoreo.

