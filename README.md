# Zawadi Cakes

A single scrolling landing page for **Zawadi Cakes**, a made-up handmade torte bakery in Nairobi. *Zawadi* is Swahili for "gift".

The hero has six flavours: Strawberry, Chocolate, Mango, Berry, Kiwi and Lemon. When you switch flavour, the colour scheme changes, the blob shapes behind the cake morph, the cake image is swapped and the flavour name animates in letter by letter. Scroll down and the selected cake flies out of the hero into the "Our story" section. The sections below the hero use only colours from the six flavour palettes.

This repository holds documentation only, not the source code:

| File | Contents |
| --- | --- |
| `README.md` | Overview, tech stack and page structure |
| [`PSEUDOCODE.md`](PSEUDOCODE.md) | How each part of the site works, written as pseudo code |
| [`PROMPT.md`](PROMPT.md) | A prompt you can give an AI coding assistant to build a site like this |

## Tech stack

| Layer | Tool | What it does here |
| --- | --- | --- |
| UI | **React 19** (JSX, no TypeScript) | Every part of the page is a component. State is kept in `useState` (no Redux etc.) |
| Build | **Vite 7** + `@vitejs/plugin-react` | Dev server and production build. Vendor code is split into separate `react`, `motion` and `vendor` chunks |
| Animation | **GSAP 3.13**: `SplitText`, `ScrollTrigger` | Hero intro, letter-by-letter flavour name, scroll-scrubbed cake flight, pinned "curtain" reveal, card entrances |
| Smooth scroll | **Lenis 1.3** | Smooth wheel scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync |
| Graphics | Inline **SVG** + **Canvas 2D** + CSS 3D transforms | Morphing blob silhouettes (SVG paths), topping particles on menu cards (canvas), curved gallery reel (3D) |
| Styling | Plain **CSS** with custom properties | No Tailwind. Each flavour sets `--c1`, `--c2`, `--tint` and `--tint2`, which GSAP tweens |
| Fonts | **Poppins** + **Playfair Display**, self-hosted `woff2` | Latin subset; only the weights in use are included, and the hero font is preloaded |
| Images | **WebP**, with 640px copies used via `srcset` | Cake cut-outs, plus Unsplash-licensed photos for Occasions and Sizes |
| Lint | **ESLint 9** (flat config), react-hooks, react-refresh | `npm run lint` |
| Hosting | **Vercel** / Netlify | SPA rewrite to `index.html`; long cache headers on built assets, fonts and images |

### Dependencies

```json
"dependencies": {
  "gsap": "^3.13.0",
  "lenis": "^1.3.4",
  "react": "^19.1.1",
  "react-dom": "^19.1.1"
},
"devDependencies": {
  "@vitejs/plugin-react": "^5.0.4",
  "vite": "^7.1.7",
  "eslint": "^9.36.0",
  "eslint-plugin-react-hooks": "^5.2.0",
  "eslint-plugin-react-refresh": "^0.4.22"
}
```

## Flavour palette

Every section uses only these colours, plus a dark footer (`#1b0f0b`).

| Flavour | c1 (deep) | c2 (bright) | tint | tint2 |
| --- | --- | --- | --- | --- |
| Kiwi | `#6b8f1e` | `#8fb62f` | `#eef5dc` | `#d9eaa9` |
| Lemon | `#c98d0a` | `#e8ab1f` | `#fdf3d8` | `#f9dc8f` |
| Strawberry (start) | `#c21f3a` | `#e23a56` | `#fde6e8` | `#f7b9c1` |
| Chocolate | `#4a2618` | `#6b3a26` | `#f3e7df` | `#dcc0ad` |
| Mango | `#d9760f` | `#f2941f` | `#fdeedb` | `#f9c98a` |
| Berry | `#5a1f66` | `#7c2e8a` | `#efe4f3` | `#d5b5e0` |

## Page structure

| # | Section | Colour | What happens |
| --- | --- | --- | --- |
| 1 | Hero | active flavour | Flavour switcher, morphing blobs, autoplay, add to cart |
| 2 | Our story | mango | Pinned "curtain" reveal under the hero; stats count up |
| — | Cake flight | — | The hero cake flies into the story frame as you scroll |
| 3 | Menu | chocolate | Category tabs; on hover, the card's cake pops up and sprays topping particles |
| 4 | Occasions | strawberry | Story-style card marquee; a card click opens the matching Menu tab |
| 5 | Flavours & ingredients | active flavour's tint | Crust, cream, fruit and where the ingredients come from |
| 6 | Sizes & servings | lemon | 6", 8", 10", 2-tier and 3-tier cards |
| 7 | Gallery | berry | Curved, tilted 3D image reel |
| 8 | Cake of the month | strawberry band | Monthly offer and promo code |
| 9 | Delivery & pickup | kiwi | Zone fees, opening hours, Google Maps embed |
| 10 | Footer | dark + lemon | Instagram strip, newsletter, contact details |

## Suggested project layout

```
src/
  main.jsx              mounts React once the fonts are ready
  App.jsx               single page; any other path is replaced with "/"
  zawadi/
    ZawadiPage.jsx      page layout, cart, toast
    ZawadiHero.jsx      hero, blob engine, flavour switching
    CakeFlight.jsx      scroll-scrubbed hero → story cake flight
    CakeSprinkle.jsx    canvas topping particles for menu cards
    ZawadiSections.jsx  every section below the hero
    data.js             all content and the six flavour palettes
    blob.js             blob path maths
    smoothScroll.js     Lenis + ScrollTrigger setup
  components/ui/        stories carousel, tilted grid reel
public/
  zawadi/               cake, occasion and size images (WebP)
  fonts/                self-hosted woff2
```

## Accessibility and performance

- `prefers-reduced-motion` turns off smooth scrolling, autoplay and the scrubbed effects, and shortens the intro animation.
- Only the first cake image loads up front. The other five load when the browser is idle, or straight away if you pick one.
- The blob wobble and the gallery reel only animate while they are on screen.
- The cart count is saved in `localStorage`. If storage is unavailable, the cart still works for the current visit.

## Image credits

Photos in the Occasions and Sizes sections came from [Unsplash](https://unsplash.com) under the Unsplash License (commercial use allowed, no attribution required).
