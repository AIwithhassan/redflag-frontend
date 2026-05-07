export default function Trust() {
  return (
    <section className="section-dark py-[100px]" id="trust">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="caption">Built for Confidentiality</div>
        <h2 className="font-serif text-[36px] font-[400] leading-[1.2] max-md:text-[26px]" style={{ fontFamily: "'Instrument Serif', serif" }}>Your documents never leave your control.</h2>
        <div className="grid grid-cols-3 gap-[40px] mt-[48px] max-md:grid-cols-1">
          <div className="text-center">
            <span className="text-[32px] mb-[20px] block" aria-hidden="true">🔒</span>
            <div className="text-[11px] uppercase tracking-[2px] text-[var(--red)] mb-[16px]">Local Document Parsing</div>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-on-dark)]">Documents are parsed by MarkItDown, an open-source library from Microsoft running on-device. No files are uploaded to any third-party AI service. Ever.</p>
          </div>
          <div className="text-center">
            <span className="text-[32px] mb-[20px] block" aria-hidden="true">✓</span>
            <div className="text-[11px] uppercase tracking-[2px] text-[var(--red)] mb-[16px]">Verified Citations</div>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-on-dark)]">Every finding includes a citation. Every citation is checked against the actual source text before it&apos;s shown to you. If it can&apos;t be cited, it doesn&apos;t appear.</p>
          </div>
          <div className="text-center">
            <span className="text-[32px] mb-[20px] block" aria-hidden="true">⊘</span>
            <div className="text-[11px] uppercase tracking-[2px] text-[var(--red)] mb-[16px]">No Hallucinations</div>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-on-dark)]">RedFlag doesn&apos;t guess. It reads, compares, and reports. Findings are structural contradictions between documents — not AI speculation.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
