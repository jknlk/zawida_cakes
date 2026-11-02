import { useCallback, useEffect, useRef, useState } from 'react'
import ZawadiHero from './ZawadiHero'
import CakeFlight from './CakeFlight'
import { TORTES, START_INDEX } from './data'
import { scrollToId, startSmoothScroll } from './smoothScroll'
import { About, Delivery, Flavours, Footer, Gallery, Menu, Occasions, Offer, Sizes } from './ZawadiSections'

const CART_KEY = 'zawadi-cart'

function readCart() {
  try {
    return Number(localStorage.getItem(CART_KEY)) || 0
  } catch {
    return 0
  }
}

function writeCart(n) {
  try {
    localStorage.setItem(CART_KEY, String(n))
  } catch {
    /* storage unavailable: cart still works for this visit */
  }
}

export default function ZawadiPage() {
  const [cart, setCart] = useState(readCart)
  const [toast, setToast] = useState(null)
  const [active, setActive] = useState(START_INDEX)
  const [menuCat, setMenuCat] = useState('all')
  const timer = useRef(0)

  useEffect(() => startSmoothScroll(), [])

  useEffect(() => {
    document.title = 'Zawadi Cakes — Handmade tortes in Nairobi'
    return () => window.clearTimeout(timer.current)
  }, [])

  const addToCart = useCallback((name) => {
    setCart((c) => {
      writeCart(c + 1)
      return c + 1
    })
    setToast(`${name} added to your cart`)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  // Occasions cards open the matching Menu tab
  const pickOccasion = useCallback((cat) => {
    setMenuCat(cat)
    scrollToId('menu')
  }, [])

  return (
    <main className="zw-page">
      <ZawadiHero cart={cart} onAdd={addToCart} onActiveChange={setActive} />
      <About torte={TORTES[active]} />
      <CakeFlight torte={TORTES[active]} index={active} />
      <Menu onAdd={addToCart} cat={menuCat} onCatChange={setMenuCat} />
      <Occasions onPick={pickOccasion} />
      <Flavours />
      <Sizes />
      <Gallery />
      <Offer onAdd={addToCart} />
      <Delivery />
      <Footer />
      <div className={`zw-page-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </main>
  )
}
