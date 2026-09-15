export default function ComingSoon({ title = 'Bientôt disponible' }) {
  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-hero">
          <div className="cl-brand">{title}</div>
          <p className="cl-tagline">Cette expérience arrive dans la prochaine étape de CélébrationsLink.</p>
        </section>
      </div>
    </main>
  )
}
