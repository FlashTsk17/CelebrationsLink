import { useNavigate } from 'react-router-dom'
import ActionCard from '../components/ActionCard.jsx'

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-hero">
          <div className="cl-brand">CélébrationsLink</div>
          <p className="cl-tagline">Crée. Annonce. Invite. Célèbre. Partage. ❤️<br />Des expériences digitales simples et mémorables pour tous les moments qui comptent.</p>
        </section>

        <section>
          <h2 className="cl-section-title">Que veux-tu faire ?</h2>
          <div className="cl-grid">
            <ActionCard emoji="🎉" title="Organiser un événement" description="Annonce ton événement ou crée une invitation avec RSVP." onClick={() => navigate('/organiser')} />
            <ActionCard emoji="💌" title="Envoyer un vœu" description="Crée une célébration digitale personnalisée et partage-la par un simple lien." onClick={() => navigate('/celebrer')} />
          </div>
        </section>

        <section>
          <h2 className="cl-section-title">Célébrations du moment</h2>
          <div className="cl-grid">
            <ActionCard emoji="🌍" title="Occasions universelles" description="Noël, Nouvel An, Fête des Mères, Aïd, Saint-Valentin et autres occasions." onClick={() => navigate('/celebrer/type')} />
          </div>
        </section>

        <div className="cl-footer">CélébrationsLink · Une création de Tsk’s Tech Services · Cotonou, Bénin</div>
      </div>
    </main>
  )
}
