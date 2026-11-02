import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { PAGES, TransitionContext } from './transition'
import './shell.css'

// Wraps every page: a curtain wipe between routes and a fixed page switcher.
export default function Shell({ children }) {
  const curtain = useRef(null)
  const busy = useRef(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const index = Math.max(0, PAGES.findIndex((p) => p.path === pathname))

  const navigateTo = useCallback(
    (path) => {
      if (busy.current || path === pathname) return
      busy.current = true
      const el = curtain.current
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        navigate(path)
        busy.current = false
        return
      }
      gsap
        .timeline()
        .set(el, { autoAlpha: 1, yPercent: 100 })
        .to(el, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
        .from(el.querySelector('.shell-curtain__word'), { yPercent: 100, duration: 0.6, ease: 'expo.out' }, 0.35)
        .add(() => navigate(path))
        .to(el, { yPercent: -100, duration: 0.8, ease: 'expo.inOut', delay: 0.25 })
        .set(el, { autoAlpha: 0 })
        .add(() => {
          busy.current = false
        })
    },
    [navigate, pathname],
  )

  useEffect(() => {
    const page = PAGES[index]
    if (page) document.title = page.title
  }, [index])

  // Page Up/Down or [ and ] switch pages from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'PageDown' || e.key === ']') navigateTo(PAGES[(index + 1) % PAGES.length].path)
      if (e.key === 'PageUp' || e.key === '[') navigateTo(PAGES[(index - 1 + PAGES.length) % PAGES.length].path)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, navigateTo])

  const value = useMemo(() => ({ navigateTo }), [navigateTo])

  return (
    <TransitionContext.Provider value={value}>
      {children}

      <nav className="shell-pager" aria-label="Pages">
        {PAGES.map((p, i) => (
          <button
            key={p.path}
            type="button"
            className={`shell-pager__item${i === index ? ' is-active' : ''}`}
            aria-current={i === index ? 'page' : undefined}
            onClick={() => navigateTo(p.path)}
          >
            <span className="shell-pager__label">{p.label}</span>
            <span className="shell-pager__num">{String(i + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </nav>

      <div className="shell-curtain" ref={curtain} aria-hidden="true">
        <span className="shell-curtain__mask">
          <span className="shell-curtain__word">Zawadi</span>
        </span>
      </div>
    </TransitionContext.Provider>
  )
}
