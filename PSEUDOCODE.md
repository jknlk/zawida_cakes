# Pseudo code

This describes how each part of the Zawadi Cakes page works, without the real source code. Numbers such as durations and distances are the values the site uses, so you can match the feel.

---

## 1. Startup

```
FONTS = Poppins 400, 500, 600, 700, 800

wait for FIRST of:
    all FONTS loaded
    1 second timeout              // a slow connection never blocks the page

mount <App> into #root

App:
    if url path is not "/": replace the url with "/" (keep the #hash)
    render <ZawadiPage>
```

Why: SplitText measures each character, so the display font must be ready before it runs.

---

## 2. Data (data.js)

```
TORTES = list of 6 flavours, each with:
    id, name, swahiliName, description, price
    c1, c2, tint, tint2           // colours
    img, img640, srcSet, thumb    // generated from id

START_INDEX = 2                    // strawberry

ABOUT      = photo, 3 points, 3 stats (2014 / 6 / 24h)
MENU       = cards with category (birthday | wedding | custom), flavour, name, desc, price
OCCASIONS  = 7 cards with title, text, photo, menuCategory, flavour
INGREDIENTS[flavourId] = crust, cream, fruit, origin
SIZES      = label, name, serves [min, max], price, diameter, tiers, photo
OFFER      = month, flavour, title, text, promoCode
DELIVERY   = zones [area, fee], pickup address, map query, opening hours

formatPrice(n) = "KSh " + n with thousands separators
```

---

## 3. Page (ZawadiPage)

```
state cart      = read number from localStorage "zawadi-cart", or 0 if that fails
state active    = START_INDEX      // flavour currently shown in the hero
state menuCat   = "all"
state toast     = none

on mount: startSmoothScroll()

addToCart(name):
    cart = cart + 1
    try save cart to localStorage   // ignore errors
    show toast "<name> added to your cart" for 2.6 seconds

pickOccasion(category):
    menuCat = category
    smooth scroll to #menu

render in order:
    Hero(cart, onAdd = addToCart, onActiveChange = set active)
    About(torte = TORTES[active])
    CakeFlight(torte = TORTES[active])
    Menu(onAdd, menuCat, onCatChange)
    Occasions(onPick = pickOccasion)
    Flavours, Sizes, Gallery, Offer(onAdd), Delivery, Footer
    toast area (aria-live="polite")
```

---

## 4. Smooth scrolling

```
startSmoothScroll():
    if user prefers reduced motion: do nothing
    lenis = new Lenis(lerp 0.085, smoothWheel on)
    on lenis scroll: ScrollTrigger.update()
    every GSAP tick: lenis.raf(time in ms)
    turn off GSAP lag smoothing
    return cleanup that removes the tick

scrollToId(id):
    if the section is pinned as a curtain: target = the end of its pin (where it is fully shown)
    else: target = the section
    lenis.scrollTo(target, 1.6s) if lenis exists, else the browser's smooth scroll
```

---

## 5. Blob shapes (blob.js)

Each flavour has its own fixed blob shape, made from 11 radii around a centre.

```
POINTS = 11

radiiFor(seed, min, max):
    rnd = seeded random generator(seed)      // same seed gives the same shape
    return POINTS values, each min + rnd() * (max - min)

blobPath(radii, centre (500,500), radius, rotate, wobble):
    for each point i:
        angle  = i / POINTS * 360° + rotate
        length = (radii[i] + wobble[i]) * radius
        point  = centre + (cos angle, sin angle) * length
    join the points into a smooth closed curve:
        for each pair of points, a cubic Bézier with control points taken
        from the neighbouring points (Catmull-Rom → Bézier, divided by 6)
    return SVG path string
```

---

## 6. Hero (ZawadiHero)

### 6a. Blob engine

```
two blobs:
    main: radii range 0.8–1.0, radius 470, wobble amplitude 0.018, speed 0.9
    soft: radii range 0.7–1.0, radius 460, wobble amplitude 0.025, speed 0.7, rotated a bit

every frame (only while the hero is visible, using an IntersectionObserver):
    for each blob:
        wobble[i] = sin(time * speed + i * 1.73) * amplitude    // none if reduced motion
        set path "d" = blobPath(current radii, rotation, wobble)

morphBlobs(flavourIndex, duration):
    for each blob k:
        target = radiiFor(flavourIndex + 1 + k * 6)
        tween current radii → target over duration (power3.inOut)
        tween rotation → base + seed * 0.42
```

### 6b. Intro (runs once)

```
set CSS colours to the first flavour
hide every cake image
split the flavour name and headline line 1 into masked characters (SplitText)
set every blob radius to 0.35 (small round drops)

timeline (expo.out; almost instant if reduced motion):
    0.00  morph blobs to the first flavour's shape (1.6s); slide blobs in from the sides
    0.50  nav items drop in, one after another
    0.75  headline characters rise up from their masks
    0.90  flavour name characters rise up
    0.60  first cake spins in from -220°, scale 0.4 → 1 (2s)
    1.15  description and buy buttons fade up
    1.30  thumbnails pop in (back.out)
    1.80  active thumbnail bar fades in
```

### 6c. Switching flavour

```
go(index, byUser = true):
    if locked: ignore
    if byUser: interacted = true             // stops autoplay
    lock for 950 ms
    active = wrap(index) into 0..5
    tell the page: onActiveChange(active)

when active changes from prev to next:
    direction = +1 if forwards around the circle, else -1
    tween CSS --c1, --c2, --tint, --tint2 to next's colours (1.1s)
    morphBlobs(next, 1.15s)
    old cake: rotate +150°·dir, shrink to 0.55, slide out, fade (0.85s, power3.in)
    new cake: from rotate -170°·dir, scale 0.5 → upright, full size (1.4s, expo.out, 0.45s delay)
    plate shadow: shrink to 0.6 and back
    flavour name characters slide up out of their masks
    description and price fade up with blur, then swap the shown text

after the text swap:
    re-split the new flavour name
    characters rise in (stagger 0.035); description and price fade in from blur

active thumbnail bar: glide under the active thumbnail (0.7s), jump into place on resize
```

### 6d. Inputs

```
horizontal wheel or trackpad swipe over the hero (|dx| > |dy| and |dx| ≥ 10): go(active ± 1)
    vertical wheel is left alone so the page scrolls
← / → keys while the hero is in view and focus is not in a text field: go(active ± 1)
touch swipe: if the finger moves more sideways than down and more than 45px: go(active ± 1)
thumbnail click: go(that index)

autoplay every 7 s (not when reduced motion):
    if not interacted, not hovering, tab visible, hero still in view:
        go(active + 1, byUser = false)

mouse parallax (mouse/trackpad devices only): stage follows the pointer up to 18px x 14px

cart badge: when cart increases, pop from scale 1.8 → 1 (elastic)
```

### 6e. Image loading

```
load only the first cake straight away (preloaded in index.html, fetchpriority high)
when the browser is idle (or after 2s): load the other five
a cake the user picks loads at once
```

---

## 7. "Our story" curtain (About)

```
place():
    pull About up with a negative top margin so it sits right underneath the hero
    re-run on every ScrollTrigger refresh

timeline (scrubbed to scroll, scrub 0.6):
    each [data-reveal] item, in reading order, 0.18 apart:
        from y +160 and hidden → to y 0 and visible
    when the stats row arrives: count each stat from 0 to its value once (2s)
    hold 0.3 at the end

ScrollTrigger id "curtain-about":
    trigger About, start "top top", end after the hero's height
    pin About, keep pin spacing           // everything below stays in place
```

Result: the hero slides up like a curtain, uncovering "Our story", which stays still behind it.

---

## 8. Cake flight (CakeFlight)

A separate floating `<img>` of the active cake that travels from the hero stage to the story frame.

```
skip completely if reduced motion

trigger: progress from 0 to 85% of the curtain's end

every frame:
    p = trigger progress (0..1)

    if p == 0:                                    // fully back in the hero
        hide flyer, show the hero stage, hide the frame image
        frame at scale 0.6, hidden
        forget the start angle
        stop

    if starting a flight:
        startAngle = cake's current angle in the hero (CSS spin + GSAP rotation)
        endAngle   = next full turn above startAngle + 360   // at least one extra spin, lands upright

    e = power2.inOut(p)
    frame scale 0.6 → 1, fades in
    hide the hero stage

    if 0 < p < 1:                                  // in flight
        show flyer, hide the frame's own image
        size   = lerp(hero stage width, frame width * 0.86, e)
        centre = lerp(hero stage centre, frame centre, e)
                 + an upward arc: -sin(π·p) * 8% of screen height
        rotate = lerp(startAngle, endAngle, e)
    else (p == 1):                                 // landed
        hide flyer, show the frame's own image
```

Scrolling back up runs the same path in reverse.

---

## 9. Section reveal (shared)

```
useReveal(section):
    for each [data-reveal] element:
        from y +50, hidden → visible (1.1s, expo.out)
        delay = the attribute's value (e.g. 0.08, 0.16)
        trigger once when its top reaches 88% of the screen
```

---

## 10. Menu

```
items = all MENU, or only those in the chosen category

first time the cards scroll in (ScrollTrigger.batch, once):
    each card starts just past the LEFT edge of the screen (x = -(its right edge + 40))
    slide to its slot, 0.22s apart (1.1s, power3.out)

when the tab changes:
    cards fade up from y 30, scale 0.96 (0.7s, stagger 0.06)

tabs use role="tablist" / role="tab" / aria-selected
```

### Menu card topping particles (CakeSprinkle, canvas)

```
load sprites only when the card is near the screen and the browser is idle,
or straight away on the first hover or tap; cache them per flavour

cutTartBits(cake photo):
    draw the photo small (200×200) and read its pixels
    find the cake's circle from the opaque pixels
    average the cream colour near the centre
    spots = pixels inside the cake whose colour is far from the cream   // that's fruit
    cut up to 28 round, slightly irregular pieces from those spots (72px sprites)

on hover / tap:
    card gets "is-pop" (CSS zooms the cake up out of the card)
    emit about 26 particles per second from the cake's rim:
        58% cake pieces (12–26px), 22% fruit (20–38px), rest icing sugar dots (2–4.5px)
        fly outwards and up with a random speed and spin
        life 1.1–2 s, at most 220 alive at once

every frame:
    drag velocity, add gravity (420 px/s²), move, rotate
    fade out near the end of each particle's life
    stop the loop when no particles are left and nothing is hovered
```

---

## 11. Occasions

```
Stories carousel: a row of tall cards that scrolls sideways forever (marquee)
    constant speed in px/s however wide the row is
    pauses while off screen and on hover
    with reduced motion: no marquee, the row becomes a normal sideways-scrolling list

when the row scrolls in (once):
    the cards on screen slide in from the left edge, 0.2s apart
    the marquee starts only after the last card lands

card click: pickOccasion(card.menuCategory)   // opens that Menu tab and scrolls to it
```

---

## 12. Flavours, Sizes, Offer, Delivery, Footer

```
Flavours: one panel per torte showing crust, cream, fruit and origin, coloured with its tint
Sizes:    cards with label, servings "min–max people", price, photo (object-position keeps it centred)
Offer:    strawberry band with month, title, text, promo code, "Add to cart"
Delivery: table of zones and fees, pickup address, opening hours,
          Google Maps iframe: https://www.google.com/maps?q=<pickup>&output=embed (lazy loaded)
Footer:   dark background, Instagram photo strip, newsletter form (no backend yet), links, contact
```

---

## 13. Gallery (tilted grid reel)

```
a band of tiles that travels sideways around the inside of an imaginary cylinder
    perspective camera placed a few cylinder radii away
    each tile is split into thin vertical strips, each turned with
        translateZ(radius) rotateY(angle) translateZ(-radius)
    so the tile looks curved
    tiles wrap round out of sight and pick their next image just before they show
    gentler bend on narrow screens so tiles stay large
    images load only when the reel nears the screen; it stops animating when off screen

tiles alternate: event photos (cover) and cake cut-outs (contain, on their flavour tint)
```

---

## 14. Build and deploy

```
vite.config.js:
    put react, react-dom and scheduler in a "react" chunk
    put gsap and lenis in a "motion" chunk
    put every other library in a "vendor" chunk

index.html:
    preload Poppins woff2 files and the first cake image (srcset, fetchpriority high)
    @font-face rules inline, font-display: swap
    title, description, theme-color, Open Graph tags

vercel.json:
    rewrite every non-asset path to /index.html
    /assets and /fonts: Cache-Control 1 year, immutable
    images: Cache-Control 30 days
```
