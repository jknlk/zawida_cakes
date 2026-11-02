import * as React from 'react'

/* ── the curved row ──────────────────────────────────────────────
 * Ported from the shadcn "tilted-grid-hero" (TSX + Tailwind) to plain
 * JSX with inline styles, because this project has no Tailwind/TS.
 *
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you and fade.
 * Every tile is cut into SLICES vertical strips, each a flat facet of the
 * cylinder; the tile (preserve-3d) is what moves, with one rotateY about
 * the cylinder's axis. The only JS is a ResizeObserver that sizes the
 * loop, and a handler that hands a tile its next image each time it
 * wraps, out of sight.
 * ─────────────────────────────────────────────────────────────── */

// Strips per tile. Fewer starts to show corners along the edges.
const SLICES = 16

// Camera distance from the screen, as a multiple of the cylinder's radius.
const CAMERA = 1.6

// Cylinder radius, as a share of the hero's width, that puts the frame's
// edge `bend` radians round the arc as seen through the camera.
function arc(bend) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend))
}

// A tile is never wider than this share of the hero.
const MAX_WIDTH = 55

// How far round the cylinder (degrees) any part of a tile may travel. Past
// ~120° the far edge swings behind the camera and the browser draws that facet
// hugely magnified for a frame, which shows up as a flash at the ends of the row.
const SAFE_TURN = 108

// Largest tile height, as a share of the hero's width, that keeps a tile's far
// edge inside SAFE_TURN even at its outermost visible position.
function maxTileShare(bend, aspect) {
  const room = (SAFE_TURN * Math.PI) / 180 - bend
  return Math.max(0.02, (arc(bend) * room) / (2 * aspect))
}

function measure(width, height, tile, aspect, gap, bend) {
  const h = Math.min((tile / 100) * height, ((MAX_WIDTH / 100) * width) / aspect, width * maxTileShare(bend, aspect))
  const radius = width * arc(bend)
  if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 }
  const deg = (rad) => (rad * 180) / Math.PI
  const unit = deg(h / radius)
  const pitch = (aspect + gap / 100) * unit
  const limit = deg(bend) + (aspect * unit) / 2
  // Capped so a hero squeezed to a sliver can't mount thousands of tiles.
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)))
  const round = (n) => +n.toFixed(4)
  const sweep = round((columns * pitch) / 2)
  return { columns, sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) }
}

/**
 * @param {object} props
 * @param {{src: string, alt?: string, bg?: string}[]} props.images  `bg` fills behind cut-out images
 * @param {number} [props.speed=4]        seconds for the row to advance one tile
 * @param {number} [props.tileHeight=26]  tile height, % of the hero's height
 * @param {number} [props.aspectRatio=16/9]
 * @param {number} [props.gap=6]          space between tiles, % of tile height
 * @param {number} [props.axis=56]        vertical centre of the row, % of height
 * @param {number} [props.curve=80]       bend at the frame edge, degrees (5–85)
 * @param {number} [props.fade=12]        fade width at each end, % of width
 * @param {number} [props.radius=8]       tile corner radius, px
 * @param {string} [props.tileBg]         default background behind images
 */
export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  radius: corner = 8,
  tileBg = 'rgba(0,0,0,0.06)',
  children,
  className,
  style,
  ...props
}) {
  const ref = React.useRef(null)
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '')
  const orbit = `tgh-o-${id}`
  const tile = `tgh-t-${id}`
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180

  // Null until the observer has measured the hero; the band stays hidden till then.
  const [layout, setLayout] = React.useState(null)
  // The image each tile shows; only changes when the tile wraps, out of sight.
  const [shown, setShown] = React.useState({})

  React.useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend)
      setLayout((prev) =>
        prev?.columns === next.columns && prev.sweep === next.sweep && prev.unit === next.unit ? prev : next,
      )
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [tileHeight, aspectRatio, gap, bend])

  // The reel is far down the page: it only fetches its images once it gets
  // close to the screen, and its tiles stop spinning while it is out of view
  // (16 3D facets per tile are costly to keep animating for nobody).
  const [near, setNear] = React.useState(false)
  const [woke, setWoke] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        setNear(entry.isIntersecting)
        if (entry.isIntersecting) setWoke(true)
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Once awake, fetch every image; a tile picks its next one just before it shows.
  React.useEffect(() => {
    if (!woke) return
    for (const { src } of images) new Image().src = src
  }, [images, woke])

  const { columns, sweep, unit, limit } = layout ?? measure(1200, 560, tileHeight, aspectRatio, gap, bend)

  // Every length is a multiple of the tile's height.
  const cap = Math.min(MAX_WIDTH / aspectRatio, 100 * maxTileShare(bend, aspectRatio))
  const u = (n) => `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+cap.toFixed(4)}cqw))`

  const r = 100 * arc(bend)
  const cyl = `${+r.toFixed(3)}cqw`
  const turn = (deg) => `translateZ(${cyl}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${cyl})`

  // Beyond `limit` a tile is wholly off-screen, so it is hidden there.
  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4)
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `.${tile}-idle .${tile}{animation-play-state:paused}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`

  const share = aspectRatio / SLICES
  const duration = columns * speed
  // fade 0 means hard edges: no mask at all
  const mask = fade > 0 ? `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)` : undefined

  return (
    <div
      ref={ref}
      className={[className, !near && `${tile}-idle`].filter(Boolean).join(' ')}
      {...props}
      style={{ position: 'relative', overflow: 'hidden', containerType: 'size', ...style }}
    >
      <style>{css}</style>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.5s',
          opacity: layout ? 1 : 0,
          perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          // Numbers tiles in the order they come on.
          const first = columns - 1 - t
          const img = images[(shown[t] ?? first) % Math.max(images.length, 1)]
          return (
            <div
              key={t}
              className={tile}
              style={{
                position: 'absolute',
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: 'preserve-3d',
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
              onAnimationIteration={(e) => {
                // elapsedTime counts whole loops, missed events included.
                const lap = Math.round(e.elapsedTime / duration)
                setShown((prev) => {
                  const next = lap * columns + first
                  return prev[t] === next ? prev : { ...prev, [t]: next }
                })
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  style={{
                    position: 'absolute',
                    top: 0,
                    overflow: 'hidden',
                    background: img?.bg ?? tileBg,
                    borderTopLeftRadius: k === 0 ? corner : 0,
                    borderBottomLeftRadius: k === 0 ? corner : 0,
                    borderTopRightRadius: k === SLICES - 1 ? corner : 0,
                    borderBottomRightRadius: k === SLICES - 1 ? corner : 0,
                    left: u((aspectRatio - share) / 2),
                    // A pixel wider than its share so no hairline opens between facets.
                    width: k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn((aspectRatio / 2 - (k + 0.5) * share) * unit),
                  }}
                >
                  {img && woke ? (
                    <img
                      decoding="async"
                      src={img.src}
                      alt={k === 0 ? (img.alt ?? '') : ''}
                      draggable={false}
                      style={{
                        position: 'absolute',
                        top: 0,
                        maxWidth: 'none',
                        objectFit: img.fit ?? 'cover',
                        left: u(-k * share),
                        width: u(aspectRatio),
                        height: u(1),
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {children}
    </div>
  )
}

export default TiltedGridHero
