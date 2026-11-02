import { useEffect, useRef } from 'react'
import { tortesById } from './data'

// Real-photo particles for a menu card.
// On hover / tap the card gets `is-pop` (CSS zooms the cake up out of the card) and
// pieces of that torte's own toppings spray out from behind it:
//   - "bits": small pieces cut straight out of the tart photo where the fruit sits
//   - "fruit": the flavour's transparent fruit cut-outs, shrunk to crumb size
//   - "sugar": icing-sugar dust

const SPRITE = 72 // px size each sprite is pre-rendered at
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

// cache per flavour so 2 cards with the same torte share the work
const spriteCache = new Map()

function blobPath(ctx, cx, cy, r) {
  // slightly irregular round crumb so pieces don't look like perfect discs
  const n = 9
  ctx.beginPath()
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const rr = r * (0.82 + Math.random() * 0.18)
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

// Find where the fruit sits on the tart (pixels that differ from the cream in the middle)
// and cut round pieces out of those spots.
function cutTartBits(tart) {
  const N = 200
  const a = makeCanvas(N, N)
  const actx = a.getContext('2d', { willReadFrequently: true })
  actx.drawImage(tart, 0, 0, N, N)
  const { data } = actx.getImageData(0, 0, N, N)
  const px = (x, y) => {
    const i = (y * N + x) * 4
    return [data[i], data[i + 1], data[i + 2], data[i + 3]]
  }

  // tart circle from the opaque area
  let minX = N, maxX = 0, minY = N, maxY = 0
  for (let y = 0; y < N; y += 2) {
    for (let x = 0; x < N; x += 2) {
      if (px(x, y)[3] > 200) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const R = Math.max(10, Math.min(maxX - minX, maxY - minY) / 2)

  // average cream colour around the centre
  let cr = 0, cg = 0, cb = 0, cn = 0
  for (let y = -6; y <= 6; y++) {
    for (let x = -6; x <= 6; x++) {
      const [r, g, b] = px(Math.round(cx + x + R * 0.25), Math.round(cy + y))
      cr += r; cg += g; cb += b; cn++
    }
  }
  cr /= cn; cg /= cn; cb /= cn

  const strong = []
  const ring = []
  for (let y = 0; y < N; y += 3) {
    for (let x = 0; x < N; x += 3) {
      const d = Math.hypot(x - cx, y - cy) / R
      if (d > 0.78) continue
      const [r, g, b, al] = px(x, y)
      if (al < 250) continue
      const dist = Math.hypot(r - cr, g - cg, b - cb)
      if (dist > 70) strong.push([x, y])
      if (d > 0.35) ring.push([x, y])
    }
  }
  const spots = strong.length > 40 ? strong : ring

  const scale = tart.naturalWidth / N
  const pieceR = R * 0.09 * scale // radius of a cut piece, in source pixels
  const bits = []
  for (let i = 0; i < 28 && spots.length; i++) {
    const [sx, sy] = spots[Math.floor(Math.random() * spots.length)]
    const c = makeCanvas(SPRITE, SPRITE)
    const ctx = c.getContext('2d')
    blobPath(ctx, SPRITE / 2, SPRITE / 2, SPRITE / 2 - 2)
    ctx.clip()
    const srcR = pieceR * (0.8 + Math.random() * 0.5)
    ctx.drawImage(tart, sx * scale - srcR, sy * scale - srcR, srcR * 2, srcR * 2, 0, 0, SPRITE, SPRITE)
    bits.push(c)
  }
  return bits
}

function fruitSprite(img) {
  const ratio = img.naturalWidth / img.naturalHeight
  const w = ratio >= 1 ? SPRITE : Math.round(SPRITE * ratio)
  const h = ratio >= 1 ? Math.round(SPRITE / ratio) : SPRITE
  const c = makeCanvas(w, h)
  c.getContext('2d').drawImage(img, 0, 0, w, h)
  return c
}

function loadSprites(flavour) {
  if (spriteCache.has(flavour)) return spriteCache.get(flavour)
  const t = tortesById[flavour]
  const p = Promise.allSettled([loadImage(t.img640), loadImage(t.fruitTop), loadImage(t.fruitBottom)]).then(
    ([tart, top, bottom]) => ({
      bits: tart.status === 'fulfilled' ? cutTartBits(tart.value) : [],
      fruit: [top, bottom].filter((r) => r.status === 'fulfilled').map((r) => fruitSprite(r.value)),
    }),
  )
  spriteCache.set(flavour, p)
  return p
}

export function CakeSprinkle({ flavour, cardRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const card = cardRef.current
    if (!canvas || !card) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = canvas.getContext('2d')
    let sprites = { bits: [], fruit: [] }
    let alive = true
    // the photos behind the particles are only fetched when the card gets near
    // the screen (and the browser is idle), or straight away on the first hover/tap
    let requested = false
    let idle = 0
    const want = () => {
      if (requested) return
      requested = true
      io.disconnect()
      loadSprites(flavour).then((s) => {
        if (alive) sprites = s
      })
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        idle = window.requestIdleCallback
          ? window.requestIdleCallback(want, { timeout: 3000 })
          : window.setTimeout(want, 600)
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(card)

    const parts = []
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let active = false
    let last = 0
    let emitAcc = 0

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // cake centre + radius in canvas coordinates (the cake image is a sibling)
    const cakeGeom = () => {
      const img = card.querySelector('.zs-card__media img')
      const cr = canvas.getBoundingClientRect()
      if (!img) return { cx: w / 2, cy: h / 2, r: Math.min(w, h) * 0.25 }
      const ir = img.getBoundingClientRect()
      return {
        cx: ir.left + ir.width / 2 - cr.left,
        cy: ir.top + ir.height / 2 - cr.top,
        r: Math.min(ir.width, ir.height) * 0.42,
      }
    }

    const spawn = (n, strength = 1) => {
      const { cx, cy, r } = cakeGeom()
      for (let i = 0; i < n; i++) {
        const roll = Math.random()
        let kind = 'sugar'
        let sprite = null
        let size = 2 + Math.random() * 2.5
        if (roll < 0.58 && sprites.bits.length) {
          kind = 'img'
          sprite = sprites.bits[Math.floor(Math.random() * sprites.bits.length)]
          size = 12 + Math.random() * 14
        } else if (roll < 0.8 && sprites.fruit.length) {
          kind = 'img'
          sprite = sprites.fruit[Math.floor(Math.random() * sprites.fruit.length)]
          size = 20 + Math.random() * 18
        }
        const a = Math.random() * Math.PI * 2
        const start = r * (0.55 + Math.random() * 0.35)
        const speed = (120 + Math.random() * 230) * strength
        parts.push({
          kind,
          sprite,
          size,
          x: cx + Math.cos(a) * start,
          y: cy + Math.sin(a) * start,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 140 * strength,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 7,
          life: 0,
          ttl: 1.1 + Math.random() * 0.9,
        })
      }
      if (parts.length > 220) parts.splice(0, parts.length - 220)
    }

    const tick = (t) => {
      const dt = Math.min((t - (last || t)) / 1000, 0.05)
      last = t
      if (active) {
        emitAcc += dt * 26
        const n = Math.floor(emitAcc)
        if (n) {
          spawn(n, 0.65)
          emitAcc -= n
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.life += dt
        if (p.life >= p.ttl) {
          parts.splice(i, 1)
          continue
        }
        p.vx *= 1 - 1.4 * dt
        p.vy = p.vy * (1 - 1.4 * dt) + 420 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt
        const k = p.life / p.ttl
        const grow = k < 0.12 ? k / 0.12 : 1
        ctx.save()
        ctx.globalAlpha = k > 0.65 ? 1 - (k - 0.65) / 0.35 : 1
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        if (p.kind === 'img') {
          const s = p.size * grow
          const sw = p.sprite.width
          const sh = p.sprite.height
          const f = s / Math.max(sw, sh)
          ctx.shadowColor = 'rgba(40, 15, 5, 0.35)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetY = 2
          ctx.drawImage(p.sprite, (-sw * f) / 2, (-sh * f) / 2, sw * f, sh * f)
        } else {
          const s = p.size * grow
          ctx.fillStyle = '#fffaf2'
          ctx.fillRect(-s / 2, -s / 2, s, s)
        }
        ctx.restore()
      }
      if (active || parts.length) raf = requestAnimationFrame(tick)
      else {
        raf = 0
        last = 0
      }
    }

    const run = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(tick)
    }
    const pop = () => {
      want()
      card.classList.add('is-pop')
      if (!active && !reduced) spawn(46, 1.1)
      active = true
      run()
    }
    const unpop = () => {
      card.classList.remove('is-pop')
      active = false
    }

    // mouse / pen: pop while the pointer is over the card
    const enter = (e) => {
      if (e.pointerType !== 'touch') pop()
    }
    const leave = (e) => {
      if (e.pointerType !== 'touch') unpop()
    }
    // touch: a tap pops the cake and sprinkles for a moment, then it settles back
    let touchTimer = 0
    const tap = (e) => {
      if (e.pointerType !== 'touch') return
      if (active && !reduced) spawn(30, 1)
      pop()
      clearTimeout(touchTimer)
      touchTimer = setTimeout(unpop, 1400)
    }

    card.addEventListener('pointerenter', enter)
    card.addEventListener('pointerleave', leave)
    card.addEventListener('pointerdown', tap)
    return () => {
      alive = false
      io.disconnect()
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      window.clearTimeout(idle)
      card.removeEventListener('pointerenter', enter)
      card.removeEventListener('pointerleave', leave)
      card.removeEventListener('pointerdown', tap)
      card.classList.remove('is-pop')
      clearTimeout(touchTimer)
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [flavour, cardRef])

  return <canvas ref={canvasRef} className="zs-card__sprinkle" aria-hidden="true" />
}
