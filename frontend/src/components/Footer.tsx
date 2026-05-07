export default function Footer() {
  return (
    <footer className="bg-[var(--bg-dark)] text-[var(--ink-on-dark)] py-[60px]">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="font-serif text-[28px] text-[var(--ink-on-dark)] mb-[12px] inline-flex items-center gap-[10px]" style={{ fontFamily: "'Instrument Serif', serif" }}>
          RedFlag <span className="inline-flex items-center justify-center px-[6px] py-[2px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] text-[var(--ink-muted)] font-mono text-[9px] font-[600] tracking-[1.2px] uppercase leading-none">Beta</span>
        </div>
        <div className="text-[12px] text-[var(--ink-muted)] mb-[24px]">Litigation file intelligence.</div>
        <div className="text-[12px] text-[var(--ink-muted)]">
          Built by [Your Name] &nbsp;&nbsp; contact@redflag-ai.com<br />
          &copy; 2026 RedFlag. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
