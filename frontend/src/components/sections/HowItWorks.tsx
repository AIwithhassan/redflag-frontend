export default function HowItWorks() {
  return (
    <section className="py-[100px]" id="how-it-works">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="caption">How It Works</div>
        <h2 className="font-serif text-[36px] font-[400] leading-[1.2] max-md:text-[26px]" style={{ fontFamily: "'Instrument Serif', serif" }}>Upload. Scan. See what you missed.</h2>
        <div className="relative grid grid-cols-3 gap-[40px] mt-[48px] max-lg:grid-cols-1 max-md:grid-cols-1">
          <div className="absolute top-[28px] left-[80px] right-[80px] h-[1px] bg-[var(--border)] max-lg:hidden" />
          <div>
            <div className="step-number">01</div>
            <h3 className="font-mono text-[14px] font-[600] uppercase tracking-[2px] mb-[12px]">Upload your case files</h3>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-light)]">Drop in PDFs, DOCX files, or a zip archive. Contracts, amendments, schedules, exhibits, correspondence — any document in your case.</p>
          </div>
          <div>
            <div className="step-number">02</div>
            <h3 className="font-mono text-[14px] font-[600] uppercase tracking-[2px] mb-[12px]">RedFlag reads everything</h3>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-light)]">Every document is parsed locally. RedFlag builds a hierarchy (master → amendments → exhibits), maps every cross-reference, and tracks amendment chains. Then it reads strategically — not sequentially.</p>
          </div>
          <div>
            <div className="step-number">03</div>
            <h3 className="font-mono text-[14px] font-[600] uppercase tracking-[2px] mb-[12px]">Get your contradiction report</h3>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-light)]">In roughly 20 minutes — not 5 days — you get a structured list of every inconsistency, date conflict, superseded reference, and factual contradiction. Each one cited to the exact document, section, and page.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
