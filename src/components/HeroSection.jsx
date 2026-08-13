import { useCallback, useEffect, useRef, useState } from 'react'
import flavors from '../data/flavors'
import './HeroSection.css'

const ANGLE_STEP = 34
const VISIBLE_RANGE = 105
const SCROLL_LOCK_MS = 650

function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(2)
  const lockRef = useRef(false)
  const sectionRef = useRef(null)

  const goTo = useCallback((next) => {
    const wrapped = ((next % flavors.length) + flavors.length) % flavors.length
    setActiveIndex(wrapped)
  }, [])

  const step = useCallback(
    (dir) => {
      if (lockRef.current) return
      lockRef.current = true
      goTo(activeIndex + dir)
      window.setTimeout(() => {
        lockRef.current = false
      }, SCROLL_LOCK_MS)
    },
    [activeIndex, goTo],
  )

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined

    const onWheel = (e) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < 8) return
      step(e.deltaY > 0 ? 1 : -1)
    }

    let touchStartY = null
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    const onTouchMove = (e) => {
      if (touchStartY === null) return
      const dy = touchStartY - e.touches[0].clientY
      if (Math.abs(dy) > 40) {
        step(dy > 0 ? 1 : -1)
        touchStartY = null
      }
    }

    node.addEventListener('wheel', onWheel, { passive: false })
    node.addEventListener('touchstart', onTouchStart, { passive: true })
    node.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      node.removeEventListener('wheel', onWheel)
      node.removeEventListener('touchstart', onTouchStart)
      node.removeEventListener('touchmove', onTouchMove)
    }
  }, [step])

  const active = flavors[activeIndex]

  return (
    <section
      ref={sectionRef}
      className="hero"
      style={{
        background: `radial-gradient(120% 100% at 50% 0%, ${active.bgSoft} 0%, ${active.bg} 55%, ${active.bg} 100%)`,
      }}
    >
      <div className="hero__glow" />

      <div className="hero__corner">
        {flavors.map((flavor, i) => (
          <img
            key={flavor.id}
            src={flavor.corner}
            alt=""
            aria-hidden="true"
            className={`hero__corner-img${i === activeIndex ? ' hero__corner-img--active' : ''}`}
            style={{
              WebkitMaskImage: `url(${flavor.corner})`,
              maskImage: `url(${flavor.corner})`,
            }}
          />
        ))}
      </div>

      <header className="hero__header">
        <h1 className="hero__title">{active.name} Cake</h1>
        <p className="hero__desc">{active.description}</p>
      </header>

      <button
        type="button"
        className="hero__arrow hero__arrow--left"
        onClick={() => step(-1)}
        aria-label="Previous flavor"
      >
        &#8249;
      </button>
      <button
        type="button"
        className="hero__arrow hero__arrow--right"
        onClick={() => step(1)}
        aria-label="Next flavor"
      >
        &#8250;
      </button>

      <div className="hero__dial">
        <div className="hero__dial-ring" />
        <div className="hero__pointer" />
        {flavors.map((flavor, i) => {
          const half = flavors.length / 2
          let diff = i - activeIndex
          if (diff > half) diff -= flavors.length
          if (diff < -half) diff += flavors.length
          const angle = diff * ANGLE_STEP
          const inView = Math.abs(angle) <= VISIBLE_RANGE
          const rad = (angle * Math.PI) / 180
          const radius = 46
          const x = 50 + radius * Math.sin(rad)
          const y = 50 - radius * Math.cos(rad)
          const isActive = i === activeIndex
          const fade = 1 - Math.min(1, Math.abs(angle) / VISIBLE_RANGE)

          return (
            <button
              key={flavor.id}
              type="button"
              className={`hero__label${isActive ? ' hero__label--active' : ''}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                opacity: inView ? fade : 0,
                pointerEvents: inView ? 'auto' : 'none',
              }}
              onClick={() => goTo(i)}
            >
              {flavor.name.toLowerCase()}
            </button>
          )
        })}
      </div>

      <div className="hero__plate">
        {flavors.map((flavor, i) => (
          <img
            key={flavor.id}
            src={flavor.image}
            alt={`${flavor.name} cake`}
            className={`hero__plate-img${i === activeIndex ? ' hero__plate-img--active' : ''}`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection
