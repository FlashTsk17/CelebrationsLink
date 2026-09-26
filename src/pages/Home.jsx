import { useNavigate } from 'react-router-dom'
import ActionCard from '../components/ActionCard.jsx'
import MemberAccess from '../components/MemberAccess.jsx'
import '../styles/home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="cl-shell cl-home">
      <section className="cl-home-hero" aria-labelledby="home-title">
        <span className="cl-home-hero__eyebrow">✨ Des moments qui méritent d’être célébrés</span>
        <h1 id="home-title" className="cl-home-hero__title">
          Crée des expériences qui restent <strong>dans les mémoires.</strong>
        </h1>
        <p className="cl-home-hero__subtitle">
          Crée, annonce, invite, célèbre et partage simplement. CélébrationsLink transforme chaque occasion en une expérience digitale personnalisée et mémorable.
        </p>
      </section>

      <div className="cl-container">
        <MemberAccess />

        <section aria-labelledby="home-actions-title">
          <h2 id="home-actions-title" className="cl-section-title">Que veux-tu faire ?</h2>
          <div className="cl-home-actions">
            <ActionCard
              emoji="🎉"
              title="Organiser un événement"
              description="Annonce ton événement ou crée une invitation avec RSVP."
              onClick={() => navigate('/organiser')}
            />
            <ActionCard
              emoji="💌"
              title="Envoyer un vœu"
              description="Crée une célébration digitale personnalisée et partage-la par un simple lien."
              onClick={() => navigate('/celebrer')}
            />
          </div>
        </section>

        <section aria-labelledby="home-occasions-title">
          <h2 id="home-occasions-title" className="cl-section-title">Célébrations du moment</h2>
          <div className="cl-home-actions">
            <ActionCard
              emoji="🌍"
              title="Occasions universelles"
              description="Noël, Nouvel An, Fête des Mères, Aïd, Saint-Valentin et autres occasions."
              onClick={() => navigate('/celebrer/type')}
            />
          </div>
        </section>

        <footer className="cl-footer">CélébrationsLink · Une création de Tsk’s Tech Services · Cotonou, Bénin</footer>
      </div>
    </main>
  )
}
