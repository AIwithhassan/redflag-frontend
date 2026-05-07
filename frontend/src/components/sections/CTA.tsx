import { navigateTo } from '@/components/Nav'

export default function CTA() {
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
    <section id="cta" className="py-[120px] max-md:py-[80px]">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="text-center max-w-[720px] mx-auto mb-[64px]">
          <h2 className="font-serif text-[36px] font-[400] leading-[1.2] max-md:text-[26px]" style={{ fontFamily: "'Instrument Serif', serif" }}>Try it on your next case. See what a week of review looks like in 20 minutes.</h2>
        </div>
        <div className="grid grid-cols-2 gap-[2px] max-w-[860px] mx-auto max-md:grid-cols-1">
          <div className="bg-[var(--bg-alt)] border-2 border-[var(--border)] p-[40px]">
            <div className="text-[11px] uppercase tracking-[1.5px] text-[var(--ink-muted)] mb-[16px]">Try the Playground</div>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-light)] mb-[28px]">Upload documents and run RedFlag. Free. No signup required.</p>
            <button className="btn btn-primary" onClick={() => navigateTo('playground', '#playground')}>Open Playground →</button>
          </div>
          <div className="bg-[var(--bg-alt)] border-2 border-[var(--border)] p-[40px]">
            <div className="text-[11px] uppercase tracking-[1.5px] text-[var(--ink-muted)] mb-[16px]">Book a Walkthrough</div>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-light)] mb-[28px]">I&apos;ll run RedFlag on your case files live. 15 minutes.</p>
            <button className="btn btn-secondary" onClick={bookDemo}>Book on Calendly →</button>
          </div>
        </div>
      </div>
    </section>
  )
}
