import { Children, useEffect, useRef, useState } from 'react'
import './stories-carousel.css'

/* ── stories carousel, as a marquee ──────────────────────────────
 * Ported from the shadcn "stories-carousel" (TSX + Tailwind + Embla +
 * Radix Avatar) to plain JSX and CSS, because this project has no
 * Tailwind/TS. Instead of a drag carousel the row streams sideways
 * forever: the items are rendered twice, side by side, and both copies
 * slide left by one copy's width, then start over. The second copy is
 * hidden from screen readers and the keyboard.
 *
 * The marquee pauses while the pointer is over it or a card has focus.
 * With reduced motion it becomes a plain, swipeable row.
 * ─────────────────────────────────────────────────────────────── */

const cx = (...c) => c.filter(Boolean).join(' ')

export function Stories({ children, className, speed = 40, reverse = false, label, style, ...props }) {
  const rootRef = useRef(null)
  const rowRef = useRef(null)
  const [duration, setDuration] = useState(40)
  const [onScreen, setOnScreen] = useState(false)

  // no point streaming the row while nobody can see it
  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // keep a constant speed in px/s however wide the row is
  useEffect(() => {
    const row = rowRef.current
    if (!row) return undefined
    const ro = new ResizeObserver(() => setDuration(Math.max(10, row.scrollWidth / speed)))
    ro.observe(row)
    return () => ro.disconnect()
  }, [speed])

  return (
    <div
      ref={rootRef}
      className={cx('stories', reverse && 'stories--reverse', !onScreen && 'stories--idle', className)}
      style={{ '--stories-duration': `${duration}s`, ...style }}
      role="region"
      aria-label={label}
      {...props}
    >
      <ul className="stories__track" ref={rowRef}>
        {children}
      </ul>
      <ul className="stories__track stories__track--copy" aria-hidden="true" inert>
        {Children.map(children, (child) => child)}
      </ul>
    </div>
  )
}

// One card. Renders a real <button> so it is clickable and focusable.
export function Story({ className, children, style, ...props }) {
  return (
    <li className="story" style={style}>
      <button type="button" className={cx('story__card', className)} {...props}>
        {children}
      </button>
    </li>
  )
}

export function StoryImage({ className, alt, ...props }) {
  return <img alt={alt} className={cx('story__media', className)} draggable="false" {...props} />
}

// Plays on hover/focus, rewinds to the #t= start time when left.
export function StoryVideo({ className, src, ...props }) {
  const ref = useRef(null)
  const start = Number.parseFloat(/t=(\d+(?:\.\d+)?)/.exec(String(src ?? '').split('#')[1] ?? '')?.[1] ?? 0)
  const play = () => ref.current?.play()
  const stop = () => {
    if (!ref.current) return
    ref.current.pause()
    ref.current.currentTime = start
  }
  return (
    <video
      ref={ref}
      src={src}
      className={cx('story__media', className)}
      loop
      muted
      playsInline
      preload="metadata"
      onMouseOver={play}
      onMouseOut={stop}
      onFocus={play}
      onBlur={stop}
      {...props}
    />
  )
}

export function StoryOverlay({ side = 'bottom', className, ...props }) {
  return <span className={cx('story__overlay', `story__overlay--${side}`, className)} {...props} />
}

export function StoryTitle({ className, ...props }) {
  return <span className={cx('story__title', className)} {...props} />
}

export function StoryAuthor({ className, children, ...props }) {
  return (
    <span className={cx('story__author', className)} {...props}>
      {children}
    </span>
  )
}

// Round avatar; shows the fallback letters until (or unless) the image loads.
export function StoryAuthorImage({ src, name, fallback, className, ...props }) {
  const [ok, setOk] = useState(false)
  return (
    <span className={cx('story__avatar', className)} {...props}>
      {src && (
        <img
          src={src}
          alt=""
          onLoad={() => setOk(true)}
          onError={() => setOk(false)}
          style={{ opacity: ok ? 1 : 0 }}
        />
      )}
      {!ok && <span aria-hidden="true">{fallback || name?.charAt(0)?.toUpperCase()}</span>}
    </span>
  )
}

export function StoryAuthorName({ className, ...props }) {
  return <span className={cx('story__name', className)} {...props} />
}
