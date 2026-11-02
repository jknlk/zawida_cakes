import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Start Lenis and drive it from GSAP's ticker so ScrollTrigger stays in sync. Returns a cleanup.
export function startSmoothScroll() {
  if (prefersReduced()) return () => {}
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(raf)
    lenis.destroy()
    lenis = null
  }
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  // a section pinned as a curtain is fully shown at the end of its pin
  const pin = ScrollTrigger.getById(`curtain-${id}`)
  if (pin) {
    if (lenis) lenis.scrollTo(pin.end, { duration: 1.6 })
    else window.scrollTo({ top: pin.end, behavior: 'smooth' })
    return
  }
  if (lenis) lenis.scrollTo(el, { duration: 1.6 })
  else el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' })
}
