import { createContext, useContext } from 'react'

export const TransitionContext = createContext({ navigateTo: () => {} })

export const usePageTransition = () => useContext(TransitionContext)

export const PAGES = [
  { path: '/', label: 'Zawadi', title: 'Zawadi Cakes — Handmade tortes in Nairobi' },
  { path: '/flavours', label: 'Flavour wheel', title: 'Flavour Wheel — Zawadi Cakes' },
]
