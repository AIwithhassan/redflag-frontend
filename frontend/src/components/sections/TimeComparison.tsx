export default function TimeComparison() {
  return (
    <section className="py-[100px]" id="math">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="caption">The Math</div>
        <h2 className="font-serif text-[36px] font-[400] leading-[1.2] max-md:text-[26px]" style={{ fontFamily: "'Instrument Serif', serif" }}>A week of review. Done in 20 minutes.</h2>
        <div className="grid grid-cols-2 gap-[2px] mt-[48px] max-md:grid-cols-1">
          <div className="p-[40px] border-2 border-[var(--border)] text-[var(--ink-muted)]">
            <div className="text-[11px] uppercase tracking-[2px] mb-[24px]">Manual Review</div>
            <div className="py-[8px] border-b border-[var(--border)] text-[14px]">400 pages across 15 documents</div>
            <div className="py-[8px] border-b border-[var(--border)] text-[14px]">Associate reads each document (5 days)</div>
            <div className="py-[8px] border-b border-[var(--border)] text-[14px]">Cross-references checked manually (missed 3)</div>
            <div className="py-[8px] border-b border-[var(--border)] text-[14px]">Amendment chain tracked on sticky notes</div>
            <div className="pt-[20px] text-[16px] font-[600] line-through">Total: 5 days · $12,000 in billable time</div>
          </div>
          <div className="p-[40px] border-2 border-[var(--border)]">
            <div className="text-[11px] uppercase tracking-[2px] mb-[24px] font-[600]">With RedFlag</div>
            <div className="py-[8px] border-b border-[var(--border)] text-[14px]">400 pages across 15 documents</div>
            <div className="py-[8px] border-b border-[var(--border)] text-[14px]">All documents parsed simultaneously (2 min)</div>
            <div className="py-[8px] border-b border-[var(--border)] text-[14px]">Every cross-reference followed automatically</div>
            <div className="py-[8px] border-b border-[var(--border)] text-[14px]">Amendment chains tracked and verified</div>
            <div className="pt-[20px] text-[16px] font-[600] text-[var(--red)]">Total: 20 minutes · less than $1</div>
          </div>
        </div>
        <p className="text-center mt-[48px] text-[16px] leading-[1.7] text-[var(--ink-light)] max-w-[640px] mx-auto">
          Same documents. Same contradictions found. One takes a week. One takes 20 minutes.
        </p>
      </div>
    </section>
  )
}
