export default function RsvpSummary({ summary }) {
  if (!summary) return null

  return (
    <section className="cl-rsvp-summary" aria-label="Résumé des réponses">
      <div><strong>{summary.yes}</strong><span>Présent(s)</span></div>
      <div><strong>{summary.maybe}</strong><span>Peut-être</span></div>
      <div><strong>{summary.no}</strong><span>Absent(s)</span></div>
      <div><strong>{summary.total}</strong><span>Total</span></div>
    </section>
  )
}
