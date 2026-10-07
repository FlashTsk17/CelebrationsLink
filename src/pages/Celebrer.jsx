import { useNavigate } from 'react-router-dom'

export default function Celebrer() {
  const navigate = useNavigate()
  return (
    <main className="cl-shell">
      <section className="cl-signature-hero" style={{minHeight:'auto',paddingTop:'76px'}}>
        <div className="cl-signature-hero__inner">
          <div className="cl-signature-copy">
            <span className="cl-signature-kicker">💌 Célébrer</span>
            <h1 className="cl-signature-title">Un message peut devenir <em>un moment.</em></h1>
            <p className="cl-signature-subtitle">Crée une expérience personnelle en quelques étapes : une intention, une ambiance, des souvenirs, puis un lien à partager.</p>
            <div className="cl-signature-actions"><button className="cl-primary-button" type="button" onClick={() => navigate('/celebrer/type')}>Commencer ✨</button><button className="cl-secondary-button" type="button" onClick={() => navigate('/organiser')}>Organiser un événement →</button></div>
          </div>
          <div className="cl-hero-showcase"><div className="cl-showcase-window"><div className="cl-showcase-scene"><div className="cl-showcase-ring"/><div className="cl-showcase-orb"/></div><div className="cl-showcase-copy"><small>PERSONAL EXPERIENCE</small><h2>Anna reçoit un message qu’elle n’oubliera pas.</h2><p>Un univers visuel, une musique, quelques souvenirs et ton message au centre.</p></div></div></div>
        </div>
      </section>
      <section className="cl-example-strip"><div className="cl-bento-intro"><div><p className="cl-eyebrow">Le principe</p><h2>Simple à créer. Fort à vivre.</h2></div></div><div className="cl-example-grid"><article className="cl-example"><div className="cl-example__art"/><strong>1 · Choisis l’occasion</strong><span>Anniversaire, mariage, réussite, naissance, fête…</span></article><article className="cl-example"><div className="cl-example__art"/><strong>2 · Compose l’ambiance</strong><span>Style, message, photos, musique et animations.</span></article><article className="cl-example"><div className="cl-example__art"/><strong>3 · Partage l’expérience</strong><span>Un lien unique à envoyer par WhatsApp ou ailleurs.</span></article></div></section>
    </main>
  )
}
