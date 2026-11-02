import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ABOUT,
  DELIVERY,
  GALLERY,
  INGREDIENTS,
  MENU,
  MENU_CATEGORIES,
  OCCASIONS,
  OFFER,
  SIZES,
  TORTES,
  formatPrice,
  tortesById,
} from './data'
import { TiltedGridHero } from '../components/ui/tilted-grid-hero'
import {
  Stories,
  Story,
  StoryAuthor,
  StoryAuthorImage,
  StoryAuthorName,
  StoryImage,
  StoryOverlay,
  StoryTitle,
} from '../components/ui/stories-carousel'
import { CakeSprinkle } from './CakeSprinkle'
import './sections.css'
import './sections-more.css'

gsap.registerPlugin(ScrollTrigger)

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Reveal every [data-reveal] child of a section as it scrolls into view.
function useReveal(ref) {
  useLayoutEffect(() => {
    if (prefersReduced()) return undefined
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 50,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'expo.out',
          delay: Number(el.dataset.reveal) || 0,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [ref])
}

function SectionHead({ eyebrow, title, children }) {
  return (
    <header className="zs-head">
      <p className="zs-eyebrow" data-reveal>
        {eyebrow}
      </p>
      <h2 className="zs-title" data-reveal="0.08">
        {title}
      </h2>
      {children && (
        <p className="zs-lede" data-reveal="0.16">
          {children}
        </p>
      )}
    </header>
  )
}

// Curtain: "Our story" sits still behind the hero, and the hero slides up off it.
// The section is pulled up under the hero, then pinned for the hero's height;
// the pin's spacing gives that height back, so everything below stays put.
function useCurtain(ref) {
  useLayoutEffect(() => {
    if (prefersReduced()) return undefined
    const about = ref.current
    const hero = document.querySelector('.zw')
    if (!about || !hero) return undefined

    // how far the hero covers: from its top to where About would normally start
    const place = () => {
      about.style.marginTop = ''
      const overlap = about.getBoundingClientRect().top - hero.getBoundingClientRect().top
      about.style.marginTop = `${-overlap}px`
    }
    place()
    ScrollTrigger.addEventListener('refreshInit', place)

    // while the hero uncovers it, each item rises into place in reading order,
    // tied to the scroll so it plays forwards and backwards with the page
    const items = gsap.utils.toArray(about.querySelectorAll('[data-reveal]'))
    const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 1 } })
    items.forEach((el, i) => {
      tl.fromTo(el, { y: 160, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, i * 0.18)
    })
    tl.to({}, { duration: 0.3 }) // settle before the pin lets go

    // the stats count up from 0 once, as their row rises into view
    const nums = gsap.utils.toArray(about.querySelectorAll('.zs-count__num'))
    nums.forEach((el) => (el.textContent = '0'))
    let counted = false
    const countUp = () => {
      if (counted) return
      counted = true
      nums.forEach((el) => {
        const v = { n: 0 }
        gsap.to(v, {
          n: Number(el.dataset.to),
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => (el.textContent = Math.round(v.n)),
        })
      })
    }
    const statsAt = items.indexOf(about.querySelector('.zs-stats'))
    if (statsAt >= 0) tl.call(countUp, null, statsAt * 0.18 + 0.4)

    const st = ScrollTrigger.create({
      id: 'curtain-about',
      animation: tl,
      scrub: 0.6,
      trigger: about,
      start: 'top top',
      end: () => `+=${hero.offsetHeight}`,
      pin: true,
      pinSpacing: true,
      refreshPriority: 1,
    })
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', place)
      st.kill()
      tl.kill()
      gsap.set(items, { clearProps: 'transform,opacity,visibility' })
      gsap.killTweensOf(nums)
      nums.forEach((el) => (el.textContent = el.dataset.to))
      about.style.marginTop = ''
    }
  }, [ref])
}

export function About({ torte }) {
  const ref = useRef(null)
  // the curtain also plays this section's reveal, so no useReveal here
  useCurtain(ref)
  return (
    <section className="zs zs-about" id="about" ref={ref} aria-labelledby="about-title">
      <div className="zs-about__media">
        <div className="zs-about__frame">
          <img
            src={torte ? torte.img : ABOUT.photo}
            srcSet={torte ? torte.srcSet : undefined}
            sizes="(max-width: 899px) min(74vw, 380px), 40vw"
            alt={torte ? `A Zawadi ${torte.name.toLowerCase()} torte fresh from the kitchen` : ABOUT.photoAlt}
            width="1024"
            height="1024"
          />
        </div>
        <p className="zs-about__badge" data-reveal="0.2">
          <b>Zawadi</b> means <i>gift</i> in Swahili
        </p>
      </div>

      <div className="zs-about__copy">
        <SectionHead eyebrow="Our story" title={<span id="about-title">A gift from our kitchen to your table</span>}>
          Zawadi began in 2014 with one oven in a Nairobi flat and a simple idea: a cake should taste as good as it looks.
          Today our small team of bakers still makes every torte by hand, in small batches, for the people you love.
        </SectionHead>

        <ul className="zs-points">
          {ABOUT.points.map((p, i) => (
            <li key={p.title} data-reveal={0.1 * i}>
              <span className="zs-points__num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="zs-stats" data-reveal="0.1">
          {ABOUT.stats.map((s) => {
            const [, num, suffix] = s.value.match(/^(\d+)(.*)$/)
            return (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd aria-label={s.value}>
                  {/* the hidden final number holds the width while the visible one counts */}
                  <span className="zs-count" aria-hidden="true">
                    <span className="zs-count__ghost">{num}</span>
                    <span className="zs-count__num" data-to={num}>
                      {num}
                    </span>
                  </span>
                  {suffix && <span aria-hidden="true">{suffix}</span>}
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

export function Menu({ onAdd, cat: catProp, onCatChange }) {
  const ref = useRef(null)
  const gridRef = useRef(null)
  const [ownCat, setOwnCat] = useState('all')
  // controlled by the page when Occasions can jump to a tab, otherwise local
  const cat = catProp ?? ownCat
  const setCat = onCatChange ?? setOwnCat
  const first = useRef(true)
  useReveal(ref)

  const items = cat === 'all' ? MENU : MENU.filter((m) => m.cat === cat)

  // first time each row scrolls in, its cards slide in from the left edge of
  // the screen one after another and come to rest in their own slots
  useLayoutEffect(() => {
    if (prefersReduced()) return undefined
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(gridRef.current.children)
      // start each card just past the left edge of the viewport, so cards
      // further right travel further and the row fills in left to right
      const offLeft = (_, el) => -(el.getBoundingClientRect().right + 40)
      // the card's own CSS transform transition would drag behind GSAP
      gsap.set(cards, { x: offLeft, autoAlpha: 0, transition: 'none' })
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            x: 0,
            autoAlpha: 1,
            duration: 1.1,
            ease: 'power3.out',
            stagger: 0.22,
            overwrite: true,
            onComplete: () => gsap.set(batch, { clearProps: 'transform,transition' }),
          }),
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  // re-animate the cards whenever the category changes
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return undefined
    }
    if (prefersReduced()) return undefined
    const tween = gsap.fromTo(
      gridRef.current.children,
      { y: 30, autoAlpha: 0, scale: 0.96 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, stagger: 0.06, ease: 'expo.out' },
    )
    return () => tween.kill()
  }, [cat])

  return (
    <section className="zs zs-menu" id="menu" ref={ref} aria-labelledby="menu-title">
      <SectionHead eyebrow="The menu" title={<span id="menu-title">Cakes for every occasion</span>}>
        Every cake is baked to order. Choose a category, or ask us for something entirely your own.
      </SectionHead>

      <div className="zs-tabs" role="tablist" aria-label="Cake categories" data-reveal="0.2">
        {MENU_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            className={cat === c.id ? 'is-active' : ''}
            onClick={() => setCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="zs-cards" ref={gridRef}>
        {items.map((m) => (
          <MenuCard key={m.id} m={m} onAdd={onAdd} />
        ))}
      </ul>
    </section>
  )
}

function MenuCard({ m, onAdd }) {
  const cardRef = useRef(null)
  const t = tortesById[m.flavour]
  return (
    <li
      ref={cardRef}
      className="zs-card"
      style={{ '--c1': t.c1, '--c2': t.c2, '--tint': t.tint, '--tint2': t.tint2 }}
    >
      <div className="zs-card__media">
        {/* bits of this torte's toppings spray out from behind the cake on hover / tap */}
        <CakeSprinkle flavour={m.flavour} cardRef={cardRef} />
        <img
          src={t.img640}
          alt={`${m.name}, a ${t.name.toLowerCase()} torte`}
          width="640"
          height="640"
          loading="lazy"
          decoding="async"
        />
        <span className="zs-card__tag">{MENU_CATEGORIES.find((c) => c.id === m.cat).label}</span>
      </div>
      <div className="zs-card__body">
        <h3>{m.name}</h3>
        <p>{m.desc}</p>
        <div className="zs-card__foot">
          <span className="zs-card__price">
            {m.from && <small>from </small>}
            {formatPrice(m.price)}
          </span>
          <button type="button" className="zs-card__add" onClick={() => onAdd(m.name)} aria-label={`Add ${m.name} to cart`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  )
}

// Built once: photos fill their tile, cut-out tortes sit whole on their flavour tint.
const GALLERY_REEL = GALLERY.map((g) => {
  if (g.kind === 'photo') return { src: g.src, alt: g.alt }
  const t = tortesById[g.flavour]
  return { src: t.img640, alt: `A Zawadi ${t.name.toLowerCase()} torte`, bg: t.tint2, fit: 'contain' }
})

// Narrow screens get a gentler bend so the reel's tiles can stay large.
function useNarrow(query = '(max-width: 699px)') {
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches)
  useLayoutEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return narrow
}

export function Gallery() {
  const ref = useRef(null)
  const narrow = useNarrow()
  useReveal(ref)

  return (
    <section className="zs zs-gallery" id="gallery" ref={ref} aria-labelledby="gallery-title">
      <TiltedGridHero
        images={GALLERY_REEL}
        className="zs-reel"
        speed={4}
        tileHeight={narrow ? 42 : 46}
        aspectRatio={4 / 3}
        axis={narrow ? 76 : 67}
        curve={narrow ? 32 : 60}
        fade={0}
        radius={18}
        tileBg="#d5b5e0"
      >
        <div className="zs-reel__head">
          <SectionHead eyebrow="Gallery" title={<span id="gallery-title">Fresh from the oven</span>}>
            A few of the tortes we have baked for birthdays, weddings and quiet Sunday afternoons.
          </SectionHead>
        </div>
      </TiltedGridHero>
    </section>
  )
}

const tortePalette = (t) => ({ '--c1': t.c1, '--c2': t.c2, '--tint': t.tint, '--tint2': t.tint2 })

// ---------- Occasions: strawberry ----------
export function Occasions({ onPick }) {
  const ref = useRef(null)
  useReveal(ref)

  // when the row scrolls in, the cards on screen slide in from the left edge
  // one after another (0.2s apart) and land in their places; the marquee
  // waits until the last one has landed, then starts streaming
  useLayoutEffect(() => {
    if (prefersReduced()) return undefined
    const row = ref.current.querySelector('.zs-occ')
    if (!row) return undefined
    row.classList.add('is-entering')
    const ctx = gsap.context(() => {
      const vw = window.innerWidth
      const cards = gsap.utils
        .toArray(row.querySelectorAll('.story'))
        .filter((el) => el.getBoundingClientRect().left < vw)
      const offLeft = (_, el) => -(el.getBoundingClientRect().right + 40)
      gsap.set(cards, { x: offLeft, autoAlpha: 0 })
      ScrollTrigger.create({
        trigger: row,
        start: 'top 85%',
        once: true,
        onEnter: () =>
          gsap.to(cards, {
            x: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.2,
            onComplete: () => {
              gsap.set(cards, { clearProps: 'transform,opacity,visibility' })
              row.classList.remove('is-entering')
            },
          }),
      })
    }, ref)
    return () => {
      ctx.revert()
      row.classList.remove('is-entering')
    }
  }, [])

  return (
    <section className="zs zs-occasions" id="occasions" ref={ref} aria-labelledby="occasions-title">
      <SectionHead eyebrow="Occasions" title={<span id="occasions-title">What are we celebrating?</span>}>
        Pick the moment and we will show you the cakes that suit it best.
      </SectionHead>

      <div>
        <Stories className="zs-occ" label="Occasions" speed={45}>
          {OCCASIONS.map((o) => {
            const t = tortesById[o.flavour]
            return (
              <Story
                key={o.id}
                style={tortePalette(t)}
                onClick={() => onPick(o.cat)}
                aria-label={`${o.title}: see cakes`}
              >
                <StoryImage
                  src={o.img}
                  srcSet={o.srcSet}
                  sizes="(max-width: 640px) 210px, clamp(220px, 21vw, 280px)"
                  alt={o.alt}
                  width="900"
                  height="1125"
                  loading="lazy"
                  decoding="async"
                />
                <StoryOverlay side="top" />
                <StoryOverlay />
                <StoryTitle>
                  <span className="zs-occ__go">
                    See cakes
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </StoryTitle>
                <StoryAuthor>
                  <span className="zs-occ__who">
                    <StoryAuthorImage src={t.thumb} name={t.name} />
                    <StoryAuthorName>{t.name} torte</StoryAuthorName>
                  </span>
                  <b>{o.title}</b>
                  <small>{o.text}</small>
                </StoryAuthor>
              </Story>
            )
          })}
        </Stories>
      </div>
    </section>
  )
}

// ---------- Flavours & ingredients: takes the active torte's colours ----------
export function Flavours() {
  const ref = useRef(null)
  const [id, setId] = useState('mango')
  useReveal(ref)
  const t = tortesById[id]
  const ing = INGREDIENTS[id]

  return (
    <section className="zs zs-flavours" id="flavours" ref={ref} style={tortePalette(t)} aria-labelledby="flavours-title">
      <SectionHead eyebrow="Flavours & ingredients" title={<span id="flavours-title">Six tortes, one rule: real fruit</span>}>
        Tap a flavour to see what goes into it and where the fruit comes from.
      </SectionHead>

      <div className="zs-flav__picker" role="tablist" aria-label="Flavours" data-reveal="0.2">
        {TORTES.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={x.id === id}
            aria-controls="flav-panel"
            className={x.id === id ? 'is-active' : ''}
            style={tortePalette(x)}
            onClick={() => setId(x.id)}
          >
            <img src={x.thumb} alt="" width="64" height="64" />
            {x.name}
          </button>
        ))}
      </div>

      <div className="zs-flav__panel" id="flav-panel" role="tabpanel" aria-live="polite" key={id}>
        <div className="zs-flav__media">
          <img
            className="zs-flav__torte"
            src={t.img}
            srcSet={t.srcSet}
            sizes="(max-width: 899px) 80vw, 40vw"
            alt={`${t.name} torte`}
            width="1024"
            height="1024"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="zs-flav__info">
          <p className="zs-flav__sw">{t.sw}</p>
          <h3>{t.name} torte</h3>
          <p className="zs-flav__desc">{t.desc}</p>
          <dl className="zs-flav__list">
            <div>
              <dt>Crust</dt>
              <dd>{ing.crust}</dd>
            </div>
            <div>
              <dt>Cream</dt>
              <dd>{ing.cream}</dd>
            </div>
            <div>
              <dt>Fruit</dt>
              <dd>{ing.fruit}</dd>
            </div>
            <div>
              <dt>Sourced</dt>
              <dd>{ing.origin}</dd>
            </div>
          </dl>
          <p className="zs-flav__price">8" from {formatPrice(t.price)}</p>
        </div>
      </div>
    </section>
  )
}

// ---------- Sizes & servings: lemon ----------

export function Sizes() {
  const ref = useRef(null)
  const [guests, setGuests] = useState(14)
  useReveal(ref)
  const pick = SIZES.find((s) => guests <= s.serves[1]) ?? SIZES[SIZES.length - 1]

  return (
    <section className="zs zs-sizes" id="sizes" ref={ref} aria-labelledby="sizes-title">
      <SectionHead eyebrow="Sizes & servings" title={<span id="sizes-title">How much cake do you need?</span>}>
        Slide to your guest count and we will suggest a size. Servings are generous party slices.
      </SectionHead>

      <div className="zs-size__slider" data-reveal="0.2">
        <label htmlFor="guests">
          Guests <output htmlFor="guests">{guests}</output>
        </label>
        <input id="guests" type="range" min="4" max="80" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
      </div>

      <ul className="zs-size__list">
        {SIZES.map((s, i) => {
          const on = s.id === pick.id
          return (
            <li key={s.id} className={on ? 'is-active' : ''} data-reveal={i * 0.06} aria-current={on ? 'true' : undefined}>
              <figure className="zs-size__photo">
                <img src={s.img} alt={s.alt} loading="lazy" width="720" height="720" style={{ objectPosition: s.pos }} />
              </figure>
              <b>{s.label}</b>
              <span>{s.name}</span>
              <small>
                Serves {s.serves[0]} to {s.serves[1]}
              </small>
              <em>from {formatPrice(s.price)}</em>
              {on && <i className="zs-size__pick">Our pick</i>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ---------- Cake of the month: strawberry band ----------
export function Offer({ onAdd }) {
  const ref = useRef(null)
  useReveal(ref)
  const t = tortesById[OFFER.flavour]
  return (
    <section className="zs zs-offer" ref={ref} style={tortePalette(t)} aria-labelledby="offer-title">
      <div className="zs-offer__copy">
        <p className="zs-eyebrow" data-reveal>
          Cake of the month · {OFFER.month}
        </p>
        <h2 id="offer-title" data-reveal="0.08">
          {OFFER.title}
        </h2>
        <p data-reveal="0.16">{OFFER.text}</p>
        <div className="zs-offer__row" data-reveal="0.24">
          <button type="button" className="zs-offer__btn" onClick={() => onAdd(`${t.name} torte`)}>
            Order now
          </button>
          <span className="zs-offer__code">
            Code <b>{OFFER.code}</b>
          </span>
        </div>
      </div>
      <img
        className="zs-offer__img"
        src={t.img640}
        srcSet={t.srcSet}
        sizes="(max-width: 899px) 280px, 440px"
        alt={`${t.name} torte`}
        width="1024"
        height="1024"
        loading="lazy"
        decoding="async"
      />
    </section>
  )
}

// ---------- Delivery & pickup: kiwi ----------
export function Delivery() {
  const ref = useRef(null)
  useReveal(ref)
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(DELIVERY.mapQuery)}&output=embed`
  return (
    <section className="zs zs-delivery" id="delivery" ref={ref} aria-labelledby="delivery-title">
      <SectionHead eyebrow="Delivery & pickup" title={<span id="delivery-title">From our kitchen to your door</span>}>
        We deliver across Nairobi in chilled boxes, or you can collect from the kitchen.
      </SectionHead>

      <div className="zs-del">
        <div className="zs-del__zones" data-reveal="0.1">
          <h3>Delivery zones</h3>
          <table>
            <thead>
              <tr>
                <th scope="col">Area</th>
                <th scope="col">Fee</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY.zones.map((z) => (
                <tr key={z.area}>
                  <td>{z.area}</td>
                  <td>{formatPrice(z.fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="zs-del__note">{DELIVERY.beyond}</p>

          <h3>Pickup hours</h3>
          <dl className="zs-del__hours">
            {DELIVERY.hours.map((h) => (
              <div key={h.days}>
                <dt>{h.days}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="zs-del__map" data-reveal="0.2">
          <iframe title={`Map: ${DELIVERY.pickup}`} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <p>
            <b>Pickup:</b> {DELIVERY.pickup}
          </p>
        </div>
      </div>
    </section>
  )
}

function Newsletter() {
  const [sent, setSent] = useState(false)
  return (
    <form
      className="zs-news"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <h3>Get first dibs on seasonal cakes</h3>
      {sent ? (
        <p role="status">Asante! You are on the list.</p>
      ) : (
        <div className="zs-news__row">
          <label className="zs-sr" htmlFor="news-email">
            Email address
          </label>
          <input id="news-email" type="email" required placeholder="you@example.com" autoComplete="email" />
          <button type="submit">Subscribe</button>
        </div>
      )}
    </form>
  )
}

export function Footer() {
  return (
    <footer className="zs-footer" id="contact">
      <div className="zs-footer__cta">
        <h2>Planning a celebration?</h2>
        <p>Order at least 24 hours ahead. Weddings and custom designs need about two weeks.</p>
        <a className="zs-footer__btn" href="tel:+254700000000">
          Call to order
        </a>
      </div>
      <div className="zs-footer__cols">
        <div>
          <h3>Visit</h3>
          <p>Ngong Road, Nairobi</p>
          <p>Open Tuesday to Sunday</p>
        </div>
        <div>
          <h3>Contact</h3>
          <p>
            <a href="tel:+254700000000">+254 700 000 000</a>
          </p>
          <p>
            <a href="mailto:hello@zawadicakes.co.ke">hello@zawadicakes.co.ke</a>
          </p>
        </div>
        <Newsletter />
      </div>
      <p className="zs-footer__legal">© {new Date().getFullYear()} Zawadi Cakes · Handmade in Nairobi</p>
    </footer>
  )
}
