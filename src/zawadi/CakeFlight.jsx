import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HERO_TART_SIZES } from './data'

gsap.registerPlugin(ScrollTrigger)

const FRAME_IMG_SCALE = 0.86 // matches .zs-about__frame img { transform: scale(0.86) }
const ease = gsap.parseEase('power2.inOut')
const lerp = (a, b, t) => a + (b - a) * t

// current visual angle of the hero cake: the slow CSS spin plus any GSAP rotation on the tart
function heroAngle(stage, index) {
  const spin = stage.querySelector('.zw-spin')
  const m = spin && getComputedStyle(spin).transform
  let a = 0
  if (m && m !== 'none') {
    const v = m.match(/matrix\(([^)]+)\)/)?.[1].split(',').map(Number)
    if (v) a = (Math.atan2(v[1], v[0]) * 180) / Math.PI
  }
  const tart = stage.querySelector(`.zw-tart[data-i="${index}"]`)
  return a + (tart ? Number(gsap.getProperty(tart, 'rotation')) || 0 : 0)
}

/**
 * As the page scrolls from the hero to "Our story", the selected torte lifts off the hero
 * and flies (scroll-scrubbed, smoothed by Lenis) into the story frame, then hands over to
 * the frame's own image. Scrolling back up flies it home.
 */
export default function CakeFlight({ torte, index }) {
  const ref = useRef(null)
  const indexRef = useRef(index)
  indexRef.current = index

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const flyer = ref.current
    const stage = document.querySelector('.zw-stage')
    const frame = document.querySelector('.zs-about__frame')
    const frameImg = frame?.querySelector('img')
    if (!stage || !frame || !frameImg) return undefined

    // With the curtain, the frame stays still while the hero slides away, so land
    // just before the hero is fully gone. Without it, land as the frame nears centre.
    const st = ScrollTrigger.create({
      trigger: frame,
      start: 0,
      end: () => {
        const curtain = ScrollTrigger.getById('curtain-about')
        return curtain ? curtain.end * 0.85 : 'center 55%'
      },
    })
    let startAngle = null
    let endAngle = 0
    let lastP = -1

    const render = () => {
      const p = gsap.utils.clamp(0, 1, st.progress)
      const flying = p > 0 && p < 1

      if (p <= 0) {
        if (lastP !== 0) {
          flyer.style.visibility = 'hidden'
          stage.style.visibility = ''
          frameImg.style.opacity = '0'
          gsap.set(frame, { scale: 0.6, autoAlpha: 0 })
          startAngle = null
        }
        lastP = 0
        return
      }

      if (startAngle === null) {
        startAngle = heroAngle(stage, indexRef.current)
        // land upright, after at least one extra turn in flight
        endAngle = Math.ceil(startAngle / 360) * 360 + 360
      }

      const e = ease(p)
      gsap.set(frame, { scale: lerp(0.6, 1, e), autoAlpha: Math.min(1, p * 1.6) })
      stage.style.visibility = 'hidden'
      frameImg.style.opacity = flying ? '0' : '1'
      flyer.style.visibility = flying ? 'visible' : 'hidden'
      lastP = p
      if (!flying) return

      const s = stage.getBoundingClientRect()
      const f = frame.getBoundingClientRect()
      const fSize = frame.offsetWidth * FRAME_IMG_SCALE // layout size, ignores the frame's own scale
      const size = lerp(s.width, fSize, e)
      const cx = lerp(s.left + s.width / 2, f.left + f.width / 2, e)
      const cy = lerp(s.top + s.height / 2, f.top + f.height / 2, e) + Math.sin(Math.PI * p) * -window.innerHeight * 0.08
      gsap.set(flyer, {
        width: size,
        height: size,
        x: cx - size / 2,
        y: cy - size / 2,
        rotation: lerp(startAngle, endAngle, e),
      })
    }

    render()
    gsap.ticker.add(render)
    return () => {
      gsap.ticker.remove(render)
      st.kill()
      stage.style.visibility = ''
      frameImg.style.opacity = ''
      gsap.set(frame, { clearProps: 'transform,opacity,visibility' })
    }
  }, [])

  return <img
      ref={ref}
      className="zw-flyer"
      src={torte.img}
      srcSet={torte.srcSet}
      sizes={HERO_TART_SIZES}
      alt=""
      aria-hidden="true"
      width="1024"
      height="1024"
    />
}
