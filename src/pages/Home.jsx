import { useNavigate } from 'react-router-dom'
import MemberAccess from '../components/MemberAccess.jsx'

const inspirations = [
  {
    name: 'Josh · Birthday Night',
    meta: 'Festif · Musique · Photos',
    occasion: 'birthday',
    image: 'https://images.unsplash.com/photo-1544155891-969f15a055d3?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1400',
    alt: 'Une soirée d’anniversaire pleine d’énergie et de lumière',
  },
  {
    name: 'Maya & Elias · Mariage',
    meta: 'Élégant · Histoire · RSVP',
    occasion: 'wedding',
    image: 'https://images.unsplash.com/photo-1773688199519-0633dac25e3a?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1400',
    alt: 'Un couple souriant pendant une cérémonie de mariage',
  },
  {
    name: 'Aïcha · Graduation',
    meta: 'Fier · Moderne · Souvenirs',
    occasion: 'graduation',
    image: 'https://images.unsplash.com/photo-1748565630787-ab2532bfba54?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1400',
    alt: 'Une diplômée célèbre une nouvelle étape de sa vie',
  },
  {
    name: 'Lina · Bienvenue au monde',
    meta: 'Doux · Famille · Tendresse',
    occasion: 'birth',
    image: 'https://images.unsplash.com/photo-1770261430784-5e08c7b7c803?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1400',
    alt: 'Des parents partagent un moment tendre avec leur bébé',
  },
  {
    name: 'Noah & Inès · Engagement',
    meta: 'Romantique · Intime · Histoire',
    occasion: 'engagement',
    image: 'https://images.unsplash.com/photo-1726694064328-7105cec272e6?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1400',
    alt: 'Un couple heureux célèbre ses fiançailles',
  },
  {
    name: 'Koffi · Rooftop Night',
    meta: 'Énergique · Amis · Ambiance',
    occasion: 'party',
    image: 'https://images.unsplash.com/photo-1760783319065-d5b31a94b017?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1400',
    alt: 'Des invités célèbrent ensemble une soirée festive',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="cl-shell cl-home">
      <section className="cl-signature-hero" aria-labelledby="home-title">
        <div className="cl-hero-orbit" aria-hidden="true"><span/><span/><span/></div>
        <div className="cl-signature-hero__inner">
          <div className="cl-signature-copy">
            <span className="cl-signature-kicker">La nouvelle façon de célébrer</span>
            <h1 id="home-title" className="cl-signature-title">
              Ne partage pas seulement un lien.<br />
              <em>Fais vivre le moment.</em>
            </h1>
            <p className="cl-signature-subtitle">
              CélébrationsLink transforme une annonce, une invitation ou un vœu en une vraie expérience digitale — belle à ouvrir, simple à partager et mémorable à vivre.
            </p>
            <div className="cl-signature-actions">
              <button className="cl-primary-button" type="button" onClick={() => navigate('/celebrer/type')}>Créer une célébration</button>
              <button className="cl-secondary-button" type="button" onClick={() => navigate('/organiser')}>Organiser un événement</button>
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
            <span className="cl-bento-card__action">Créer mon vœu</span><span className="cl-bento-card__spark"/>
          </button>
          <button className="cl-bento-card cl-bento-card--soft" type="button" onClick={() => navigate('/organiser/type?mode=invitation')}>
            <span className="cl-bento-card__icon">🪄</span><h3>Inviter autrement.</h3><p>Une invitation élégante, les détails essentiels et le RSVP réunis dans un seul espace.</p><span className="cl-bento-card__action">Créer une invitation</span>
          </button>
          <button className="cl-bento-card cl-bento-card--warm" type="button" onClick={() => navigate('/organiser/type?mode=announcement')}>
            <span className="cl-bento-card__icon">📣</span><h3>Faire une annonce qui donne envie.</h3><p>Un événement mérite mieux qu’un message perdu dans un groupe.</p><span className="cl-bento-card__action">Créer une annonce</span>
          </button>
        </div>
      </section>

      <section className="cl-example-strip" aria-labelledby="examples-title">
        <div className="cl-bento-intro">
          <div><p className="cl-eyebrow">Inspiration</p><h2 id="examples-title">Des univers, pas des formulaires.</h2></div>
          <p>Chaque occasion peut prendre une direction visuelle différente. Explore quelques possibilités.</p>
        </div>
        <div className="cl-example-grid">
          {inspirations.map((example) => (
            <button
              className="cl-example"
              key={example.name}
              type="button"
              onClick={() => navigate(`/celebrer/type?occasion=${example.occasion}`)}
              aria-label={`Créer une célébration inspirée de : ${example.name}`}
            >
              <span className="cl-example__art">
                <img src={example.image} alt={example.alt} loading="lazy" />
                <span className="cl-example__shade" />
                <span className="cl-example__action">S’inspirer</span>
              </span>
              <span className="cl-example__body">
                <strong>{example.name}</strong>
                <span>{example.meta}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer className="cl-footer">CélébrationsLink · Crée. Annonce. Invite. Célèbre. Partage. ❤️</footer>
    </main>
  )
}
