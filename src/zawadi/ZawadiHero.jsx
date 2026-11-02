import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { TORTES, START_INDEX, HERO_TART_SIZES, formatPrice } from './data'
import { blobPath, radiiFor, lerp } from './blob'
import { scrollToId } from './smoothScroll'
import './zawadi.css'

gsap.registerPlugin(SplitText)
gsap.defaults({ overwrite: 'auto' })

const N = TORTES.length
const SWITCH_LOCK_MS = 950
const AUTOPLAY_MS = 7000
const wrapIndex = (i) => ((i % N) + N) % N
const prefersReduced =() => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function CakeMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="zw-logo__mark">
      <path d="M20 4c1.6 2.2 1.6 4-0 5.6C18.4 8 18.4 6.2 20 4Z" fill="currentColor" />
      <rect x="18.8" y="9.5" width="2.4" height="6" rx="1" fill="currentColor" />
      <path
        d="M7 22c0-3.3 5.8-6 13-6s13 2.7 13 6v10c0 2.2-5.8 4-13 4S7 34.2 7 32V22Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <path d="M7 24c3 2.6 6.4 2.6 9 0 2.6 2.6 5.4 2.6 8 0 2.6 2.6 6 2.6 9 0" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  )
}

export default function ZawadiHero({ cart, onAdd, onActiveChange }) {
  const root = useRef(null)
  const mainBlob = useRef(null)
  const softBlob = useRef(null)
  const nameRef = useRef(null)
  const split = useRef(null)
  const blobs = useRef(null)
  const activeRef = useRef(START_INDEX)
  const prevRef = useRef(START_INDEX)
  const lockRef = useRef(false)
  const interacted = useRef(false)
  const hovering = useRef(false)

  const [active, setActive] = useState(START_INDEX)
  const [shown, setShown] = useState(START_INDEX)
  // only the first cake loads up front; the other five wait until the page has
  // finished loading so they don't compete with it (a tapped one loads at once)
  const [warm, setWarm] = useState(false)
  const [seen, setSeen] = useState(() => new Set([START_INDEX]))

  useEffect(() => {
    let idle = 0
    const later = () => {
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(() => setWarm(true), { timeout: 2000 })
        : window.setTimeout(() => setWarm(true), 300)
    }
    if (document.readyState === 'complete') later()
    else window.addEventListener('load', later, { once: true })
    return () => {
      window.removeEventListener('load', later)
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      window.clearTimeout(idle)
    }
  }, [])

  useEffect(() => {
    setSeen((s) => (s.has(active) ? s : new Set(s).add(active)))
  }, [active])

  const t = TORTES[shown]

  useEffect(() => {
    onActiveChange?.(active)
  }, [active, onActiveChange])

  const go = useCallback((next, byUser = true) => {
    if (lockRef.current) return
    const target = wrapIndex(next)
    if (target === activeRef.current) return
    if (byUser) interacted.current = true
    lockRef.current = true
    activeRef.current = target
    setActive(target)
    window.setTimeout(() => {
      lockRef.current = false
    }, SWITCH_LOCK_MS)
  }, [])

  // ---- Blob engine: morphing silhouettes with a constant gentle wobble ----
  useLayoutEffect(() => {
    const make = (el, seed, opts) => ({
      el,
      cur: radiiFor(seed, opts.range),
      range: opts.range,
      radius: opts.radius,
      rot: { v: opts.rotBase + seed * 0.42 },
      rotBase: opts.rotBase,
      amp: opts.amp,
      speed: opts.speed,
    })
    blobs.current = [
      make(mainBlob.current, START_INDEX + 1, { range: { min: 0.8, max: 1 }, radius: 470, rotBase: 0, amp: 0.018, speed: 0.9 }),
      make(softBlob.current, START_INDEX + 7, { range: { min: 0.7, max: 1 }, radius: 460, rotBase: 1.2, amp: 0.025, speed: 0.7 }),
    ]
    const still = prefersReduced()
    const tick = (time) => {
      for (const b of blobs.current) {
        const wobble = still ? null : b.cur.map((_, i) => Math.sin(time * b.speed + i * 1.73) * b.amp)
        b.el.setAttribute('d', blobPath(b.cur, { radius: b.radius, rotate: b.rot.v, wobble }))
      }
    }
    tick(0)
    // only wobble while the hero is on screen
    let on = false
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting === on) return
      on = e.isIntersecting
      if (on) gsap.ticker.add(tick)
      else gsap.ticker.remove(tick)
    })
    io.observe(root.current)
    return () => {
      io.disconnect()
      gsap.ticker.remove(tick)
    }
  }, [])

  const morphBlobs = useCallback((index, duration) => {
    blobs.current.forEach((b, k) => {
      const seed = index + 1 + k * 6
      const from = b.cur.slice()
      const to = radiiFor(seed, b.range)
      const o = { p: 0 }
      gsap.to(o, {
        p: 1,
        duration,
        ease: 'power3.inOut',
        onUpdate: () => {
          for (let i = 0; i < to.length; i++) b.cur[i] = lerp(from[i], to[i], o.p)
        },
      })
      gsap.to(b.rot, { v: b.rotBase + seed * 0.42, duration, ease: 'power3.inOut' })
    })
  }, [])

  // ---- Intro choreography ----
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const first = TORTES[START_INDEX]
      gsap.set(root.current, { '--c1': first.c1, '--c2': first.c2, '--tint': first.tint, '--tint2': first.tint2 })
      gsap.set('.zw-tart', { autoAlpha: 0 })

      split.current = SplitText.create(nameRef.current, { type: 'chars', mask: 'chars' })
      const line1 = SplitText.create('.zw-title__line1 .zw-split', { type: 'chars', mask: 'chars' })

      // start the blobs as small round drops
      blobs.current.forEach((b) => b.cur.fill(0.35))
      const quick = prefersReduced() ? 0.01 : 1
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 * quick })
      tl.timeScale(quick === 1 ? 1 : 100)
      tl.add(() => morphBlobs(START_INDEX, 1.6), 0)
        .from('.zw-blob-wrap--main', { xPercent: -20, duration: 1.8 }, 0)
        .from('.zw-blob-wrap--soft', { xPercent: 20, yPercent: 20, duration: 1.8 }, 0.1)
        .from('.zw-nav > *', { y: -24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.5)
        .from('.zw-eyebrow', { y: 16, autoAlpha: 0, duration: 0.9 }, 0.7)
        .from(line1.chars, { yPercent: 110, duration: 1.1, stagger: 0.04 }, 0.75)
        .fromTo('.zw-o', { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 1.2, ease: 'back.out(1.6)' }, 0.95)
        .from(split.current.chars, { yPercent: 110, duration: 1.1, stagger: 0.035 }, 0.9)
        .from('.zw-desc, .zw-buy', { y: 24, autoAlpha: 0, duration: 1, stagger: 0.1 }, 1.15)
        .fromTo(
          '.zw-thumb',
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.9, stagger: 0.06, ease: 'back.out(1.8)', clearProps: 'transform' },
          1.3,
        )
        .fromTo('.zw-thumbs__bar', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.8)
        .fromTo(
          `.zw-tart[data-i="${START_INDEX}"]`,
          { autoAlpha: 0, rotation: -220, scale: 0.4, xPercent: 30 },
          { autoAlpha: 1, rotation: 0, scale: 1, xPercent: 0, duration: 2 },
          0.6,
        )
        .from('.zw-plate-shadow', { scale: 0.3, autoAlpha: 0, duration: 1.6 }, 0.9)
        .from('.zw-foot > *', { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.08 }, 1.6)
    }, root)
    return () => ctx.revert()
  }, [morphBlobs])

  // ---- Flavour change: colours, blob morph, cake swap, text out ----
  useEffect(() => {
    const prev = prevRef.current
    if (prev === active) return undefined
    prevRef.current = active
    const next = TORTES[active]
    const dir = (active - prev + N) % N <= N / 2 ? 1 : -1
    const q = gsap.utils.selector(root)

    // No cleanup kill: a transition always finishes; overlapping tweens are resolved by overwrite.
    gsap.context(() => {
      gsap.to(root.current, {
        '--c1': next.c1,
        '--c2': next.c2,
        '--tint': next.tint,
        '--tint2': next.tint2,
        duration: 1.1,
        ease: 'power2.inOut',
      })
      morphBlobs(active, 1.15)

      // cake: old one spins away, new one spins in
      gsap.to(q(`.zw-tart[data-i="${prev}"]`), {
        rotation: `+=${150 * dir}`,
        scale: 0.55,
        xPercent: 45 * dir,
        yPercent: 12,
        autoAlpha: 0,
        duration: 0.85,
        ease: 'power3.in',
      })
      gsap.fromTo(
        q(`.zw-tart[data-i="${active}"]`),
        { rotation: -170 * dir, scale: 0.5, xPercent: -35 * dir, yPercent: -8, autoAlpha: 0 },
        { rotation: 0, scale: 1, xPercent: 0, yPercent: 0, autoAlpha: 1, duration: 1.4, ease: 'expo.out', delay: 0.45 },
      )
      gsap.fromTo('.zw-plate-shadow', { scale: 1 }, { scale: 0.6, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' })

      // copy out; the "shown" state swap brings the new copy in
      gsap.to(split.current.chars, { yPercent: -110, duration: 0.4, stagger: 0.02, ease: 'power2.in' })
      gsap.to('.zw-desc, .zw-price', {
        autoAlpha: 0,
        y: -14,
        filter: 'blur(6px)',
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => setShown(active),
      })
    }, root)
    return undefined
  }, [active, morphBlobs])

  // copy in after the text swap
  const lastShown = useRef(START_INDEX)
  useLayoutEffect(() => {
    if (!split.current || lastShown.current === shown) return undefined
    lastShown.current = shown
    split.current.revert()
    split.current = SplitText.create(nameRef.current, { type: 'chars', mask: 'chars' })
    const ctx = gsap.context(() => {
      gsap.from(split.current.chars, { yPercent: 110, duration: 0.9, stagger: 0.035, ease: 'expo.out' })
      gsap.fromTo(
        '.zw-desc, .zw-price',
        { autoAlpha: 0, y: 14, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.06, ease: 'expo.out' },
      )
    }, root)
    return () => ctx.kill()
  }, [shown])

  // active thumbnail indicator (jumps into place on first render, glides afterwards)
  const barPlaced = useRef(false)
  useLayoutEffect(() => {
    const place = (animate) => {
      const btn = root.current.querySelector(`.zw-thumb[data-i="${active}"]`)
      const bar = root.current.querySelector('.zw-thumbs__bar')
      if (!btn || !bar) return
      const vars = { x: btn.offsetLeft + btn.offsetWidth * 0.2, width: btn.offsetWidth * 0.6 }
      if (animate) gsap.to(bar, { ...vars, duration: 0.7, ease: 'expo.out' })
      else gsap.set(bar, vars)
    }
    place(barPlaced.current)
    barPlaced.current = true
    const onResize = () => place(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active])

  // ---- Inputs: wheel, keys, swipe, autoplay, pointer parallax ----
  useEffect(() => {
    const node = root.current
    // vertical wheel scrolls the page; horizontal wheel / trackpad swipe changes flavour
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      if (Math.abs(e.deltaX) < 10) return
      go(activeRef.current + (e.deltaX > 0 ? 1 : -1))
    }
    const onKey = (e) => {
      if (e.target.closest('input, textarea')) return
      if (e.target.closest('dialog') || window.scrollY > window.innerHeight * 0.5) return
      if (e.key === 'ArrowRight') go(activeRef.current + 1)
      if (e.key === 'ArrowLeft') go(activeRef.current - 1)
    }
    let start = null
    const onTouchStart = (e) => {
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = (e) => {
      if (!start) return
      const dx = start.x - e.touches[0].clientX
      const dy = start.y - e.touches[0].clientY
      if (Math.abs(dy) > Math.abs(dx)) {
        start = null // vertical swipe: let the page scroll
        return
      }
      if (Math.abs(dx) > 45) {
        go(activeRef.current + (dx > 0 ? 1 : -1))
        start = null
      }
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    node.addEventListener('touchstart', onTouchStart, { passive: true })
    node.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)

    const auto = prefersReduced()
      ? 0
      : window.setInterval(() => {
          if (!interacted.current && !hovering.current && !document.hidden && window.scrollY < window.innerHeight * 0.5) go(activeRef.current + 1, false)
        }, AUTOPLAY_MS)

    let cleanupParallax = () => {}
    if (!window.matchMedia('(pointer: coarse)').matches && !prefersReduced()) {
      const set = (sel, prop) => gsap.quickTo(node.querySelector(sel), prop, { duration: 1.2, ease: 'power3' })
      const tartX = set('.zw-stage', 'x')
      const tartY = set('.zw-stage', 'y')
      const onMove = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        tartX(nx * 18)
        tartY(ny * 14)
      }
      window.addEventListener('mousemove', onMove)
      cleanupParallax = () => window.removeEventListener('mousemove', onMove)
    }

    return () => {
      node.removeEventListener('wheel', onWheel)
      node.removeEventListener('touchstart', onTouchStart)
      node.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
      window.clearInterval(auto)
      cleanupParallax()
    }
  }, [go])

  // bounce the cart badge whenever something is added (from the hero or the menu)
  const lastCart = useRef(cart)
  useEffect(() => {
    if (cart > lastCart.current) {
      gsap.fromTo(root.current.querySelector('.zw-cart__count'), { scale: 1.8 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    }
    lastCart.current = cart
  }, [cart])

  const addToCart = () => {
    interacted.current = true
    onAdd(`${TORTES[active].name} torte`)
  }

  return (
    <section
      className="zw"
      ref={root}
      aria-roledescription="carousel"
      aria-label="Zawadi tortes"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <div className="zw-blob-wrap zw-blob-wrap--soft" aria-hidden="true">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path ref={softBlob} className="zw-blob zw-blob--soft" />
        </svg>
      </div>
      <div className="zw-blob-wrap zw-blob-wrap--main" aria-hidden="true">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="zw-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--c2)' }} />
              <stop offset="1" style={{ stopColor: 'var(--c1)' }} />
            </linearGradient>
          </defs>
          <path ref={mainBlob} className="zw-blob" fill="url(#zw-grad)" />
        </svg>
      </div>

      <header className="zw-nav">
        <a className="zw-logo" href="/" aria-label="Zawadi Cakes home" onClick={(e) => e.preventDefault()}>
          <CakeMark />
          <span>
            Zawadi <small>Cakes</small>
          </span>
        </a>
        <nav className="zw-links" aria-label="Primary">
          <button type="button" onClick={() => scrollToId('about')}>
            About
          </button>
          <button type="button" onClick={() => scrollToId('menu')}>
            Menu
          </button>
          <button type="button" onClick={() => scrollToId('gallery')}>
            Gallery
          </button>
          <button type="button" onClick={() => scrollToId('delivery')}>
            Delivery
          </button>
          <button type="button" onClick={() => scrollToId('contact')}>
            Contact
          </button>
          <button type="button" className="zw-cart" aria-label={`Cart, ${cart} items`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 4h2.4l2.2 10.2a1.6 1.6 0 0 0 1.6 1.3h7.9a1.6 1.6 0 0 0 1.6-1.2L20.5 8H6.3" />
              <circle cx="9.5" cy="19.5" r="1.4" />
              <circle cx="17" cy="19.5" r="1.4" />
            </svg>
            <span className="zw-cart__count">{cart}</span>
          </button>
        </nav>
      </header>

      <div className="zw-copy">
        <p className="zw-eyebrow">Handmade in Nairobi · Since 2014</p>
        <h1 className="zw-title" aria-label={`${t.name} torte`}>
          <span className="zw-title__line1" aria-hidden="true">
            <span className="zw-split">T</span>
            <span className="zw-o">
              {TORTES.map((x, i) => (
                <img key={x.id} src={x.thumb} alt="" className={i === active ? 'is-on' : ''} />
              ))}
            </span>
            <span className="zw-split">RTE</span>
          </span>
          <span className="zw-title__line2" aria-hidden="true">
            <span ref={nameRef} key={t.id} style={{ fontSize: `${Math.min(1, 7.6 / t.name.length)}em` }}>
              {t.name}
            </span>
          </span>
        </h1>
        <p className="zw-sr" aria-live="polite">
          {TORTES[active].name} torte selected
        </p>
        <p className="zw-desc">{t.desc}</p>
        <div className="zw-buy">
          <p className="zw-price">
            {formatPrice(t.price)} <small>/ 8-inch torte</small>
          </p>
          <button type="button" className="zw-btn" onClick={addToCart}>
            Add to cart
          </button>
        </div>

        <div className="zw-thumbs" role="tablist" aria-label="Choose a flavour" tabIndex={-1}>
          {TORTES.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              data-i={i}
              aria-selected={i === active}
              aria-label={`${x.name} torte`}
              className={`zw-thumb${i === active ? ' is-active' : ''}`}
              onClick={() => go(i)}
            >
              <img src={x.thumb} alt="" width="160" height="160" />
            </button>
          ))}
          <span className="zw-thumbs__bar" aria-hidden="true" />
        </div>
      </div>

      <div className="zw-stage" aria-hidden="true">
        <div className="zw-plate-shadow" />
        <div className="zw-spin">
          {TORTES.map((x, i) => (
            <img
              key={x.id}
              className="zw-tart"
              data-i={i}
              src={warm || seen.has(i) ? x.img : undefined}
              srcSet={warm || seen.has(i) ? x.srcSet : undefined}
              sizes={HERO_TART_SIZES}
              fetchPriority={i === START_INDEX ? 'high' : 'low'}
              decoding={i === START_INDEX ? 'auto' : 'async'}
              alt=""
              width="1024"
              height="1024"
            />
          ))}
        </div>
      </div>


      <footer className="zw-foot">
        <span>© {new Date().getFullYear()} Zawadi Cakes</span>
        <span className="zw-count">
          <b>{String(active + 1).padStart(2, '0')}</b> / {String(N).padStart(2, '0')}
        </span>
      </footer>

      <button type="button" className="zw-scroll" onClick={() => scrollToId('about')}>
        <span>Scroll</span>
        <i aria-hidden="true" />
      </button>
    </section>
  )
}
