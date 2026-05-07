'use client'

import { useEffect, useState } from 'react'

const NAV_EVENT = 'redflag-navigate'

export function navigateTo(view: string, hash: string = '') {
  window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: { view, hash } }))
}

export function scrollToSection(sectionId: string) {
  window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: { view: 'marketing', hash: `#${sectionId}` } }))
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goHome = () => navigateTo('marketing', '#')
  const goPlayground = () => navigateTo('playground', '#playground')
  const goConfig = () => navigateTo('configuration', '#configuration')
  const goHow = () => scrollToSection('how-it-works')
  const bookDemo = () => {
    try {
      if ((window as any).Calendly) {
        (window as any).Calendly.initPopupWidget({ url: 'https://calendly.com/YOUR_USERNAME/redflag-demo' })
      } else {
        window.open('https://calendly.com/YOUR_USERNAME/redflag-demo', '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open('https://calendly.com/YOUR_USERNAME/redflag-demo', '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-[60px] z-[1000] bg-[var(--bg)] border-b border-[var(--border)] transition-shadow duration-200 ${scrolled ? 'shadow-[0_2px_16px_var(--shadow)]' : ''}`}
    >
      <div className="h-full flex items-center justify-between max-w-[1200px] mx-auto px-[40px]">
        <button onClick={goHome} className="font-serif text-[28px] font-[400] no-underline cursor-pointer bg-transparent border-none inline-flex items-center gap-[10px]" style={{ fontFamily: "'Instrument Serif', serif" }}>
          <span><span className="text-[var(--red)]">Red</span><span className="text-[var(--ink)]">Flag</span></span>
          <span className="inline-flex items-center justify-center px-[6px] py-[2px] border border-[var(--border)] bg-[var(--bg-alt)] text-[var(--ink-muted)] font-mono text-[9px] font-[600] tracking-[1.2px] uppercase leading-none">Beta</span>
        </button>
        <div className="hidden md:flex items-center gap-[32px]">
          <button onClick={goHome} className="text-[11px] uppercase tracking-[1px] text-[var(--ink)] no-underline cursor-pointer bg-transparent border-none font-mono hover:text-[var(--red)] transition-colors">Home</button>
          <button onClick={goHow} className="text-[11px] uppercase tracking-[1px] text-[var(--ink)] no-underline cursor-pointer bg-transparent border-none font-mono hover:text-[var(--red)] transition-colors">How It Works</button>
          <button onClick={goPlayground} className="text-[11px] uppercase tracking-[1px] text-[var(--ink)] no-underline cursor-pointer bg-transparent border-none font-mono hover:text-[var(--red)] transition-colors">Playground</button>
          <button onClick={goConfig} className="text-[11px] uppercase tracking-[1px] text-[var(--ink)] no-underline cursor-pointer bg-transparent border-none font-mono hover:text-[var(--red)] transition-colors">Configuration</button>
          <button onClick={bookDemo} className="bg-[var(--red)] text-[var(--bg)] border-2 border-[var(--red)] px-[20px] py-[8px] font-mono text-[10px] font-[600] uppercase tracking-[2px] cursor-pointer transition-all hover:bg-[var(--red-dark)] hover:border-[var(--red-dark)]">Book a Demo</button>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="hidden max-md:flex bg-transparent border-none cursor-pointer p-[4px] flex-col gap-[5px]" aria-label="Toggle menu">
          <span className="block w-[22px] h-[2px] bg-[var(--ink)]"></span>
          <span className="block w-[22px] h-[2px] bg-[var(--ink)]"></span>
          <span className="block w-[22px] h-[2px] bg-[var(--ink)]"></span>
        </button>
      </div>
      <div className={`${mobileOpen ? 'flex' : 'hidden'} absolute top-[60px] left-0 right-0 bg-[var(--bg)] border-b-2 border-[var(--border)] px-[40px] py-[24px] flex-col gap-[20px] md:hidden`}>
        <button onClick={() => { goHome(); setMobileOpen(false) }} className="text-[13px] uppercase tracking-[1px] text-[var(--ink)] bg-transparent border-none font-mono text-left">Home</button>
        <button onClick={() => { goHow(); setMobileOpen(false) }} className="text-[13px] uppercase tracking-[1px] text-[var(--ink)] bg-transparent border-none font-mono text-left">How It Works</button>
        <button onClick={() => { goPlayground(); setMobileOpen(false) }} className="text-[13px] uppercase tracking-[1px] text-[var(--ink)] bg-transparent border-none font-mono text-left">Playground</button>
        <button onClick={() => { goConfig(); setMobileOpen(false) }} className="text-[13px] uppercase tracking-[1px] text-[var(--ink)] bg-transparent border-none font-mono text-left">Configuration</button>
        <button onClick={() => { bookDemo(); setMobileOpen(false) }} className="bg-[var(--red)] text-[var(--bg)] border-2 border-[var(--red)] px-[20px] py-[8px] font-mono text-[10px] font-[600] uppercase tracking-[2px] cursor-pointer self-start">Book a Demo</button>
      </div>
    </nav>
  )
}

export type { }
