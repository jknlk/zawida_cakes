# Prompt to recreate this site

Copy everything inside the box below into an AI coding assistant such as Claude Code. Put your own cake photos in `public/` before you start: transparent or plain-background top-down shots of each cake work best. Change the brand name, city and flavours to match your bakery.

---

```text
Build a single-page landing site for a handmade cake shop called "Zawadi Cakes"
(Nairobi, Kenya; "Zawadi" is Swahili for "gift"). Prices are in KSh.

TECH STACK
- React 19 + Vite 7, plain JSX (no TypeScript), plain CSS with custom properties (no Tailwind).
- GSAP 3 with SplitText and ScrollTrigger for all animation.
- Lenis for smooth scrolling, driven from gsap.ticker and calling ScrollTrigger.update on scroll.
- Self-hosted woff2 fonts: Poppins (400–800) for UI and headings, Playfair Display (and italic) for accents.
  Preload Poppins in index.html and wait for the fonts to load (1s timeout) before mounting React,
  because SplitText measures the characters.
- All images in WebP, each with a 640px copy for srcset. Deploy to Vercel with an SPA rewrite and
  long cache headers for /assets, /fonts and the image folder.
- Put all content in one data.js file: flavours, menu, occasions, sizes, offer, delivery.

FLAVOURS (the palette for the entire site)
Six tortes, each with c1 (deep), c2 (bright), tint (pale background) and tint2 (soft accent):
  Kiwi       #6b8f1e #8fb62f #eef5dc #d9eaa9
  Lemon      #c98d0a #e8ab1f #fdf3d8 #f9dc8f
  Strawberry #c21f3a #e23a56 #fde6e8 #f7b9c1   (start on this one)
  Chocolate  #4a2618 #6b3a26 #f3e7df #dcc0ad
  Mango      #d9760f #f2941f #fdeedb #f9c98a
  Berry      #5a1f66 #7c2e8a #efe4f3 #d5b5e0
Each one has a name, a Swahili name, a one-line description and a price.
RULE: every section below the hero uses only these colours, plus a dark footer (#1b0f0b).

HERO
- Full-screen. The large top-down cake photo spins slowly on the right (left/right split on desktop,
  stacked on mobile). Behind it are two soft SVG "blob" silhouettes (a main one and a lighter one) that
  wobble gently all the time and morph to a new shape when the flavour changes. Only run the wobble
  while the hero is visible.
- Left side: a small wordmark with a cake logo, a two-line headline, the flavour name in large type,
  the description, the price, and "Add to cart" and "Order now" buttons. Show a cart count in the header.
- Flavour switcher: thumbnails of all six cakes, plus prev/next arrows, keyboard arrow keys and swipe.
  Autoplay every 7s, stopping after the first user interaction or while the pointer is over the hero.
  Lock switching for about 950ms so the animations can't overlap.
- On switch: tween the CSS variables (--c1, --c2, --tint, --tint2) to the new flavour, morph the blobs,
  rotate the old cake out and the new cake in, and animate the flavour name out and back in letter by
  letter with SplitText masks.
- Intro: the blobs start as small round drops and expand, the headline characters rise in, and the
  cake fades and scales in. Use expo.out easing.
- Load only the first cake up front and preload the others in requestIdleCallback.

SCROLL STORY
- Curtain: "Our story" sits pinned behind the hero, and the hero slides up off it. Its items rise in
  one after another, tied to scroll so they reverse when scrolling back up. Three stats
  ("2014 baking since", "6 signature flavours", "24h notice") count up from 0 once.
- Cake flight: as the page scrolls from the hero to "Our story", the currently selected cake lifts off
  the hero and flies, scrubbed to scroll, into a round frame in the story section, keeping its current
  rotation, then hands over to the frame's own image. Scrolling back up flies it home.

SECTIONS (in order, each with its own flavour colour)
1. Our story (mango): photo frame, three points (baked the same morning, fruit from Kenyan farms,
   made from scratch), stats.
2. Menu (chocolate): tabs All / Birthday / Wedding / Custom. Cards slide in from the left edge one after
   another, and again whenever the tab changes. On hover or tap the cake zooms up out of the card and a
   canvas sprays small particles cut from that cake's own photo, plus icing-sugar dust.
3. Occasions (strawberry): 7 tall story-style photo cards (birthdays, weddings, anniversaries, baby
   showers, kids' parties, corporate, Eid & Christmas) in an auto-scrolling marquee that starts after
   the cards have slid in. Clicking a card switches the Menu tab and scrolls up to it.
4. Flavours & ingredients (active flavour's tint): crust, cream, fruit and where the ingredients come
   from, for each torte.
5. Sizes & servings (lemon): 6", 8", 10", 2-tier and 3-tier cards with servings, price and a photo.
6. Gallery (berry): a curved, tilted grid reel that mixes event photos with cake cut-outs on their
   flavour tint.
7. Cake of the month (strawberry band): offer title, text, promo code and add-to-cart.
8. Delivery & pickup (kiwi): table of zone fees, pickup address, opening hours and a Google Maps embed.
9. Footer (dark #1b0f0b with lemon accents): Instagram photo strip, newsletter form, links and contact
   details.

DETAILS
- The cart count is stored in localStorage (wrap reads and writes in try/catch), with a toast
  "<name> added to your cart".
- Respect prefers-reduced-motion: no Lenis, a short intro and no scrubbed effects.
- Responsive from 360px phones up to 4K, with no horizontal scroll.
- Use real, warm copy rather than lorem ipsum. Only use photos you have the rights to (your own or
  Unsplash-licensed), never images copied from a Google Images search.
- Split vendor code into react / motion / vendor chunks in vite.config.js.
```
