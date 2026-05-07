export default function WhyRedFlag() {
  const rows = [
    { capability: 'Cross-document reading', others: '✕', redflag: '✓ Follows every cross-reference' },
    { capability: 'Contradiction detection', others: '✕', redflag: '✓ Automatic' },
    { capability: 'Citation accuracy', others: 'Hallucinations', redflag: '✓ Verified against source' },
    { capability: 'Amendment awareness', others: '✕', redflag: '✓ Tracks superseded clauses' },
    { capability: 'Document hierarchy', others: '✕', redflag: '✓ Master → Amendment → Exhibit' },
    { capability: 'Data privacy', others: 'Cloud upload', redflag: '✓ Local parsing' },
    { capability: 'Time', others: 'Days', redflag: '✓ 20 minutes' },
  ]

  return (
    <section className="py-[100px]" id="why-redflag">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="caption">Why RedFlag</div>
        <h2 className="font-serif text-[36px] font-[400] leading-[1.2] max-md:text-[26px]" style={{ fontFamily: "'Instrument Serif', serif" }}>Not search. Not summary. Contradiction detection.</h2>
        <div className="overflow-x-auto mt-[48px]">
          <table className="w-full border-collapse border border-[var(--border)]">
            <thead>
              <tr>
                <th className="p-[16px_20px] text-left border border-[var(--border)] text-[11px] uppercase tracking-[1.5px] bg-[var(--bg-alt)]">Capability</th>
                <th className="p-[16px_20px] text-left border border-[var(--border)] text-[11px] uppercase tracking-[1.5px] bg-[var(--bg-alt)]">Others</th>
                <th className="p-[16px_20px] text-left border border-[var(--border)] text-[11px] uppercase tracking-[1.5px] bg-[var(--red-light)]">RedFlag</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="p-[16px_20px] text-left border border-[var(--border)] text-[14px]">{r.capability}</td>
                  <td className={`p-[16px_20px] text-left border border-[var(--border)] text-[14px] text-[var(--ink-muted)] ${r.others === '✕' ? '' : ''}`}>
                    <span className={r.others === '✕' ? '' : ''}>{r.others}</span>
                  </td>
                  <td className="p-[16px_20px] text-left border border-[var(--border)] text-[14px] bg-[var(--red-light)]">
                    <span className="text-[var(--success)]">{r.redflag}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
