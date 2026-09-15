import { useNavigate } from 'react-router-dom'
import ActionCard from '../components/ActionCard.jsx'

export default function Organiser() {
  const navigate = useNavigate()
  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-hero">
          <div className="cl-brand">Organiser un événement</div>
          <p className="cl-tagline">Choisis le format qui correspond à ton événement. Tu peux annoncer simplement ou envoyer une véritable invitation avec RSVP.</p>
        </section>
        <section className="cl-grid">
          <ActionCard emoji="📢" title="Créer une annonce" description="Présente ton événement et partage l'information. Sans RSVP." onClick={() => navigate('/organiser/annonce')} />
          <ActionCard emoji="💌" title="Créer une invitation" description="Crée une invitation complète avec date, lieu et réponses des invités." onClick={() => navigate('/organiser/invitation')} />
        </section>
        <div className="cl-footer">CélébrationsLink · Crée. Annonce. Invite. Célèbre. Partage. ❤️</div>
      </div>
    </main>
  )
}
