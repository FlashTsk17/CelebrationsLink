import { useNavigate } from 'react-router-dom'
import { EVENT_TYPES, UNIVERSAL_OCCASIONS } from '../data/eventTypes.js'
import ActionCard from '../components/ActionCard.jsx'

export default function CelebrationType() {
  const navigate = useNavigate()
  const choose = (occasion) => navigate(`/celebrer/personnaliser?occasion=${encodeURIComponent(occasion)}`)
  const goHome = () => navigate('/')

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-hero">
          <div className="cl-brand">Choisir une occasion</div>
          <p className="cl-tagline">Choisis ce que tu veux célébrer, puis crée ton expérience en quelques minutes.</p>
        </section>

        <button className="cl-secondary-button cl-back-button" type="button" onClick={goHome}>← Accueil</button>

        <section>
          <h2 className="cl-section-title">🎉 Occasions personnelles</h2>
          <div className="cl-grid">
            {EVENT_TYPES.map((type) => (
              <ActionCard key={type.id} emoji={type.emoji} title={type.label} description="Créer une célébration personnalisée" onClick={() => choose(type.id)} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="cl-section-title">🌍 Occasions universelles</h2>
          <div className="cl-grid">
            {UNIVERSAL_OCCASIONS.map((occasion) => (
              <ActionCard key={occasion.id} emoji={occasion.emoji} title={occasion.label} description="Créer un vœu à partager" onClick={() => choose(occasion.id)} />
            ))}
          </div>
          <p className="cl-section-note">Ces occasions sont disponibles toute l’année pour créer et partager un vœu.</p>
          </div>
        </section>

        <button className="cl-secondary-button" type="button" onClick={() => navigate('/celebrer')}>← Retour à Célébrer</button>
      </div>
    </main>
  )
}
