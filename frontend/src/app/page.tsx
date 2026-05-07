'use client'

import { useEffect, useState, useCallback } from 'react'
import Hero from '@/components/sections/Hero'
import Problem from '@/components/sections/Problem'
import HowItWorks from '@/components/sections/HowItWorks'
import Findings from '@/components/sections/Findings'
import TimeComparison from '@/components/sections/TimeComparison'
import WhyRedFlag from '@/components/sections/WhyRedFlag'
import Trust from '@/components/sections/Trust'
import CTA from '@/components/sections/CTA'
import Footer from '@/components/Footer'
import Configuration from '@/components/Configuration'
import Playground from '@/components/Playground'

type View = 'marketing' | 'configuration' | 'playground'

export default function Home() {
  const [view, setView] = useState<View>('marketing')

  const routeFromHash = useCallback(() => {
    const hash = window.location.hash
    if (hash === '#playground') { setView('playground'); return }
    if (hash === '#configuration') { setView('configuration'); return }
    const sectionId = hash.replace('#', '')
    if (sectionId && document.getElementById(sectionId)) {
      setView('marketing')
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
      return
    }
    setView('marketing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { view: v, hash } = e.detail
      if (v === 'playground') setView('playground')
      else if (v === 'configuration') setView('configuration')
      else {
        setView('marketing')
        const sectionId = hash?.replace('#', '')
        if (sectionId && document.getElementById(sectionId)) {
          setTimeout(() => {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 50)
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
      window.history.replaceState(null, '', hash || '#')
    }
    window.addEventListener('redflag-navigate', handler as EventListener)
    return () => window.removeEventListener('redflag-navigate', handler as EventListener)
  }, [])

  useEffect(() => {
    window.addEventListener('hashchange', routeFromHash)
    routeFromHash()
    return () => window.removeEventListener('hashchange', routeFromHash)
  }, [routeFromHash])

  // Scroll shadow for marketing page
  useEffect(() => {
    if (view !== 'marketing') return
    const onScroll = () => {
      const nav = document.querySelector('.site-nav') as HTMLElement
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [view])

  // Plausible analytics
  useEffect(() => {
    const s = document.createElement('script')
    s.defer = true
    s.setAttribute('data-domain', 'redflag-ai.com')
    s.src = 'https://plausible.io/js/script.js'
    document.head.appendChild(s)
    return () => { /* keep */ }
  }, [])

  // Calendly widget
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://assets.calendly.com/assets/external/widget.js'
    s.async = true
    document.head.appendChild(s)
    return () => { /* keep */ }
  }, [])

  return (
    <>
      <div style={{ display: view === 'marketing' ? 'block' : 'none' }} id="marketing-page" className="pt-[60px] transition-opacity duration-300">
        <Hero />
        <Problem />
        <HowItWorks />
        <Findings />
        <TimeComparison />
        <WhyRedFlag />
        <Trust />
        <CTA />
        <Footer />
      </div>
      <div style={{ display: view === 'configuration' ? 'block' : 'none' }} id="configuration-view" className="pt-[60px] transition-opacity duration-300 min-h-screen bg-[var(--bg)]">
        <Configuration />
      </div>
      <div style={{ display: view === 'playground' ? 'block' : 'none' }} id="playground-view" className="transition-opacity duration-300">
        <Playground />
      </div>
    </>
  )
}
