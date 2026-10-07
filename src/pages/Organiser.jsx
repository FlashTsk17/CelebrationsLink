import { useNavigate } from 'react-router-dom'

const formats = [
  { icon:'📣', title:'Annonce', text:'Présente ton événement avec une page qui donne envie de venir.', mode:'announcement', tone:'soft' },
  { icon:'💌', title:'Invitation', text:'Crée une expérience complète avec date, lieu et RSVP.', mode:'invitation', tone:'main' },
]

export default function Organiser() {
  const navigate = useNavigate()
  return (
    <main className="cl-shell">
      <section className="cl-signature-hero" style={{minHeight:'auto',paddingTop:'76px'}}>
        <div className="cl-signature-hero__inner">
          <div className="cl-signature-copy">
            <span className="cl-signature-kicker">📍 Organiser</span>
            <h1 className="cl-signature-title">Ton événement mérite <em>son propre univers.</em></h1>
            <p className="cl-signature-subtitle">Choisis ton intention. Nous transformons ensuite les informations en une expérience claire, élégante et partageable.</p>
          </div>
          <div className="cl-hero-showcase">
            <div className="cl-showcase-window">
              <div className="cl-showcase-scene"><div className="cl-showcase-ring"/><div className="cl-showcase-orb"/></div>
              <div className="cl-showcase-copy"><small>INVITATION</small><h2>Une entrée qui donne le ton.</h2><p>Les invités découvrent le lieu, le programme et répondent sans quitter la page.</p></div>
            </div>
          </div>
        </div>
      </section>
      <section className="cl-home-bento">
        <div className="cl-bento-intro"><div><p className="cl-eyebrow">Choisir un format</p><h2>Deux façons de commencer.</h2></div><p>Tu pourras ensuite choisir l’occasion et personnaliser les informations.</p></div>
        <div className="cl-bento-grid">
          {formats.map((item) => <button key={item.mode} className={'cl-bento-card ' + (item.tone === 'main' ? 'cl-bento-card--main' : 'cl-bento-card--soft')} type="button" onClick={() => navigate('/organiser/type?mode=' + item.mode)}><span className="cl-bento-card__icon">{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p><span className="cl-bento-card__arrow">↗</span></button>)}
          <button className="cl-bento-card cl-bento-card--warm" type="button" onClick={() => navigate('/celebrer/type')}><span className="cl-bento-card__icon">💫</span><h3>Plutôt un vœu ?</h3><p>Change de parcours sans perdre ton idée.</p><span className="cl-bento-card__arrow">↗</span></button>
        </div>
      </section>
    </main>
  )
}
