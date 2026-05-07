export default function Problem() {
  return (
    <section className="section-dark py-[100px]" id="problem">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="caption">The Problem</div>
        <h2 className="font-serif text-[36px] font-[400] leading-[1.2] max-md:text-[26px]" style={{ fontFamily: "'Instrument Serif', serif" }}>The most expensive mistake in litigation is the one you didn&apos;t see.</h2>
        <div className="grid grid-cols-3 gap-[2px] mt-[48px] max-md:grid-cols-1 max-lg:grid-cols-1">
          <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] p-[32px]">
            <div className="text-[10px] uppercase tracking-[1.5px] text-[var(--red)] mb-[16px]">The Missed Cross-Reference</div>
            <p className="text-[var(--ink-on-dark)] text-[14px] leading-[1.7]">Opposing counsel finds a date conflict between your client&apos;s affidavit and an email buried on page 247. You had the document. You missed it.</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] p-[32px]">
            <div className="text-[10px] uppercase tracking-[1.5px] text-[var(--red)] mb-[16px]">The Wrong Version</div>
            <p className="text-[var(--ink-on-dark)] text-[14px] leading-[1.7]">The contract says &apos;30 days.&apos; The amendment says &apos;60 days.&apos; The schedule still references the original. You cited the superseded clause.</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] p-[32px]">
            <div className="text-[10px] uppercase tracking-[1.5px] text-[var(--red)] mb-[16px]">The Expensive Review</div>
            <p className="text-[var(--ink-on-dark)] text-[14px] leading-[1.7]">Your associate reviewed 400 pages in 5 days. Billed $12,000. Missed 3 cross-reference inconsistencies. RedFlag would have found all three in 20 minutes for less than a dollar.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
