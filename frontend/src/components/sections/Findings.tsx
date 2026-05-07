export default function Findings() {
  const findings = [
    {
      text: 'Email (Jan 5) states delivery date as March 1. Contract §3.2 states April 15.',
      badge: 'Date Conflict',
      badgeClass: '',
      source: 'email_chain.pdf → master_agreement.pdf §3.2',
    },
    {
      text: 'Witness statement says \'no prior relationship.\' Exhibit C shows 3 years of documented contact.',
      badge: 'Factual Contradiction',
      badgeClass: '',
      source: 'deposition_jones.pdf ¶12 → exhibit_c.pdf p.4',
    },
    {
      text: 'Amendment 2 changes indemnification cap to $5M. Schedule A still references the original $2M cap.',
      badge: 'Superseded Reference',
      badgeClass: 'warning',
      source: 'amendment_2.docx §4.1 → schedule_a.pdf §7',
    },
    {
      text: 'Non-compete radius is \'50 miles\' in employment agreement but \'100 miles\' in separation agreement.',
      badge: 'Term Conflict',
      badgeClass: '',
      source: 'employment_agreement.pdf §8 → separation.pdf §3.2',
    },
    {
      text: 'Closing date defined as \'within 90 days\' in the LOI but \'within 60 days\' in the Purchase Agreement.',
      badge: 'Term Conflict',
      badgeClass: '',
      source: 'loi.pdf §3 → purchase_agreement.pdf §2.4',
    },
  ]

  return (
    <section className="section-alt py-[100px]" id="findings">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="caption">Findings</div>
        <h2 className="font-serif text-[36px] font-[400] leading-[1.2] max-md:text-[26px]" style={{ fontFamily: "'Instrument Serif', serif" }}>What RedFlag finds in 20 minutes that takes an associate a week.</h2>
        <div className="mt-[48px]">
          {findings.map((f, i) => (
            <div key={i} className="grid grid-cols-[1fr_160px_280px] gap-[24px] items-center p-[24px] border-l-3 border-[var(--red)] bg-[var(--bg)] mb-[2px] max-md:grid-cols-1 max-md:gap-[12px]">
              <div className="text-[14px] leading-[1.6]">{f.text}</div>
              <div>
                <span className={`finding-badge ${f.badgeClass}`}>{f.badge}</span>
              </div>
              <div className="text-[12px] text-[var(--ink-muted)] leading-[1.6]">{f.source}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
