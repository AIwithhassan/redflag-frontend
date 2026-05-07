'use client'

import { useEffect, useState, useCallback } from 'react'
import { navigateTo } from '@/components/Nav'

const headlines = [
  "Find what opposing counsel will find — before they do.",
  "Your associate missed it on day 3. RedFlag caught it in minute 4.",
  "5 days of review. 20 minutes with RedFlag. Same documents.",
  "The cross-reference on page 247 that changes everything.",
  "Which version controls? RedFlag already checked.",
  "Exhibit B contradicts Section 3.2. Did you catch that?",
  "A week of document review. 20 minutes. Every contradiction found.",
]

export default function Hero() {
  const [displayText, setDisplayText] = useState('')
  const [headlineIdx, setHeadlineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const ci = setInterval(() => setCursorVisible(v => !v), 400)
    return () => clearInterval(ci)
  }, [])

  const tick = useCallback(() => {
    const line = headlines[headlineIdx]
    if (!deleting) {
      if (charIdx < line.length) {
        setDisplayText(line.slice(0, charIdx + 1))
        setCharIdx(charIdx + 1)
      } else {
        setTimeout(() => setDeleting(true), 3000)
        return
      }
    } else {
      if (charIdx > 0) {
        setDisplayText(line.slice(0, charIdx - 1))
        setCharIdx(charIdx - 1)
      } else {
        setDeleting(false)
        setHeadlineIdx((headlineIdx + 1) % headlines.length)
        return
      }
    }
  }, [headlineIdx, charIdx, deleting])

  useEffect(() => {
    const speed = deleting ? 30 : 50
    const timer = setTimeout(tick, speed)
    return () => clearTimeout(timer)
  }, [tick, deleting, charIdx, headlineIdx])

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
    <section id="hero" className="pt-[100px] pb-[100px] min-h-[90vh] flex flex-col justify-center text-center">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="text-[11px] uppercase tracking-[2px] text-[var(--ink-muted)] mb-[20px]">Litigation File Intelligence</div>
        <p className="text-[14px] text-[var(--ink-light)] max-w-[600px] mx-auto mb-[36px] leading-[1.7]">
          RedFlag reads every document in your case, maps cross-references, tracks amendment chains, and surfaces every contradiction — cited to the exact page.
        </p>
        <div className="max-w-[860px] min-h-[200px] mx-auto mb-[32px] max-md:min-h-[120px]">
          <span className="font-serif text-[56px] font-[400] leading-[1.1] tracking-[-1px] max-md:text-[32px]" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {displayText}
          </span>
          <span className={`inline-block text-[var(--red)] ml-[2px] font-serif text-[56px] leading-[1.1] max-md:text-[32px] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "'Instrument Serif', serif" }}>|</span>
        </div>
        <p className="text-[16px] leading-[1.7] text-[var(--ink-muted)] max-w-[560px] mx-auto mb-[40px]">
          What takes your team a week of review, RedFlag does in 20 minutes — with citations.
        </p>
        <div className="flex gap-[16px] flex-wrap mb-[64px] justify-center max-md:flex-col">
          <button className="btn btn-primary" onClick={() => navigateTo('playground', '#playground')}>Try the Playground →</button>
          <button className="btn btn-secondary" onClick={bookDemo}>Book a 15-min Demo</button>
        </div>
        <div className="bg-[var(--bg-dark)] border-2 border-[var(--border)] shadow-[0_20px_60px_var(--shadow)] p-[32px] max-w-[560px] mx-auto font-mono text-[14px] leading-[1.8] text-left">
          <div className="text-[var(--ink-on-dark)]">// 12 documents analyzed</div>
          <div className="text-[var(--ink-on-dark)]">// 380 pages scanned</div>
          <div className="text-[var(--red)]">// 7 contradictions found</div>
          <div className="text-[var(--ink-on-dark)]">// 4 minutes 12 seconds</div>
          <div className="text-[var(--success)]">// All findings cited to source ✓</div>
        </div>
      </div>
    </section>
  )
}
