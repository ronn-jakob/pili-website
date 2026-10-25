# Pili — Design Reference

> Exact visual specifications for the Pili homepage. All measurements below were verified against the CSS modules and `src/styles/index.css` on 2026-10-20. They are the implementation source of truth.

---

## 1. Design source and the 80% scale

- Figma file: `uqzVhcY0Jioe1sX3ZpNP2I`
- Frame of record: **`Home Page 3`** (`50:109`), an extension of the original **`Home Page`** (`1:2`)
- The entire UI is the original comp at **80%**. A 1280px design column becomes **1024px**; the 1920px frame becomes 1536px of content context.
- **Never round the scaled values.** `82.4px`, `614.4px`, `176px`, `215.2px`, `14.4px`, `0.55rem`, `1.6px` are deliberate.
- The Figma frame is not perfectly centred (scaling about a non-centre pivot offsets layers by ~+7.6px). When comparing raw Figma x-coordinates, subtract ~7.6px first. The implementation is centred by construction (`margin-inline: auto`).
- The comp is desktop-only. The `768px` and `1024px` breakpoints are project adaptations.
- Frame IDs and the “source outpainted to 4094×2060” note come from earlier design notes and were **not re-queried** during the documentation audit. All CSS values below are verified.

---

## 2. Global tokens (`src/styles/index.css`)

### Colors

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#2760ee` | Brand blue, links, focus rings |
| `--color-primary-dark` | `#1e4cc4` | Hover state |
| `--color-primary-light` | `#e8f0ff` | Outlined hover fill |
| `--color-primary-soft` | `#6384d3` | Gradient end |
| `--color-text-strong` | `#010101` | Headings/nav |
| `--color-text-primary` | `#111827` | Body |
| `--color-text-secondary` | `#4b5563` | Ghost buttons |
| `--color-text-muted` | `#9ca3af` | Unused |
| `--color-background` | `#ffffff` | Page/footer |
| `--color-surface` | `#f8fafc` | Hover surface |
| `--color-border` | `#e2e8f0` | Dividers |
| `--color-header-bg` | `#fafafa` | Header tier, carousel control |
| `--color-header-border` | `#c3c3c3` | Header hairline |
| `--color-header-divider` | `#9c9c9c` | Nav divider |
| `--color-hero-overlay` | `rgba(1, 0, 0, 0.15)` | Hero scrim |
| `--color-hero-field` | `rgba(250, 250, 250, 0.98)` | Search field |
| `--color-hero-placeholder` | `rgba(0, 0, 0, 0.58)` | Search placeholder |
| `--color-card-placeholder` | `#d9d9d9` | Grey cards, heart idle |
| `--color-card-border` | `rgba(102, 98, 98, 0.49)` | Package card border |
| `--color-card-category` | `rgba(0, 0, 0, 0.76)` | Package category |
| `--color-card-booked` | `#797979` | “2 Booked” |
| `--color-arrow-icon` | `#797979` | Carousel glyph |
| `--color-arrow-border` | `#c0c0c0` | Carousel border |
| `--color-rating-border` | `#ffcc4c` | Rating badge border |
| `--color-rating-fill` | `rgba(255, 204, 76, 0.09)` | Rating badge fill |
| `--color-rating-star` | `#ffcc4c` | Star, “/5” |
| `--color-rating-value` | `#f5af00` | Rating number |
| `--color-offer-border` | `#ff0027` | Offer badge border |
| `--color-offer-text` | `#ff001a` | Offer text |
| `--color-wishlist-active` | `#ff0027` | Active heart |
| `--color-accent-red` | `#ff0027` | Why Choose band 1 accent |
| `--color-accent-blue` | `#195cff` | Band 2 accent |
| `--color-accent-yellow` | `#f5af00` | Band 3 accent |
| `--color-footer-rule` | `rgba(0, 0, 0, 0.28)` | Footer rules |
| `--color-footer-text` | `rgba(0, 0, 0, 0.5)` | Contacts |
| `--color-footer-copyright` | `rgba(0, 0, 0, 0.49)` | Copyright |
| `--color-payment-border` | `rgba(0, 0, 0, 0.5)` | Payment badges |
| `--color-modal-overlay` | `rgba(0, 0, 0, 0.6)` | Auth modal backdrop |
| `--color-modal-button` | `#195cff` | Auth modal primary button |
| `--color-page-ink` | `#1f242e` | Destination page headings |
| `--color-page-muted` | `#737a85` | Destination page body/meta |
| `--color-page-coral` | `#eb5966` | Destination page accent |
| `--color-page-surface` | `#f7f9fa` | Story/tip surfaces |
| `--color-page-border` | `#e5e8ed` | Destination/package card borders |
| `--color-page-link` | `#1a66e5` | Package prices, story CTA |
| `--color-page-hero-eyebrow` | `#e5d9bf` | Destination hero eyebrow |
| `--color-page-hero-text` | `#e5ebf2` | Destination hero subtitle |
| `--color-page-hero-overlay` | `rgba(13, 26, 46, 0.45)` | Destination hero overlay |
| `--color-package-ink` | `#1a1a1a` | Packages page text |
| `--color-package-muted` | `#737373` | Packages page secondary text |
| `--color-package-blue` | `#1f40b0` | Packages filters/buttons |
| `--color-package-link` | `#1a66e5` | Packages action blue |
| `--color-package-star` | `#e58c1a` | Package ratings |
| `--color-package-border` | `#c6c6c6` | Sort control border |
| `--color-detail-muted` | `#787878` | Tour details secondary text |
| `--color-detail-surface` | `#f9f9f9` | Itinerary cards, date field |
| `--color-detail-border` | `#c3c3c3` | Sidebar/divider borders |
| `--color-detail-success` | `#339933` | Slots-available note |
| `--color-booking-bg` | `#f5f7fa` | Booking page background |
| `--color-booking-field` | `#f7fafc` | Booking form fields |
| `--color-booking-success` | `#1f9966` | Booking cancellation notes |
| `--color-booking-badge` | `#ebf2ff` | Free-cancellation badge |
| `--color-success/error/warning` | `#10b981 / #ef4444 / #f59e0b` | Reserved, unused on the page |

### Typography

Fonts: `--font-family` Poppins, `--font-family-heading` Inter, `--font-family-accent` Kaushan Script.

| Token | rem | px @16 | Typical use |
|---|---|---|---|
| `--font-size-2xs` | 0.6 | 9.6 | — |
| `--font-size-caption` | 0.6875 | 11 | Copyright |
| `--font-size-xs` | 0.7 | 11.2 | Tagline |
| `--font-size-sm` | 0.75 | 12 | Nav, meta |
| `--font-size-body-sm` | 0.875 | 14 | Why Choose body, footer heading |
| `--font-size-base` | 0.8 | 12.8 | Body default |
| `--font-size-md` | 1 | 16 | Secondary nav, links |
| `--font-size-lg` | 1.2 | 19.2 | Mobile Why Choose eyebrow |
| `--font-size-xl` | 1.4 | 22.4 | Section titles, hero eyebrow mobile |
| `--font-size-2xl` | 1.6 | 25.6 | Card title, hero eyebrow desktop |
| `--font-size-3xl` | 2 | 32 | Why Choose title, hero h1 mobile |
| `--font-size-4xl` | 2.4 | 38.4 | Unused |
| `--font-size-5xl` | 3.2 | 51.2 | Hero h1 desktop |
| `--font-size-display` | 4 | 64 | Kaushan accents |

Weights: light 300, normal 400, medium 500, semibold 600, bold 700, extrabold 800. Line heights: tight 1.1, snug 1.3, normal 1.5, relaxed 1.6.

### Spacing, radii, shadows, transitions

- Spacing (rem): 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.6, 2, 2.4, 3.2, 4.8 → 3.2–76.8px.
- Radii: `xs` 4px, `2xs` 4.8px, `sm` 3.2px, `md` 6.4px, `control` 8.8px, `lg` 9.6px, `xl` 12.8px, `2xl` 14.4px, `full` 9999px.
- Shadows: `sm` `0 1px 3px rgba(0,0,0,.08)`; `md` `0 4px 12px rgba(0,0,0,.08)`; `lg` `0 12px 32px rgba(0,0,0,.12)`.
- Transitions: fast 150ms ease, base 200ms ease.
- Layout: `--container-max-width` 1075.2px (1024px column + 2×25.6px gutters); `--header-offset` 84px, 162px from 768px up.

---

## 3. Header

Files: `src/components/sections/shared/Header/` and `src/components/sections/shared/ProfileMenu/`.

**Shell**
- `position: sticky; top: 0; z-index: 1000`, white background.
- Measured height: **83.4px below 768px**, **162.2px at ≥768px** (top tier 84px + bottom tier ~78px).
- In-page anchor offset must match: `--header-offset` 84px / 162px.

**Top tier**
- Background `#fafafa`, `border-bottom: 1.6px solid #c3c3c3`.
- Row: flex, centred, `min-height: 82.4px`, gap 1.35rem (21.6px).
- Logo `large`, links Home / About us / Contacts / Wishlist.
- Nav 12px semibold, line-height 1, vertical padding 0.4rem (6.4px); hover/focus `#2760ee`.
- Divider 1×49.6px, `margin-left: 5.6px`, colour `#9c9c9c`.
- Auth (guest): “Sign up” 12px semibold + Login `Button` (`primary`, medium, pill), gap 1.05rem (16.8px).
- **Signed-in:** Sign up/Login are replaced by the `ProfileMenu` avatar.

**Signed-in profile menu**
- Avatar: **36px** circle (34px below 768px), `--color-surface` background, 1px `--color-border`, 18px person icon; hover/focus turns blue.
- Dropdown: right-aligned under the avatar, min-width **220px**, white, radius 10px, 1px border, `--shadow-lg`, 8px padding, 150ms fade/scale-in.
- Items: **My Bookings**, **Notifications**, **Settings**, then a divider and **Logout** (red). Each is 40px tall, 13px medium, 18px icon, hover surface background.
- Closes on outside click, Escape (focus returns to the avatar), or item selection; keyboard/ARIA menu pattern (`aria-haspopup`, `aria-expanded`, `aria-controls`, `role="menu"`).
- My Bookings/Notifications/Settings are placeholder links; Logout clears the mock session.
- Below 768px the avatar sits before the hamburger (auth actions become visible only when signed in), and the mobile menu hides Sign up/Login.

**Bottom tier**
- `padding: 10.4px 0 17.6px`.
- Left column gap 8.8px: tagline “Start your Vacation Here!” (11.2px, light) and links Destinations / Packages / Special Offers (16px semibold, gap 2.3rem = 36.8px).
- Right: intentionally empty — the frame's Book Now button was removed at the owner's request.

**Mobile (<768px)**
- Top tier only; logo scaled to 44.8px icon / 59.2px wordmark window.
- Hamburger button 35.2×35.2px, radius 6.4px, inline SVG 24×24 (stroke 2).
- Menu: absolute below the header (`top: 100%`), white, bottom border, shadow `lg`, padding 1.2rem top / 1.6rem bottom.
- Links 16px medium, padding 0.6rem 0; divider 1px `--color-border`; actions column gap 0.6rem; full-width Login. When signed in, the guest auth actions are omitted and the avatar is shown in the top row instead.
- Menu closes on any link click; `aria-expanded`, `aria-controls="mobile-menu"`, `role="dialog"`, `aria-modal="true"`.

**Desktop (≥768px)**
- Shows main nav, divider, auth actions (guest buttons or avatar), bottom tier; hides hamburger and mobile menu.

**Links**
- Home `#top`, About us `#why-choose`, Contacts `#contacts`; Wishlist `/wishlist` (placeholder).
- Logo links to `/`.

---

## 4. Hero

Files: `src/components/sections/home/Hero/`.

- Height: `min-height: 320px`, **360px from 768px up**.
- Background: a 3-slide horizontal track (photo A, photo B, photo A) inside an absolute `inset: 0` wrapper (`z-index: -2`, `overflow: hidden`). Slides take 33.3333% of a 300%-wide flex track; each image is `object-fit: cover; object-position: center`. The `rgba(1,0,0,0.15)` overlay sits above it; the section uses `isolation: isolate`.
- Rotation (`heroSwipe`, 18s `ease-in-out` infinite): hold A to 27.778%, swipe to B by 33.333%, hold B to 61.111%, swipe to A by 66.667%, hold to 99.99%, reset to 0 at 100%. The third slide duplicates A, so the reset is invisible; each photo is held ~5s per swipe.
- Reduced motion: the track's `animation` is `none`, leaving the first photo static.
- Content: left-aligned, `padding-top` 2.4rem (38.4px) / `padding-bottom` 2rem (32px); ≥768px **87.2px / 85.6px**.
- Eyebrow “Choose your vacation”: 22.4px ExtraBold, line-height 1.5, `rgba(255,255,255,.95)`, shadow `0 4px 4px rgba(0,0,0,.3)`; **25.6px** ≥768px.
- Title “Choose Philippines”: 32px ExtraBold, uppercase, line-height 1.5, `margin-top: -0.2em` (overlaps the eyebrow line box by 11.2px at desktop), white, shadow `0 4px 8.9px rgba(0,0,0,.3)`; **51.2px** ≥768px.
- Search form: max-width **614.4px**, height **52.8px**, padding 8px 8.8px, radius 8.8px, background `rgba(250,250,250,.98)`; `margin-top` 1.6rem (25.6px), **29.6px** ≥768px. Focus-within: 2px blue outline, offset 2px.
- Input: flex 1, 12px mobile / 16px desktop, padding 0 0.8rem; placeholder colour `rgba(0,0,0,.58)`. Hidden accessible label `Destination`.
- Submit button: **56.8×36.8px**, radius 4.8px, blue, icon colour matches the field; magnifier SVG 18.6px, stroke 1.6. Hover darkens.
- Submit calls `preventDefault()` — UI only.
- Assets: `hero-photo.jpg` **2400×450** (photo A) and `hero-photo-2.png` **1920×358** (photo B), both cropped to the ~5.33:1 band by `cover`.

---

## 5. Destinations

Files: `src/components/sections/home/Destinations/`.

- Section: `padding-top: 50.4px`, `overflow-x: clip`.
- Heading row: `max-width: 966.4px` (aligns with the card row), flex space-between, gap 1.2rem.
- Title “Where is your next Destination?”: Inter Bold **22.4px**, line-height 1.2, letter-spacing 0.02em.
- “See more”: 16px light, line-height 1.5, underlined (`text-underline-position: from-font`), hover blue.
- Row: `margin-top: 27.2px`, `display: flow-root`.
- Card list: flex, gap **21.6px**, horizontal scroll, `scroll-snap-type: x mandatory`, scrollbar hidden; padding 6px 0 14px with matching negative margins (room for hover lift).
- Card: **176×215.2px**, radius 14.4px, `overflow: hidden`, flex column, content bottom-aligned.
- Image: absolute inset 0, cover. Placeholder: flat `#d9d9d9`.
- Title: 25.6px semibold, white, line-height 1.5, padding 0 12.8px.
- Meta (“10 Activities”): 12px medium, white, line-height 1.5, padding 0 12.8px 14.4px.
- Hover/focus: lift `-4px`, shadow `lg`, image scales to 1.04. Disabled under reduced motion.
- Carousel control: positioned `right: -26.8px`; 48px; ≥1024px only; scrolls the card row right and disables at the end.
- Data: first five active Firestore destinations, with static Aklan/placeholder fallback.

---

## 6. Popular Places

Files: `src/components/sections/home/PopularPlaces/`.

- Section: padding 54.4px top / 43.2px bottom; `overflow-x: clip`.
- Heading: `max-width: 964px`, flex space-between.
- Title “Popular Places”: Inter Bold 22.4px, line-height 1.2, tracking 0.02em.
- Subtitle “Tourist Favorite Choices”: Inter 16px normal, line-height 1.2, tracking 0.02em, margin-top 4px.
- “See more”: 16px light, margin-top 3px, underlined, hover blue.
- Row `margin-top: 19px`.
- Grid: 1 column, gap 16px; ≥768px gap 24px; **≥1024px 2 columns**, gaps 40px row / 24px column; max-width 964px.
- Card: height **215px**, 1px border `rgba(102,98,98,.49)`, radius 14.4px, white, `overflow: hidden`, flex. Placeholder: `#d9d9d9`, transparent border.
- Photo: 38% width on mobile; **198px fixed from 768px up**; cover.
- Body padding: `14px 14px 12px 13px`; ≥768px `17px 20px 14px 17px`.
- Category (Poppins Light): 14px mobile / **15px** ≥768px, line-height 1.5, `rgba(0,0,0,.76)`.
- Title (Poppins Medium): 15px mobile / **16px** ≥768px, max-width 150px / **171px**, margin-top 1px.
- Meta: flex, gap 5px, margin-top 6px / 8px.
  - Rating badge: height 18px, padding 0 6px 0 7px, 1px `#ffcc4c` border, 9% yellow fill; star 10px; text 12px medium; number `#f5af00`, “/5” `#ffcc4c`.
  - Booked text 13px medium, `#797979`.
- Price: 15px / **16px** medium, margin-top 20px / **31px**.
- Offer badge: height 18px, min-width 86px, 1px `#ff0027` border, 12px medium, `#ff001a`, padding 0 4px, margin-top 8px / 10px.
- Wishlist heart: 44×44px tap target at `top: 6px; right: 10px`, icon 25px; idle `#d9d9d9`, active `#ff0027` (path stroke also changes); hover scale 1.06; `aria-pressed`.
- Whole card is clickable via the title link’s stretched `::after`; `:focus-within` paints the card ring; hover lifts `-4px` with `shadow-md` (reduced motion disables the lift).
- Carousel control `right: -26.8px` at ≥1024px; reveals 4 more packages per click and disables when all are shown. Below 1024px, a centered **Show 4 more places** button appears under the grid.
- Data: first four published Firestore packages sorted featured/rating, with static Enchanted Kingdom/placeholder fallback.

---

## 7. Why Choose Pili

Files: `src/components/sections/home/WhyChoose/`.

- Section `padding-bottom: 98px` (64px below 768px); id `why-choose`.
- Three stacked bands, full-bleed: heights **336 / 296 / 358px**; `overflow: hidden`.
- Background: absolute photo, cover, centre. Band 2 uses `object-position: 20% center`.
- Scrims (left→right):
  - Band 1 (`discover`): `#fff 0% → #fff 27.385% → rgba(102,102,102,0) 100%`, plus inset shadows `0 -5px 6.6px rgba(0,0,0,.25)` and `0 4px 4px rgba(0,0,0,.25)`.
  - Band 2 (`simple`): `rgba(255,255,255,0) 0% → #fff 83.173% → #fff 100%`.
  - Band 3 (`support`): `#fff 0% → #fff 17.308% → rgba(255,255,255,0) 100%`, plus inset shadows `0 6px 5.5px 1px rgba(0,0,0,.25)` and `0 -8px 6.6px rgba(0,0,0,.25)`.
- Content `padding-top`: 32px (band 1), 64px (bands 2–3).
- Text: max-width 515px; band 2 max-width 520px, pushed right (`margin-left: auto`), right-aligned; band 3 title max-width 422px.
- Eyebrow “Why Choose Pili?”: Inter Bold 22.4px, line-height 1.2, tracking 0.02em.
- Title: 32px, line-height `1.0012`, tracking 0.06em.
  - Band 1: Inter Bold, max-width 440px, margin-top -2px.
  - Band 2: Poppins Bold, line-height 1.453.
  - Band 3: Poppins Normal.
- Accent word (Kaushan Script): **64px**, normal weight, tracking 0.06em.
  - Band 1 `#ff0027`, line-height 1.0012; Band 2 `#195cff`, line-height 1.453; Band 3 `#f5af00`, line-height 1.502.
- Body: 14px, line-height 1.453, tracking 0.06em; margin-top 51 / 30 / 34px per band.
- Forced break after “mountains” only from 768px up (`<br>` hidden on phones).
- Tablet 768–1279px: strengthened scrims (70%/30% white stops) because the 1920px percentage fade is too narrow.
- Phone <768px: band becomes a 220px photo above copy on white; scrim hidden; content padding 24px top / 32px bottom; eyebrow 19.2px; title 22px (band 3 max 300px); accent 40px; body 13px, margin-top 20px.

---

## 8. Footer

Files: `src/components/sections/shared/Footer/`.

- Footer id `contacts`; white background.
- Top band: 1px top rule `rgba(0,0,0,.28)`, padding 34px top / 39px bottom.
- Grid: 1 column, gap 32px; **≥768px: `381px minmax(0, 1fr)`**, gap 0.
- Headings: 14px normal, line-height 1.21, `#010101`.
- Contacts list: margin-top 26px, row gap 18.5px, 12px, line-height 1.21, `rgba(0,0,0,.5)`; email `mailto:` and phone `tel:`; hover/focus underline and darken; 2px focus outline offset 3px.
- Payment badges: 2-column grid of 44px, gaps 10px row / 11px column, margin-top 15px; badge **44×23px**, 1px `rgba(0,0,0,.5)` border, radius 4px; icons centred.
- Bottom band: 1px top rule, padding 36px top / 33px bottom; flex space-between, gap 1.2rem.
- Copyright: 11px, line-height 1.21, `rgba(0,0,0,.49)`.
- Socials: flex, gap 14.5px; each link **19.1111×19.1111px**; hover opacity 0.6; external links open in a new tab with `rel="noreferrer"` and `aria-label`.
- <768px: bottom row becomes a column, left-aligned, gap 20px; the two content columns stack with a 32px gap.

---

## 9. Shared UI primitives

### Button (`src/components/ui/Button/`)
- Base: inline-flex, centred, gap 0.4rem, no border, semibold; disabled opacity 0.6; focus 2px blue outline offset 2px.
- Sizes:
  - `small`: padding 0.4rem 0.8rem, 11.2px, min-height 25.6px.
  - `medium`: padding 0 1.6rem, 12px, min-height **30.4px**.
  - `large`: padding 0 1rem, 16px, weight 500, min-height **32px**.
- Shapes: `pill` (radius full), `rounded` (8.8px).
- Variants: `primary` (blue, hover dark blue + shadow md, active scale .98), `secondary` (surface, hover border colour), `outlined` (blue border, hover tint), `ghost` (transparent, secondary text), `gradient` (`linear-gradient(105.95deg, #2760ee 11.4%, #6384d3 178%)`, hover brightness 1.06, active scale .98).
- Loading: 12.8px spinner, 1.6px white border, 0.8s spin; text opacity 0.8.
- No `as` prop/link rendering. `disabled || loading` disables the button.

### Container (`src/components/ui/Container/`)
- Width 100%, centred; padding 0.8rem; ≥768px 1.2rem; ≥1024px 1.6rem.
- `default` and `wide`: max-width **1075.2px**. `narrow`: **768px**. `page`: **1549.2px** (1498px destination grid + gutters).
- Homepage sections use `size="wide"`; the destination page uses `size="page"`.

### Logo (`src/components/ui/Logo/`)
- Renders a React Router `<Link to="/">` (or a `<span>` with `link={false}`) with optional icon/wordmark. Uses `pili-logo.svg` (icon) and `pili-name.svg` (wordmark).
- Sizes (icon height / wordmark window / `--name-scale`):
  - `small`: 32px / 20.8px / 175%
  - `medium`: 44.8px / 35.2px / 250%
  - `large`: 66.4px / **82.4px** / **88px** (absolute, not a percentage), gap 0, margin-left -11.2px, wordmark offset -11.2px
  - <768px `large` drops to 44.8px / 59.2px, offset -7.2px
  - ≤374px `medium` drops to 38.4px / 24px
- Wordmark has built-in whitespace; the wrapper is `overflow: hidden` with `object-fit: cover; object-position: center`. Keep `--name-scale: 88px` for `large` — a percentage resolves against the 82.4px crop and renders ~7% too small.

### CarouselButton (`src/components/ui/CarouselButton/`)
- 48×48px, absolute, `top: 50%`, `translateY(-50%)`; 1px `#c0c0c0` border, full radius, `#fafafa` background, `#797979` glyph.
- Icon 22.4px, rotated 180° (source glyph points left).
- Hidden below 1024px; hover fills blue with light glyph; focus 2px outline offset 2px.
- Section supplies `right` (`-26.8px`) and the accessible `aria-label`; no click handler.

### WishlistButton (`src/components/ui/WishlistButton/`)
- 44×44 tap target, 25px heart; idle `#d9d9d9`, active `#ff0027`; hover scales 1.06; focus 2px blue outline; `aria-pressed`.
- `raised`: 36×36 white rounded square (8px radius, `0 2px 6px rgba(0,0,0,.15)`), 20px heart — used on destination photos.
- `tone="dark"`: idle `#595959` for pastel/photo backgrounds (packages page).
- Local state only; not persisted.

---

## 10. Login and sign-up modals

Files: `src/components/ui/AuthModal/`. One `AuthModal` component with `mode="login" | "signup"` shares the shell, animation, focus trap and close control. Figma frames: `Login Modal` (`108:667`) and `Sign-up Modal` (`155:835`), both implemented at **0.8× the frame**.

### Login mode

**Panel**
- Width **526.4px**; content height lands at ~573px (Figma 717 × 0.8 = 573.6px).
- Background `rgba(250,250,250,0.98)` (reuses `--color-hero-field`), radius **16px**, padding `8px 13.6px 25.6px`.
- Backdrop `rgba(0,0,0,0.6)` (`--color-modal-overlay`), z-index 2000 (above the 1000 sticky header).

**Login vertical rhythm (from panel top)**

| Element | Position / size |
|---|---|
| Logo lockup | 91.2×55.2 (40px icon + 55.2px wordmark window, 4px overlap), centred, top 8 |
| Top divider | 0.8px `rgba(0,0,0,0.5)`, 496 wide, y=68 |
| Title “Log in” | Poppins SemiBold 28.8px, line-height 1.5, black, centred, top 92 |
| Email field | 410.4×48, x=58.4, top 164 |
| Password field | 410.4×48, top 236 (24px gap) |
| Forgot Password | 12px Light, underlined, right-aligned, top 293.6 |
| Login button | 410.4×48, top 349.6 |
| “No Account ?” row | text 12px Light, 0.8px 50%-black rules either side, y=412.8 |
| Create Account | 410.4×48, top 446.4 |
| Terms | 8.8px Regular `rgba(0,0,0,0.5)`, 248.8 wide, centred, top 520.8 |

**Fields**
- 1.6px solid black border, radius 16px, transparent fill.
- Placeholder Poppins Light 16px `rgba(0,0,0,0.47)`; text starts 53.6px from the field edge.
- Login icons 16px from the left: email 21.6×16.8, password 20×20.
- Focus uses the project's 2px blue outline (accessibility addition).

**Buttons**
- Primary (Login / Sign up): `--color-modal-button` **#195cff**, radius 16px, text Poppins Bold 19.2px white.
- Secondary (Create Account / Log in): transparent, 1.6px black border, radius 16px, Poppins Regular 19.2px `#010101`.

### Sign-up mode

**Panel**
- Width **1052.8px**; content ends at **~650px**. The frame's 964px includes ~146px of empty space below the terms, which is trimmed to the same 25.6px bottom padding as login.
- Same background, 16px radius and 60% backdrop; padding `9.6px 13.6px 25.6px`.

**Sign-up vertical rhythm (from panel top)**

| Element | Position / size |
|---|---|
| Logo lockup | 91.2×55.2, centred, top 9.6 |
| Top divider | 0.8px `rgba(0,0,0,0.5)`, full inner width, y=66 |
| Title “Sign-up” | Poppins SemiBold 28.8px, centred, top 79.2 |
| Column headings | Poppins SemiBold 19.2px, y=156 |
| Left fields | 410.4×48 at x=63.6; First Name, Last Name, Address, Phone Number at y=210.4 / 282.4 / 354.4 / 426.4 |
| Right fields | 410.4×48 at x=578.8; Email, Password, Confirm password at the same y values |
| Sign up button | 410.4×48, right column, y=426.4 |
| “Already have an Account ?” | 12px Light, 496-wide row with 0.8px rules, y≈490.4 |
| Log in button | 410.4×48, right column, y=523.2 |
| Terms | 8.8px Regular, 248.8 wide, right column, y=597.6 |
| Vertical divider | 0.8px `rgba(0,0,0,0.5)`, centred at 50%, y=152, height 488.8 |

**Columns**
- Two **410.4px** columns with a **104.8px** gap, centred. Raw Figma places them ~7.6px right of centre (documented scaling artifact); the implementation centres them.
- Left: `<section>` “Personal Information” (First Name, Last Name, Address, Phone Number).
- Right: `<section>` “Account Details” (Email, Password, Confirm password, Sign up button).
- Sign-up field icons sit 18.4px from the field edge: person 15.575×17.6, house 19.2×19.2, phone 18.4×18.4, email 20.8×16, password 20×20.

**Cross-navigation**
- “Create Account” in login switches to sign-up; “Log in” in sign-up switches back. The panel resizes, stays open, and focus moves to the first field.

### Shared shell

**Close button (project addition, not in the frames)**
- 44×44 hit target with a 19.2px white × glyph, transparent, outside the panel.
- Login, and sign-up below 1173px: `top: -44px; right: 0`.
- Sign-up at **≥1173px**: `top: 0; right: -52px` (beside the panel) so it clears the header actions.
- Hover: white 16% circular fill; focus: 2px white outline.

**Animation**
- Backdrop opacity 0→1 over 220ms; panel fades in with `translateY(10px) scale(0.96)` → `none` over 220ms; exit over 180ms.
- Closed state uses `visibility: hidden`, `pointer-events: none`, `inert`, and `aria-hidden`; the component stays mounted so both directions animate.
- `prefers-reduced-motion: reduce` disables the fade/transform.

**Behaviour**
- Opens from the header Login and Sign up buttons (mobile menu closes first); portalled to `document.body`.
- Closes on Escape, backdrop click, or the ×; focus moves to the first field on open and returns to the trigger on close; Tab is trapped; body scroll is locked with scrollbar-width compensation.
- Both forms call `preventDefault()`; no auth backend exists.

**Copy**
- Terms read: “By signing up or logging in, you acknowledge and agree to Pili's General Terms of Use and Privacy Policy.” (Figma still says “Klook's General Term’s…” — corrected in code.)

**Responsive**
- ≤719px: overlay padding `44.8px 12.8px 16px`; panel horizontal padding 12.8px.
- Sign-up: below 1024px the columns stack (with a horizontal 0.8px rule and the vertical divider hidden); fields and buttons go full width. At 390px the panel is 364.4px wide and ~1034px tall, so the overlay scrolls.
- Login at 390px: fields/buttons stretch to ~338.8px; terms stay on two lines.

---

## 11. In-page navigation and motion

- Anchors: `#top` (`<div>` before `Header` in `App`), `#why-choose` (`<section>`), `#contacts` (`<footer>`).
- `html { scroll-behavior: smooth; scroll-padding-top: var(--header-offset); }`
- `--header-offset`: 84px (<768px), 162px (≥768px), matching measured header heights 83.4px / 162.2px.
- `prefers-reduced-motion: reduce` → `scroll-behavior: auto`; card hover lifts also removed.
- The anchor div must stay **outside** the sticky header; targeting a sticky element only scrolls by the offset.
- Footer can only reach the page bottom on tall viewports; that is expected.

---

## 12. Assets (verified dimensions)

| Asset | Size | Use |
|---|---|---|
| `Images/pili-logo.svg` | vector, ~423 KB (embedded PNG) | Logo icon, favicon |
| `Images/pili-name.svg` | vector | Logo wordmark |
| `Images/Pili-logo-with-name.svg` | vector, large | **Unused** |
| `Images/hero-photo.jpg` | 2400×450 | Hero background photo A (123 KB) |
| `Images/hero-photo-2.png` | 1920×358 | Hero background photo B (1.46 MB; worth optimising) |
| `Images/destinations-hero.png` | 1920×500 | Destination page hero background |
| `Images/destinations/palawan.png` | 600×400 | Palawan card |
| `Images/destinations/siargao.png` | 600×400 | Siargao card |
| `Images/destinations/bohol.png` | 700×467 | Bohol card |
| `Images/destinations/cebu.png` | 700×465 | Cebu card |
| `Images/destinations/banaue.png` | 700×467 | Banaue card + story image |
| `Images/packages/*.png` | 600×400 | Featured package cards (destination page) |
| `Images/packages-hero.png` | 1920×1080 | Packages page hero (547 KB) |
| `Images/aklan.jpg` | 440×538 | Aklan destination card |
| `Images/enchanted-kingdom.jpg` | 416×452 | Enchanted Kingdom card |
| `Images/why-choose-discover.jpg` | 2400×420 | Band 1 |
| `Images/why-choose-simple.jpg` | 2400×370 | Band 2 |
| `Images/why-choose-support.jpg` | 2400×448 | Band 3 |
| `Images/heroImage-1.png` | 1920×450, 1.39 MB | **Unused** legacy hero |
| `Images/payments/*.svg` | 5 marks | Visa, Google Pay, Mastercard, Apple Pay, PayPal |
| `Images/social/*.svg` | 5 icons | Facebook, YouTube, X, TikTok, Instagram |
| `public/favicon.svg`, `public/icons.svg` | — | **Unused** |
| `assets/react.svg`, `assets/vite.svg` | — | **Unused** Vite template assets |

All photos use `object-fit: cover`; destination and package cards crop to their fixed frames, hero and bands are full-bleed.

---

## 13. Responsive summary

| Section | <768px | 768–1023px | ≥1024px |
|---|---|---|---|
| Header | Top tier + hamburger menu; 83.4px tall | Both tiers; 162.2px tall | Same as tablet |
| Hero | 320px, 32px title, 12px input | 360px, 51.2px title, 16px input | Same as tablet |
| Destinations | Card row scrolls; no arrow | Same | Carousel arrow at `right: -26.8px` |
| Popular Places | 1 column, 38% photo, mobile type | 1 column, 198px photo, desktop type | 2×2 grid; arrow shown |
| Why Choose | Photo above copy; scrim hidden | Overlay with strengthened scrim | Design gradients |
| Footer | Stacked columns; copyright column | 381px + 1fr; single bottom row | Same as tablet |
| Login modal | `min(526.4px, 100%)`, 12.8px panel padding, content stretches | 526.4px fixed (0.8× frame) | Same as tablet |
| Sign-up modal | `min(1052.8px, 100%)`; columns stacked, vertical divider hidden | Two columns (fits from 1024px) | Two columns; 1052.8px panel |
| Destination hero | 420px tall, 32px title | 460px tall, 44px title | 460px tall, 52px title |
| Destination cards | 1 column | Top row stacked; bottom 1 column | Top 902+560; bottom 3×480 |
| Destination story/packages | Stacked; packages 1 column | Story stacked; packages 2 columns | 48.6/51.4 split; packages 3 columns |
| Packages hero | 300px tall, 34px title | 347px tall, 48px title | 347px tall, 48px title |
| Packages listing | 1 column, filters stacked, cards 1 column | 1 column, filters 2-col grid, cards 2 columns | 280px filters + 2-column card grid |
| Package detail | Single column; sidebar full width; gallery 2-col | Single column; sidebar max 560px | 900px content + 460px sidebar; full gallery |
| Booking page | Single column; form/summary full width; steps wrap | Single column; 400px summary below | 780px form + 400px summary |
| Review / payment | Single column; actions stack; fields single column | Single column; 400px summary below | 780px content + 400px summary |

---

## 16. Tour details page (`/packages/:packageId`)

File: `src/pages/PackageDetailPage/PackageDetailPage.jsx`. Frame `Tour Details Page` (`194:96`), implemented at **1.0 scale**. Base data comes from `src/data/packages.js` (`getPackageById`); unknown IDs redirect to `/packages`. The page also reads the matching Firestore tour by ID to merge itinerary locations and display the public map modal.

### 16.1 Hero (`PackageDetailHero`)

- Height **420px**, full-bleed package `heroImage`, overlay `rgba(5,13,26,.42)` plus a left-to-right shade `rgba(3,10,26,.55) → transparent` at 57%.
- Content column max **1010px**, centred, padding-top 40px.
- **Back button:** 44px translucent pill (`rgba(0,0,0,.35)`, 1px white 30% border, white 13px Medium) with a left arrow, above the breadcrumb; links to `/packages`. Hover darkens; white focus ring.
- Breadcrumb: Poppins 13px white (`Home / Packages / {title}`), links to `/` and `/packages`.
- Title: Poppins Bold **48px**, white. Location 16px. Rating pill: white, 20px radius, star `#f5af00`, 14px Medium.
- Tags: `rgba(0,0,0,.4)` pills, 16px radius, 13px Medium white — duration + category.
- ≤767px: 32px title, 14px location, content padding 16px.

### 16.2 Main content (`PackageDetailBody`)

- Inner max **1452px** (1420 content) with 16px gutters; left column **900px** + 60px gap + sidebar **460px**.
- About: Inter Bold 24px title; Poppins 15px / 26px `#787878` body.
- Itinerary: `#f9f9f9` cards, radius 14.4px; 132px cover photo; copy padding 14/18/16; day title Poppins SemiBold 16px `#2760ee`; text Poppins 14px / 22px muted. Days with a Firestore location show a small **View {place} on map** button; it opens the Leaflet/MapTiler itinerary map modal with the saved pin, address and Google Maps link.
- Tabs: Inclusions / Exclusions / Rules; 18px, active Inter Bold `#2760ee` with a 3px underline; inactive Poppins Medium `#787878`. **Functional** — switches the list below (✓ / ✕ / • markers).
- Booking sidebar: 1px `#c3c3c3` border, radius 16px, padding 28px, 24px gaps.
  - from 14px, price 32px Bold, per person 14px.
  - Departure: label 15px SemiBold + native select/date input (51px, `#f9f9f9`, radius 8px). When Firestore departures exist, the select lists date · meeting time · available slots and defaults to the first upcoming departure. Green “✓ N slots available” note 13px `#339933`.
  - Travelers: 140px control, − / count / +; 1–8, disabled at bounds.
  - Price Summary rows 14px; total row 18px SemiBold + 24px Bold `#2760ee`. **Travelers and total are functional**; the service fee is in the data.
  - Book Now: 56px, radius 8px, `#2760ee`, white 16px SemiBold — opens `/packages/:packageId/book` with the chosen date, travelers and departure ID. Free-cancellation note 12px muted, driven by `cancellationHours`.
- ≤1279px: single column, sidebar max 560px.

### 16.3 Gallery and reviews

- **What to Expect?** Inter Bold 28px; two large images **658×350** and **481×350** with a 24px gap, then five **211×163** tiles with 27px gaps; all radius 14.4px, `object-fit: cover`.
- **Reviews:** Inter Bold 28px title; score row with a 45px gold star, 64px score `#f5af00`, `/5`, “Very Good”, review count 16px. Filter pills 34px (All / 5 stars / Guides / Boats, visual only). Three cards in a 1327px grid, 17px gaps: 1px `#d9d9d9` border, radius 14px, 16/18px padding, gold stars, 14px / 22px quote, 12px author.
- ≤1099px: two review cards per row; ≤767px: one column.
- Gallery: ≤1023px two large images shrink to 260px, tiles become 3 columns; ≤639px large images stack and tiles are 2 columns.

### 16.4 Content note

- Boracay uses the frame's exact copy. The other eight packages carry package-specific placeholder copy in `src/data/packages.js`; the seven-image gallery is shared across all detail pages until per-package photography exists.

---

## 17. Booking page (`/packages/:packageId/book`)

File: `src/pages/BookingPage/BookingPage.jsx`. Frame `Booking Page` (`243:462`), implemented at **1.0 scale**. Entered from the package detail **Book Now** button, which passes the selected `date` and `travelers` through router state. Direct loads fall back to 2 travelers and `2026-11-12`.

### 17.1 Shell and header (`BookingHeader`)

- Page background `--color-booking-bg` (`#f5f7fa`), padding `32px 0 80px`; inner max **1252px** with 16px gutters (1220px content).
- Layout: **780px** main column + 40px gap + **400px** summary.
- **Return** link: 20px left arrow + 14px muted text, links to `/packages/:packageId`.
- Title “Complete your booking”: Poppins SemiBold **28px** `#1f242e`, 22px below the return link; subtitle 15px `#737a85`.
- Steps: three **140×36px** pills, radius 20px, 13px SemiBold, 20px gaps. `1 Details` is active (`#2760ee` white); Review/Payment are white with a 1.5px `#e5e8ed` border. Visual only.

### 17.2 Tour summary (`BookingTourCard`)

- White card, radius 14px, padding 16px, min-height 120px.
- Thumbnail **88×88px**, radius 10px, `object-fit: cover`.
- Title 18px SemiBold; meta 13px muted (`Category · Short place · Group of N`); cancellation note 13px Medium `#1f9966`, using the package's `cancellationHours`.

### 17.3 Details form (`BookingDetailsForm`)

- White card, radius 14px, padding 28px, 26px gaps.
- Labels 15px SemiBold `#1f242e`; helpers 13px muted.
- Fields: `#f7fafc` background, 1px `#e5e8ed` border, 10px radius, 14px text. 52px for pickup/hotel/promo, 48px for names/mobile/email.
- Pickup select (`Select a meeting point` + three options); hotel/address input; lead traveler first/last/mobile/email in a 2-column grid; promo code input with a 90×36 blue Apply; 80px special-requests textarea.
- Terms note 12px; divider; footer note 13px + **Continue to review** (180×48, radius 24, `#2760ee`).
- **Behaviour:** submit navigates to the review step with the form data; Apply is visual and no validation/persistence is implemented.

### 17.4 Order summary (`BookingSummary`)

- White card, radius 14px, padding 24px, 18px gaps.
- Rows: date (long format, e.g. “12 November 2026”) and travelers (“3 persons”); divider; ticket price `${price} × ${travelers}` and the actual service fee; divider; Total row 16px SemiBold + 20px Bold `#2760ee`.
- Free-cancellation badge: full-width, min-height 56px, radius 10px, `#ebf2ff` background, blue 13px Medium, “✓ Free cancellation until {short date}”. The date is `selected date − cancellationHours`.
- Help card: white, radius 14px, padding 24px, 14px title + 13px muted copy with the contact number.
- The detail page and booking page totals match: subtotal + service fee.

### 17.5 Responsive

- ≤1199px: single column; summary/help stack below the form.
- ≤767px: page padding 24/56; form padding 20; traveler fields single column; footer note and Continue stack (full-width button); steps wrap.

---

## 18. Booking review (`/packages/:packageId/book/review`)

File: `src/pages/BookingReviewPage/BookingReviewPage.jsx`. Frame `Booking Review` (`248:462`), **step 2** of the flow. Requires `{ date, travelers, details }` in router state; direct visits redirect to the details step.

- Same shell as the booking page (background `#f5f7fa`, 1252px inner, 780 + 40 + 400 grid).
- Header title “Review your booking”, subtitle “Double-check everything looks right before you pay”, **2 Review** active.
- Reuses `BookingTourCard`.
- **Trip details card:** white, radius 14, padding 24; 16px title + blue 13px **Edit** link; rows Date, Travelers, Pickup, Stay (label 13px muted, value 14px SemiBold).
- **Lead traveler card:** Name, Mobile, Email, Notes with the same Edit link.
- **Warning:** `#ebf2ff` card, radius 14, padding 24, 13px blue text about details being locked after payment.
- Edit and **← Back to details** return to `/book` with `{ date, travelers, details }`; the details form prefills from that state.
- **Order summary:** Date, Travelers, ticket price, service fee, Promo (entered code or “—”), **Total due**.
- **Cancellation policy card:** “Free cancellation until {date} 11:59 PM. After that, the booking is non-refundable.”
- **Continue to payment:** 197×48, radius 24, `#2760ee`, navigates to the payment step with the same state.
- ≤1199px stacks the summary below; ≤767px cards 20px padding, labels above values, actions stack.

---

## 19. Booking payment (`/packages/:packageId/book/payment`)

File: `src/pages/BookingPaymentPage/BookingPaymentPage.jsx`. Frame `Booking Payment` (`253:591`), **step 3**. Requires the same router state; direct visits redirect to the details step.

- Same shell and 780 + 40 + 400 grid; **3 Payment** active.
- **Express checkout card:** white, radius 14, padding 24; 16px title; 220×48 buttons. Apple Pay is black with a white logo; Google Pay is white with a 1px border. Both are visual only.
- Divider row “or pay with card” with 1px lines either side.
- **Card details card:** Cardholder name, Card number (with “Visa · MC · Amex” on the right), Expiry date, CVC, Billing ZIP, Country (default Philippines); 48px fields, `#f7fafc` fill, 1px border, 10px radius; Stripe security note at the bottom.
- **Order summary:** package title, short date · travelers; Subtotal, Service fee, Promo, Total; free-cancellation badge.
- **Secure checkout card:** Stripe PCI-DSS copy.
- **← Back to review** and **Pay {total}** (220×52, radius 26, `#2760ee`).
- All payment controls are UI-only; no Stripe integration and Pay does not process.
- ≤1199px stacks the summary below; ≤767px express buttons full width, card fields single column, actions stack.

---

## 14. Destination page (`/destinations`)

File: `src/pages/DestinationsPage/DestinationsPage.jsx`. Frame `Destination Page` (`87:312`), implemented at **1.0 scale** — not the homepage's 80% system. Content sits on a **1498px** editorial grid (`Container size="page"`, max 1549.2px); palette is `--color-page-*` (ink `#1f242e`, muted `#737a85`, coral `#eb5966`, surface `#f7f9fa`, border `#e5e8ed`, link `#1a66e5`). Inter is the page face, Kaushan Script the accent.

### 14.1 Hero (`DestinationsHero`)

- Height **460px**; full-bleed `destinations-hero.png` with `object-fit: cover`; overlay `rgba(13,26,46,0.45)`.
- Content centred, max-width 1200px, starting 90px from the top.
- Eyebrow “Choose your vacation”: Inter Medium 12px, tracking 2px, uppercase, `#e5d9bf`, 18px line box at y=90.
- Title “Choose the Philippines”: Inter Bold **52px / 58px**, uppercase, two lines (forced break after “the”), white, y=120.
- Subtitle: Inter Regular **16px / 30px**, `#e5ebf2`, centred, y=260.
- Search: **583×63px**, radius 10px, white, y=310; input 15px with “Baguio” placeholder (`#999`); button **56.8×36.8px**, radius 4.8px, `#2760ee`, right inset 26.2px. Submit is UI-only.
- ≤1199px: title 44/50. ≤767px: hero 420px, title 32/38, subtitle 14px, search 56px tall.

### 14.2 Popular Destinations (`PopularDestinations`)

- Section padding 26px top / 75px bottom; header row max 1480px.
- Eyebrow “A good place to begin”: Inter ExtraBold 11px, tracking 0.08em, uppercase, coral. Right meta is the live destination count.
- Title: Inter Bold 28px “Popular” + Kaushan 28px coral “destinations”, 8px gap.
- Destination cards load active Firestore destinations. The **first five by admin `sortOrder` ascending** render here; the remaining active destinations render in the “Travel made simple” section below.
- **Top row:** Palawan **902×380** and Siargao **560×369**, 20px gap, max width 1482px.
- **Bottom row:** Bohol, Cebu, Banaue **480×329**, 20px gap, max width 1480px.
- Cards: white, 1px `#e5e8ed` border, 5px radius, `overflow: hidden`.
- Hover / focus-within: lifts `-4px` with `--shadow-lg` and `z-index: 1`; the lift is disabled under `prefers-reduced-motion` (shadow feedback remains).
- Palawan: photo 53.2% width (480px); body padding `32px 24px 28px 28px`, gap 10px; region 10px Medium uppercase; title 24px Bold; description 14px; meta 13px; tip in a `#f7f9fa` 8px-radius box (12px, padding 10/12).
- Siargao: photo 200px tall; body padding 16/20, gap 8px; title 20px, description 13px, tip 12px.
- Small cards: photo 160px tall; body padding `14px 18px 16px`, gap 6px; title 18px, description 12px, meta 12px, tip 11px.
- Meta text uses `white-space: pre` so the `nights | from $… / person` spacing is preserved.
- **Wishlist:** `WishlistButton raised` — 36×36 white rounded square (radius 8, shadow `0 2px 6px rgba(0,0,0,.15)`), 20px heart, at `top: 11px; right: 13px` of the photo. Idle `#d9d9d9`, active `#ff0027`; local state only. This replaces the frame's bookmark/follow placeholders.
- Responsive: ≤1023px top row stacks (Palawan photo 320px, body 24px); bottom row 2 columns. ≤639px single column, Palawan photo 240px.

### 14.3 Story section (`StorySection`)

- Full-bleed 2-column grid, **933fr / 987fr** (48.6% / 51.4%), 337px tall.
- Left: Banaue photo, `object-fit: cover` in an absolutely positioned fill (do not let the intrinsic image ratio set the height).
- Right: `#f7f9fa` card, padding `54px 48px 40px`.
- Eyebrow “Beyond the postcard”: Inter Medium 11px coral, preceded by a 20×1px coral line.
- Title: Inter Bold 32px, with “beauty” in Kaushan Script 40px coral; forced break before “of the Philippines.”
- Body: Inter 14px / 1.5, muted, max 580px.
- CTA “Meet the local way →”: Inter SemiBold 14px `#1a66e5`.
- ≤1023px stacks (image 320px, card padding 40/32/32); ≤639px image 220px and title 26px.

### 14.4 Remaining destinations (`FeaturedPackages`)

- Section padding 17px top / 45px bottom; header and row max 1480px.
- Eyebrow “The details, already sorted”: 11px Medium coral.
- Title: Inter Bold 32px “Travel made” + Kaushan 36px coral “simple”. Right note: Inter 13px muted, right-aligned.
- Row: 3-column responsive grid, 20px gap; cards **~480×160px**, 1px border, 3px radius.
- Each card shows the remaining active destination (all active destinations after the first five by admin `sortOrder`):
  - 160px square image
  - destination name 15px SemiBold
  - province · region 12px muted
  - “Explore packages →” 14px Bold blue
- Cards link to `/packages?search=<destination>`.
- If there are no remaining destinations, the section is hidden.
- ≤1099px: 2 columns. ≤767px: header stacks. ≤639px: 1 column.

### 14.5 Routing

- `/destinations` is a `Route` in `App`; the shared Header/Footer wrap both pages.
- Entry points: header **Destinations** link and homepage Destinations **See more** (`Link`).
- `ScrollManager` scrolls to top on route change and resolves `/#why-choose` / `/#contacts` from this page.
- Destination detail URLs remain placeholders until detail designs exist.
- Production hosting must serve `index.html` for `/destinations` (SPA fallback).

### 14.6 Cards link to packages

- Each Popular Destinations card links to `/packages?search=<destination>` through a stretched `::after` on its title link; the heart stays above it and remains independently clickable.
- Cards keep the `-4px` hover/focus lift; the link itself has no visible outline (the card lift is the focus affordance).

---

## 15. Packages page (`/packages`)

File: `src/pages/PackagesPage/PackagesPage.jsx`. Frame `Package Page` (`124:2`), implemented at **1.0 scale** on the 1480px editorial grid (`Container size="page"`). Palette: `--color-package-*` plus the page tokens; Inter for UI, Poppins for the hero/section headings.

### 15.1 Hero + search card (`PackagesHero`)

- Hero **347px**; full-bleed `packages-hero.png` (1920×1080) with `object-fit: cover`.
- Text column max **1010px**, centred, starting at **y=99**; left-aligned.
- Kicker “Pick a package, we'll handle the rest”: Inter Bold **16px**, white.
- Title “TOUR PACKAGES”: Poppins ExtraBold **48px / 64px**, uppercase, white.
- Search card: **1480px** wide (max `100% - 32px`), min-height **200px**, **overlaps the hero by 60px**, border 1.5px `#8cb2f2`, radius 4px, shadow `0 4px 16px rgba(0,0,0,.08)`, padding `14.5px 26.5px 20px`.
  - Header: 14px SemiBold title + 12px muted note; divider `#ebedf2`.
  - Four fields (destination, budget, trip duration, travel type): labels 10px Medium uppercase muted, values 14px; 1px `#e5e8ed` separators.
  - “Find my place”: 150×42px, radius 10px, `#1a66e5`, 14px SemiBold white.
  - Category pills (All places, Beaches, Mountains, City Tours, Adventure): 30px tall, radius 8px; active `#1a66e5` white, idle `#f5f7fa` with `#d9e0eb` border. Pills navigate to `/packages?category=…`; All places clears the category.
  - The search form navigates to `/packages` with `search`, `min`, `max`, `duration` and `category` URL parameters. The listing reads those parameters and filters the Firestore packages.

### 15.2 Listing (`PackagesListing`)

- Section padding 36px top / 74px bottom.
- Inner block max **1218px** centred: filters **(280px) + 30px gap + main column**.
- Header: Poppins Bold **24px** “Popular Packages”, 13px dynamic available-package count; sort select **175×34px**, radius 5px, border `#c6c6c6`, 13px.
- **Filters card:** 280×**629px**, radius 16px, shadow `0 4px 16px rgba(0,0,0,.06)`, padding 24px.
  - “Filters” 18px SemiBold + “Clear all” 13px `#1f40b0`.
  - Group labels 14px SemiBold; checkbox rows 14px `#4d4d4d`, 18px checkboxes with 1.5px `#bfbfbf` border, 4px radius, blue when checked.
  - Budget inputs 40px tall, radius 8px, border `#d9d9d9`, placeholders “₱ Min” / “₱ Max”.
  - “Apply filters” 48px tall, radius 10px, `#1f40b0`, 15px SemiBold.
  - **Functional:** category, duration and budget filters; Clear all; sort by popularity/price/rating; dynamic pagination (6 cards per page).
- **Cards:** 2 columns of **430px**, 28px gaps, max-width 888px.
  - White, radius 16px, shadow `0 6px 20px rgba(0,0,0,.08)`; hover/focus lifts `-4px` with `0 12px 30px rgba(0,0,0,.14)` (disabled under reduced motion).
  - Photo **430×200** with the frame's pastel fill: `#b8dbf0`, `#d9c7f0`, `#f0d1c2`, `#c2e5d1`, `#f0e0b8`, `#c7d6f0`.
  - Duration badge: white, radius 6px, padding 5/10, 12px SemiBold, top/left 14px.
  - Heart: `WishlistButton` with `tone="dark"` (idle `#595959`), top/right 6px.
  - Body min-height 220px, padding `16px 20px 20px`, gap 8px: location 13px `#737373`; title 17px SemiBold `#1a1a1a`; inclusions 13px; rating 13px `#e58c1a`; footer with from/price/per person (12/20/12px) and “View package” (13px SemiBold white on `#1f40b0`, radius 8px).
- **Pagination:** 45×45px squares, radius 5px, 1px `#8a8a8a` border, 27px gaps, 38px top margin; active `#1f40b0` white. Functional, 6 cards per page.

### 15.3 Routing and entry points

- `/packages` is a `Route` in `App`; the shared Header/Footer wrap it.
- Header **Packages** is a `NavLink` and shows `#195cff` when active.
- Entry links: homepage Popular Places **See more**, the Enchanted Kingdom Popular Places card, and every Popular Destinations card on `/destinations`.
- `/packages/:packageId` is a `Route` in `App`; package cards and the three Featured Packages cards link to it.
- Cards use a stretched title link (`::after` overlay), so the whole container is clickable; the heart stays above it.
- Unknown IDs redirect to `/packages`; the detail hero includes a “Back to packages” pill.
- Production hosting must serve `index.html` for SPA routes.

### 15.4 Responsive

- ≤1199px: filters column 250px; search fields tighten.
- ≤1023px: listing becomes one column; filters turn into a 2-column grid above the cards.
- ≤767px: filters single column; sort under the heading; cards one column.
- ≤639px: hero 300px with 34px title; search card overlaps by 40px and its fields stack; Find my place becomes full width.

---

## 20. My Bookings page (`/bookings`)

Frame: **My bookings** (`211:225`), 1920×2000. Implemented at **1.0 scale**; the shared Header/Footer wrap it. Page-local inner column **1480px** (max-width 1512px with 16px padding), starting at x220 on a 1920 canvas.

**Files**
- Page: `src/pages/BookingsPage/BookingsPage.jsx`, `src/pages/BookingsPage/BookingsPage.module.css`.
- Sections: `src/components/sections/bookings/` — `BookingsSummary/`, `BookingsFilters/`, `BookingCard/`, `BookingsNote/`.
- Data: `src/data/bookings.js` (four mock bookings, filter labels, `getBookingStats`).

**Page**
- White background; 48px top padding, 30px bottom.
- **Return** control above the title: left arrow + “Return”, 14px, `rgba(31,36,46,.53)`, hover ink, 22px below. It goes back in browser history, or to `/` when the page was opened directly.
- Title “My Bookings”: Inter Bold 32px, `#1f242e`; subtitle 15px `#737a85`, 8px below.
- Stats grid 4×350px, 20px gaps, 24px below the heading block: 72px high, `#f7f9fa`, 1px `#e5e8ed`, radius 12, 20px horizontal padding. Label 12px medium muted; value 22px bold ink.
- Filters 23px below stats: 34px pills, 18px radius, 18px horizontal padding, 10px gap; active `#1a66e5`/white; inactive `#f7f9fa` with `#e5e8ed` border.
- Cards start 21px below filters, 20px gaps.

**Booking card** — 1480×280, white, 1px `#e5e8ed`, radius 14, `overflow: hidden`.
- Grid `240px minmax(0,1fr) 260px`; photo 240×280 `object-fit: cover`.
- Content padding `18px 20px`:
  - Status badge 100×26, radius 6, 12px SemiBold: Confirmed `#e7f6ee`/`#1f8a57`, Pending `#fff4dd`/`#c47f13`, Completed `#f1f2f4`/`#6f7681`, Cancelled `#ffeaea`/`#c94343`.
  - Reference 12px medium muted, 16px after the badge.
  - Title 18px Bold ink, 10px below; location 13px muted, 4px below.
  - Details grid `250px + 30px gap + 1fr`, 14px below: labels 11px muted; values 13px medium ink; four 22px rows (Check-in, Check-out, Duration, Guests) with an 80px label column.
  - Meeting point / Includes labels 11px, values 13px; 10px between groups; policy note 12px muted 18px below.
- Actions column `padding: 20px 60px 18px 0`; price 22px Bold ink; payment status 13px SemiBold (paid green, deposit amber, refunded muted); method 12px muted; remaining 12px medium muted.
  - Three 200×36px buttons, 8px gaps, radius 8, 13px: View full details (blue), Request change (`#f7f9fa`/border), Cancel booking (white, `#e3a3a3` border, `#c94343` text).
  - Completed and Cancelled cards show only View full details.

**Bottom note** — 1480×70, 30px below the cards: `#f7f9fa`, 1px border, radius 12, 24px padding; 12px muted policy text with a blue mailto link. Use the footer address `pilitravelandtour@gmail.com` (the frame has a typo).

**Interaction**
- Filters are functional: All/Pending/Confirmed/Completed/Cancelled update the list and show an empty state when needed. Summary counts derive from the data: Upcoming 2, Completed 1, Cancelled 1, Total spent ₱39,500 (gross sum, including the refunded booking).
- View full details, Request change and Cancel booking are inert placeholders for now.
- `/bookings` is a `Route`; the profile menu’s **My Bookings** links here. Direct visits show the guest header; arriving from the avatar keeps the mock signed-in header. The page’s **Return** control goes back in history (or to `/` on a direct visit).

**Responsive**
- ≤1199px: stats 2 columns; booking card becomes `220px + 1fr`, with the actions block spanning below the content as a row (price info left, 200px buttons right).
- ≤899px: photo moves above the content (200px tall); details become one column.
- ≤639px: stats one column; card content and actions padding 16px; actions stack; buttons full width; title 26px.

---

## 21. Settings / My Profile (`/settings`)

Frame: **Profile** (`219:279`), 1920×2250. Implemented at **1.0 scale** as the profile menu’s Settings destination. The shared Header/Footer wrap it.

**Files**
- Page: `src/pages/SettingsPage/SettingsPage.jsx`, `src/pages/SettingsPage/SettingsPage.module.css`.
- Sections: `src/components/sections/settings/` — `SettingsSidebar/`, `SettingsPhotoRow/`, `SettingsProfileForm/`, `SettingsSecurity/`, `SettingsActions/`.
- Data: `src/data/profile.js` (Maria Reyes defaults + sidebar nav labels).

**Page shell**
- White background; 48px top padding, 60px bottom; inner column **1480px** (max-width 1512 + 16px padding).
- Breadcrumb “Home / Account / Profile”, Inter 13px `#737a85`; Home links to `/`.
- Title **My Profile** (the frame name) 28px Bold `#1f242e`, 11px below the breadcrumb.
- Content grid 30px below the title: **280px sidebar + 40px gap + 1160px card**.

**Sidebar**
- White card, 1px `#e0e5eb`, radius 16, min-height **620px** at ≥1024px.
- 88px avatar, `#e8efff`, initials 28px Bold `#1a66e5`; name 17px Bold; email 12px muted; Verified pill 100×24, `#e5f5eb`/`#268c59`, 11px SemiBold.
- Nav starts 28px below the identity: 40px rows, 4px gaps, radius 8, 14px ink. Active row `#edf2ff` + blue SemiBold; hover `#f6f7fa`. Travel preferences and Notifications are visible but inert (no sections in this frame).
- Stats below with 24px gap: 130×70 cards, 20px gap, `#f6f7fa`, radius 12; label 11px muted, value 22px Bold. Trips booked derives from `bookings.length` (4); Wishlist is 7.

**Main card**
- White, 1px border, radius 16, **36px padding**.
- **Photo row:** 64px avatar (same treatment), title 14px SemiBold, description 12px, Upload 120×36, Remove text control; 24px bottom border.
- **Sections:** 26px vertical padding, 1px divider; title 18px Bold, description 13px muted, 20px before the field grid.
- **Fields:** 340px + 30px gap + 340px (max-width **710px**); two columns; email and street span both. Labels 12px Medium muted; inputs 46px, 1.5px `#e0e5eb`, radius 10, 14px text; hover darkens border, focus blue border + 3px blue ring.
- **Login & security:** current/new passwords side by side, confirm + hint on the next row; hint 12px muted.
- **Action bar (implementation choice):** bottom of the card, 26px top margin + divider; note “Changes apply to future bookings and confirmations.” left, **Cancel** 110×40 and **Save changes** 150×40 right. The frame layers these near the Login & security heading; they were moved to a proper bottom bar to avoid the overlap.

**Behaviour**
- All profile fields are controlled and editable.
- Save copies draft → saved, updates the sidebar name/initials/email, and shows “Changes saved.”; Cancel restores the last saved draft.
- Upload accepts JPG/PNG up to 5 MB, previews the image in both avatars and shows an inline error for invalid files; Remove clears it. No upload request.
- Sidebar section links smooth-scroll to their section and update the active item; sections use `scroll-margin-top` for the sticky header.
- Password fields are UI-only. Nothing persists across reloads.

**Responsive**
- ≤1023px: sidebar stacks above the card (min-height removed); nav becomes a 2-column grid; card full width.
- ≤1199px: field grids release the 710px cap and fill the card.
- ≤899px: fields become one column; password grid one column; photo row wraps.
- ≤767px: page padding 32px; title 24px; card padding 24px.
- ≤639px: action buttons fill the row; ≤479px card padding 20px, upload/remove share the width.

---

## 22. Admin Console (`/admin`)

Frame: **ADmin Dashboard** (`448:4003`), 1920×1520. Implemented at **1.0 scale** with a separate shell: admin header, 256px sidebar, 1664px content area and slim admin footer. Uses **Plus Jakarta Sans** (loaded alongside the public fonts), not Poppins/Inter.

**Files**
- Page: `src/pages/AdminDashboardPage/AdminDashboardPage.jsx`, `AdminDashboardPage.module.css`.
- Login: `src/pages/AdminLoginPage/AdminLoginPage.jsx`, `AdminLoginPage.module.css`.
- Sections: `src/components/sections/admin/` — `AdminStatCards/`, `AdminBookingChart/`, `AdminPendingActions/`, `AdminRecentReservations/`.
- Shared config: `src/data/adminNav.js`, `src/data/adminDashboard.js`.

**Route and access**
- `/admin/login` — standalone Firebase email/password sign-in, no public Header/Footer. The Pili logo sits inside the 440px card, centered at the top; there is no logo above the card.
- `/admin` — protected by `AdminLayout`; signed-out visits redirect to `/admin/login`.
- The admin account is `admin@gmail.com` and must also have a Firestore `admins/{auth.uid}` document with `role: "admin"`. The password is not stored in the repo.
- The public footer bottom row includes **Admin** and **Operator** links to `/admin/login` and `/operator/login`.
- Public routes render through `SiteLayout`; admin routes never show the public header/footer.

**Shell**
- Header: uses the public top-tier styling — `#fafafa`, 1.6px `--color-header-border` bottom border, 82.4px minimum height (83.4px measured) and `Container size="wide"` (1075.2px max, 24px gutters), so the logo sits at the same x-position as the public header (436.8px at 1920). Sticky. Contains **only** the Pili logo (large) and the **36px blue profile circle** on the right (34px below 768px), matching the public profile button size. No nav, divider, hamburger, second tagline/links tier, sign-up or book-now actions. Clicking the avatar opens a 248px menu with the admin email, “Administrator”, and Log out.
- Sidebar: **256px**, white, right border `#f1f5f9`, sticky at `top: 84px` with `height: calc(100vh - 84px)`. Eyebrow “ADMIN MENU” 11px Bold uppercase `#94a3b8`; rows 40px, 4px gaps, 12px radius, 20px icon + 14px label. Active `#eff6ff` / `#2563eb` SemiBold; inactive `#475569`.
- Content: `#f8fafc`, 40px padding, max-width 1584px.
- Footer: **92px**, white, top border, centered 12px `#94a3b8`: “© 2026 Pili. All rights reserved. Admin Console.”

**Sidebar items**
Dashboard (working) and Destinations (working) are `NavLink`s; User Management, Operators, Tour Packages, Reservations, Schedule Oversight, Cancellations & Refunds, Review Moderation, Reports & Analytics and Access Control are inert placeholders (`aria-disabled`, “coming soon” title).

**Dashboard**
- Breadcrumb “Admin / Dashboard” 12px; title 24px ExtraBold `#0f172a` (-0.6px); subtitle 12px `#64748b`; 32px section gaps.
- Stats: 4 equal cards, 20px gap, 144px tall, radius 16, 24px padding. First card is solid `#0f2c59` with white value and green delta; others are white with 4px colored left borders (green/blue/violet). Label 12px, value 30px ExtraBold, delta 11px.
- Booking overview: 316px card, white, radius 16, 25px padding; title 16px, subtitle 12px; CSS-only 6-column bar chart (May–Oct), light blue bars with the current month in `#2563eb`; 200px chart height.
- Pending actions: 316px card with four rows and 24px count badges (amber; red for reported reviews).
- Recent reservations: full-width white card, radius 16. Header 24px padding with title/subtitle and a 30px outlined **View all** pill. Table columns Booking ID, Traveler, Tour, Date, Amount, Status; 46px header, 57px rows, 10px uppercase headers; status pills green/amber/red. Table scrolls horizontally below 900px.

**Static data**
`src/data/adminDashboard.js` holds the frame values (12,480 / 86 / 214 / 3,964; bars; actions; reservations). No dashboard data is read from Firestore yet.

**Responsive**
- ≤1279px: stats 2 columns; chart and pending actions stack; table scrolls.
- ≤1023px: sidebar becomes a 72px icon rail (labels hidden, tooltips via `title`).
- ≤767px: rail 64px, content padding 24/16px; footer 72px. The header keeps the public top-tier height; the large logo scales down via `Logo` media rules and `Container` supplies 16/24px gutters.

---

## 23. Operator Console (`/operator`)

Frame: **Organizer Dashboard** (`255:720`), 1920×1381. Implemented as the operator counterpart to the admin console: same header, sidebar and footer components, with an operator-specific menu and dashboard.

**Files**
- Page: `src/pages/OperatorDashboardPage/OperatorDashboardPage.jsx`, `OperatorDashboardPage.module.css`.
- Login: `src/pages/OperatorLoginPage/OperatorLoginPage.jsx`, `OperatorLoginPage.module.css`.
- Layout: `src/components/layout/OperatorLayout/`.
- Sections: `src/components/sections/operator/` — `OperatorWelcome/`, `OperatorKpis/`, `OperatorTours/`, `OperatorRecentBookings/`, `OperatorWeekChart/`.
- Data/auth: `src/data/operatorNav.js`, `src/data/operatorDashboard.js`, `src/lib/operatorAuth.js`.

**Route and access**
- `/operator/login` — standalone operator sign-in using the same 440px card as admin, with the logo inside the card.
- `/operator` — protected by `OperatorLayout`; signed-out visits redirect to `/operator/login`.
- Account: `operator@gmail.com` plus a Firestore `operators/{auth.uid}` document with `role: "operator"`. Password is not stored in the repo.
- Public footer has **Admin** and **Operator** links.

**Shell**
- Reuses the admin/public-top-tier header: logo + 36px profile circle only, no nav or second tier; profile role reads “Tour Operator”.
- Sidebar: same admin component (256px, 40px rows, active `#eff6ff` / `#2563eb`) with eyebrow **OPERATOR MENU**. Items: Dashboard, My Tours, Bookings, Tour Operations, Performance. Dashboard (`/operator`) and My Tours (`/operator/tours`) are routes; the rest are inert.
- Content: `#f8fafc`, 40px padding, same max-width as admin.
- Footer: the **admin slim footer**, with copy “© 2026 Pili. All rights reserved. Operator Console.”

**Dashboard**
- Welcome banner: 1580×140, radius 16, navy gradient/overlay; greeting 12px uppercase `#d9e5ff`, title 26px Bold white, summary 14px; **+ Add tour** blue button and **View bookings** white button (inert).
- KPI cards: 4 columns, 16px gap, 120px tall, white with 4px top accents (blue, green, amber, violet): Total Earnings ₱128,450, Reservations 86, Travellers 214, Active Tours 12; labels 10px uppercase, values 30px ExtraBold, green deltas.
- “Your live tours”: heading 18px, subtitle 12px; four 383×220 cards with 130px solid gradient photo blocks, title 14px, seats 12px and status pills (Selling fast, Popular, Open, Almost full).
- Lower grid: Latest bookings (1.59fr) + This week (1fr), 16px gap, 340px cards.
  - Bookings: four rows, traveler / tour / amount / status, 48px rows; Confirmed green, Pending amber. Scrolls horizontally below 900px.
  - Weekly chart: seven CSS bars (Mon–Sun), Saturday highlighted `#2563eb`, caption “Peak day: Saturday · 24 bookings”.
- All dashboard values are static (`operatorDashboard.js`).

**Responsive**
- ≤1279px: KPI and tour cards 2 columns.
- ≤1023px: lower grid stacks; sidebar becomes the admin 72px icon rail.
- ≤767px: rail 64px, content padding 24/16px; the welcome banner stacks its buttons; cards remain 2 columns until 639px, then 1.

---

## 24. Operator My Tours (`/operator/tours`)

Frame: **My Tours — Packages** (`255:847`), 1920×1524. Uses the operator shell (admin-style header/sidebar and slim Operator Console footer). Content column 1584px at 1920.

**Page**
- Breadcrumb `Organizer / Tour Packages` 12px; title **Tour Packages** 24px ExtraBold; subtitle 12px; **+ Add Tour** 150×44 blue link to `/operator/tours/new`.
- Toolbar: search field **420×44** with magnifier; filter pills 36px tall, radius 18 — All packages / Draft / Pending review / Published / Rejected / Hidden / Archived. Search and filters are functional.
- “Your tour packages” heading 16px, then Firestore-backed tour rows with 12px gaps.
- Row: white, 1px border, radius 10; 120px destination/category thumbnail with blue/green/violet/orange/cyan tints; title 15px SemiBold, summary 12px, price 14px Bold blue, booking count 11px; right actions: 96×28 status pill, 90×36 Edit/View Tour blue pill, 100×36 Departures outline link for published tours, 32px ellipsis.
- Edit Tour opens `/operator/tours/:tourId/edit`; pending-review and archived tours open read-only as View Tour.

**Data**
Firestore `tours` where `operatorId == auth.uid`. Statuses are `draft`, `pending_review`, `published`, `rejected`, `hidden` and `archived`. The provider subscribes to live snapshots; reloads preserve data.

**Responsive**
- ≤899px: row body stacks details above actions; actions fill the row.
- ≤639px: header/Add Tour stack full width; search full width; 84px thumbnail; actions wrap with Edit Tour flexible.
- Sidebar uses the shared 72/64px icon rail.

---

## 25. Operator Tour Editor (`/operator/tours/:tourId/edit` and `/operator/tours/new`)

Frame: **My Tours — Package Editor** (`255:960`), 1920×1632. Full editor page inside the operator shell. `/operator/tours/new` reuses the editor for Add Tour.

**Header**
- Breadcrumb `Organizer / Package Editor` (edit) or `Organizer / Add Tour`; title **Edit Tour** or **Add Tour** 24px; subtitle 12px.
- Right status badge 28px: Draft amber, Pending review blue, Published green, Rejected red, Hidden grey, Archived grey.

**Sections** — white cards, radius 10, 1px border, 5px colored left accent, 24px padding:
- **Tour Details** (blue): package name + active-destination dropdown in 2 columns; short description full; trip duration (linked Days/Nights number inputs, nights = days − 1) / active-category dropdown / meeting-point map pin in 3 columns. Inactive destinations/categories are shown disabled and cannot be submitted.
- **Daily Itinerary** (green): one row per day with a 64×28 Day pill, a bordered **Day title** input, an optional **Description** textarea, location status/actions and Remove. Add itinerary day button. **Pin location** opens the MapPicker modal with MapTiler place search, manual map click/marker drag fallback, and saved name/address. Every non-empty itinerary day requires a title and a pin before Submit for Review.
- **Pricing & Capacity** — two side-by-side cards (stack below 1024px):
  - **Base pricing** (blue accent): adult / child / infant prices in the first row; minimum travelers for group rate / group discount (%) / taxes and fees (“Included in displayed price” or “Added at checkout”) in the second.
  - **Available discounts** (green accent): Early bird (10%, on), Group booking (8%, on), Student (5%, off) and Senior/PWD (on) rows with 36×20 accessible switches (`role="switch"`).
- **Tour Photos** (coral): full-width dashed upload area with multi-select, progress, previews and remove controls. JPG/PNG/WebP, max 5 MB each, up to 10 photos. Images are compressed and uploaded to Cloudinary; only URLs are stored in Firestore. An optional `VITE_CLOUDINARY_TOUR_UPLOAD_PRESET` overrides the destination preset.
- Inputs 44px, radius 8, 1px `#e2e8f0`; labels 12px muted.

**Actions and review workflow**
- New/draft/rejected: white **Save Draft**, blue **Submit for Review**, and **Delete Draft** only for saved drafts.
- Published/hidden: blue **Save Changes for Review** only. Saving immediately moves the tour to `pending_review` and hides it publicly until an administrator approves it.
- Pending review and archived: fields are locked; only Back to tours is available.
- Only `draft` tours can be deleted. Rejected tours remain hidden until updated and resubmitted.
- Destination selection requires an active admin destination; Add Tour is blocked when none are active.
- All writes use Firestore with server timestamps and return to `/operator/tours`.

**Responsive**
- ≤1023px: 3-column field grids become 2.
- ≤767px: header stacks; all grids one column; itinerary rows stack; actions/notes full width.
- ≤479px: action buttons stack vertically full width.

---

## 26. Admin Destination Management (`/admin/destinations`)

No dedicated Figma frame. Implemented inside the admin shell using the admin dashboard/table design language.

**Page**
- Breadcrumb `Admin / Destinations`; title **Destinations** 24px ExtraBold; subtitle 12px.
- **+ New destination** 160×44 blue button.
- Toolbar: 360×42 search with magnifier and status pills (All / Active / Inactive).
- Table card: rounded 12, white, 1px border; header 20px/24px padding, columns Destination, Region, Province, Tours, Status, Actions.
- Destination cell: 34px blue-soft initial tile + name 13px SemiBold + “Featured” label.
- Status pills: Active green, Inactive grey.
- Row actions: 32px Edit and Deactivate/Activate buttons.
- Tour counts come from the `tours` collection.

**Create/Edit modal**
- 680px white modal, radius 16, overlay `rgba(15,23,42,.45)`.
- Fields: name, slug (auto-generated, immutable after creation), region (read-only, auto-filled), province (dropdown grouped by region), description, image, sort order, status, featured checkbox.
- **Image upload:** preview + **Upload/Replace image** + Remove; JPG/PNG/WebP, max 5 MB, resized to max 1600px and compressed to WebP/JPEG before an unsigned Cloudinary upload. Progress bar shown during upload. Optional external Image URL fallback.
- Province mapping uses the static PSGC-based `philippineLocations.js` data (17 regions, 83 province-level entries including Metro Manila). Selecting a province fills the region automatically.
- Validation: required name/slug/province, lowercase hyphen slug, unique slug, sort order ≥0.
- No latitude/longitude or map picker; destination coordinates were removed because destinations are catalog categories. Precise coordinates will live on tour meeting points/departures later.
- Save writes to Firestore with server timestamps and `createdBy`; Cancel closes.
- No hard delete: toggling status is the removal path. Inactive destinations remain in admin history.

**Responsive**
- Header and New button stack ≤767px; search full width; table scrolls horizontally with a 900px minimum.
- Modal grids collapse to one column ≤639px; action buttons full width.

---

## 27. Admin Tour Moderation (`/admin/tours`)

No dedicated Figma frame. Implemented inside the admin shell using the admin dashboard/table design language.

**Page**
- Breadcrumb `Admin / Tour Packages`; title **Tour Packages** 24px ExtraBold; subtitle 12px.
- Four summary cards: Pending review, Published, Rejected, Hidden. Clicking a card toggles the matching filter.
- Toolbar: 380×42 search and status pills: All / Pending review / Published / Rejected / Hidden / Archived / Draft.
- Table columns: Tour, Destination, Operator, Submitted, Status, Actions.
- Tour cell: 38px tinted thumbnail + title 13px SemiBold + duration/category 10px muted.
- Status pills: Draft amber, Pending review blue, Published green, Rejected red, Hidden grey, Archived slate.
- **Review** opens the read-only moderation modal.

**Review modal**
- 860px white panel, radius 16, overlay `rgba(15,23,42,.45)`.
- Header: tour title, destination/duration, status badge and close.
- Meta grid: operator, submitted date, category, meeting point.
- Overview: description, adult/child/infant prices, minimum group, group discount.
- Itinerary: day rows with description and pinned location; **View map** opens the public itinerary map modal.
- Discounts and fees chips.
- Previous rejection reason shown when present.
- Actions:
  - Pending review: **Approve** or **Reject**
  - Published: **Hide**
  - Hidden: **Publish** or **Archive**
  - Rejected: **Archive**
- Reject opens a required rejection-reason textarea.
- Admin cannot edit tour content.

**Responsive**
- Summary cards 2 columns ≤1023px, 1 column ≤479px.
- Search full width ≤767px; table scrolls horizontally with a 1000px minimum.
- Review modal stacks meta and footer actions on mobile.

---

## 28. Admin Category Management (`/admin/categories`)

No dedicated Figma frame. Implemented inside the admin shell using the destination-management table language.

**Page**
- Breadcrumb `Admin / Categories`; title **Categories** 24px ExtraBold; subtitle 12px.
- **+ New category** 150×44 blue button.
- Toolbar: 360×42 search and All / Active / Inactive pills.
- Table columns: Category, Slug, Order, Status, Actions.
- Status pills: Active green, Inactive grey.
- Actions: **Edit** and **Deactivate/Activate**.
- No hard delete; deactivation removes the category from operator selection.

**Create/Edit modal**
- 560px panel, radius 16.
- Fields: category name, slug (auto-generated from name, editable), sort order and status.
- Validation: required name/slug, lowercase hyphen slug, unique slug, sort order ≥0.
- Save writes to Firestore with server timestamps.

**Responsive**
- Header/Add button stack ≤767px; search full width; table scrolls horizontally.
- Modal two-column fields collapse to one column ≤639px.

---

## 29. Operator Departures (`/operator/tours/:tourId/departures`)

No dedicated Figma frame. Implemented inside the operator shell using the admin/operator table language.

**Page**
- Breadcrumb `Tour Packages / Departures`; title is the tour name; subtitle 12px.
- Back to tours and **+ Add departure** 44px buttons.
- Four stats: Departures, Upcoming (scheduled/full), Total slots, Booked.
- Table columns: Date, Time, Meeting point, Capacity, Status, Actions.
- Capacity shows `booked / capacity` and a 110×5 progress bar.
- Status pills: Scheduled blue, Full amber, Completed green, Cancelled red.
- Actions: **Edit** for scheduled; **Cancel** for scheduled/full.
- Only published tours can add departures. Non-published tours show a notice.

**Departure form**
- 720px panel, radius 16.
- Sections: Schedule, Capacity, Meeting point.
- Fields: start/end datetime, meeting time, booking cutoff, timezone (fixed `Asia/Manila`), maximum travelers, booked count (read-only), meeting-point map pin.
- Validation: valid dates, end after start, cutoff before start, meeting time, map pin, capacity ≥ booked and ≥1.
- Meeting point reuses the MapPicker with MapTiler search/manual fallback.
- Edit preserves `bookedTravelers` and `lastBookingId`.

**Cancel modal**
- 460px panel with required cancellation reason.
- Sets status `cancelled` and stores `cancellationReason`.

**Responsive**
- Stats 2 columns ≤1023px, 1 column ≤479px.
- Header/actions stack ≤767px; table scrolls horizontally.
- Form grids collapse on mobile; actions stack ≤479px.





