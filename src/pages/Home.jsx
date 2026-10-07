import { useNavigate } from 'react-router-dom'
import MemberAccess from '../components/MemberAccess.jsx'

const examples = [
  { name: 'Josh · Birthday Night', meta: 'Audacieux · Musique · Photos' },
  { name: 'Juliette & Jules · Mariage', meta: 'Élégant · RSVP · Programme' },
  { name: 'Anna · Graduation', meta: 'Moderne · Confettis · Partage' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="cl-shell cl-home">
      <section className="cl-signature-hero" aria-labelledby="home-title">
        <div className="cl-hero-orbit" aria-hidden="true"><span/><span/><span/></div>
        <div className="cl-signature-hero__inner">
          <div className="cl-signature-copy">
            <span className="cl-signature-kicker">✦ La nouvelle façon de célébrer</span>
            <h1 id="home-title" className="cl-signature-title">
              Ne partage pas seulement un lien.<br />
              <em>Fais vivre le moment.</em>
            </h1>
            <p className="cl-signature-subtitle">
              CélébrationsLink transforme une annonce, une invitation ou un vœu en une vraie expérience digitale — belle à ouvrir, simple à partager et mémorable à vivre.
            </p>
            <div className="cl-signature-actions">
              <button className="cl-primary-button" type="button" onClick={() => navigate('/celebrer/type')}>Créer une célébration ✨</button>
              <button className="cl-secondary-button" type="button" onClick={() => navigate('/organiser')}>Organiser un événement →</button>
            </div>
            <div className="cl-signature-proof">
              <span>✓ Sans compte pour commencer</span><span>✓ Mobile-first</span><span>✓ Un seul lien</span>
            </div>
          </div>

          <div className="cl-hero-showcase" aria-label="Aperçu d'une expérience CélébrationsLink">
            <div className="cl-showcase-window">
              <div className="cl-showcase-window__top"><div className="cl-showcase-dots"><i/><i/><i/></div><span className="cl-showcase-chip">LIVE EXPERIENCE</span></div>
              <div className="cl-showcase-scene"><div className="cl-showcase-ring"/><div className="cl-showcase-orb"/></div>
              <div className="cl-showcase-copy">
                <small>Une soirée à retenir</small>
                <h2>Josh fête ses 25 ans.</h2>
                <p>Une invitation qui commence avant même l’arrivée des invités.</p>
                <div className="cl-showcase-tags"><span>RSVP</span><span>Countdown</span><span>Photos</span><span>Music</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MemberAccess />

      <section className="cl-home-bento" aria-labelledby="home-bento-title">
        <div className="cl-bento-intro">
          <div><p className="cl-eyebrow">Tout commence ici</p><h2 id="home-bento-title">Une idée. Une émotion. Une expérience.</h2></div>
          <p>Pas besoin de savoir designer. Tu choisis l’intention, CélébrationsLink t’aide à créer le reste.</p>
        </div>
        <div className="cl-bento-grid">
          <button className="cl-bento-card cl-bento-card--main" type="button" onClick={() => navigate('/celebrer/type')}>
            <span className="cl-bento-card__icon">💌</span><h3>Créer un vœu qui ne ressemble à aucun autre.</h3>
            <p>Message, ambiance, photos, musique, animations : compose une petite expérience pensée pour une personne précise.</p>
            <span className="cl-bento-card__arrow">↗</span><span className="cl-bento-card__spark"/>
          </button>
          <button className="cl-bento-card cl-bento-card--soft" type="button" onClick={() => navigate('/organiser/type?mode=invitation')}>
            <span className="cl-bento-card__icon">🪄</span><h3>Inviter autrement.</h3><p>Une invitation élégante, les détails essentiels et le RSVP réunis dans un seul espace.</p><span className="cl-bento-card__arrow">↗</span>
          </button>
          <button className="cl-bento-card cl-bento-card--warm" type="button" onClick={() => navigate('/organiser/type?mode=announcement')}>
            <span className="cl-bento-card__icon">📣</span><h3>Faire une annonce qui donne envie.</h3><p>Un événement mérite mieux qu’un message perdu dans un groupe.</p><span className="cl-bento-card__arrow">↗</span>
          </button>
        </div>
      </section>

      <section className="cl-example-strip" aria-labelledby="examples-title">
        <div className="cl-bento-intro"><div><p className="cl-eyebrow">Inspiration</p><h2 id="examples-title">Des univers, pas des formulaires.</h2></div><p>Chaque célébration doit pouvoir avoir sa propre personnalité.</p></div>
        <div className="cl-example-grid">
          {examples.map((example) => <article className="cl-example" key={example.name}><div className="cl-example__art"/><strong>{example.name}</strong><span>{example.meta}</span></article>)}
        </div>
      </section>

      <footer className="cl-footer">CélébrationsLink · Crée. Annonce. Invite. Célèbre. Partage. ❤️</footer>
    </main>
  )
}
