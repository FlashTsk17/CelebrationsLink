import { useNavigate } from 'react-router-dom'
import ActionCard from '../components/ActionCard.jsx'

export default function Celebrer() {
  const navigate = useNavigate()
  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-hero">
          <div className="cl-brand">Envoyer un vœu</div>
          <p className="cl-tagline">Crée une belle expérience digitale pour quelqu’un que tu veux célébrer. Pas besoin de compte.</p>
        </section>
        <section className="cl-grid">
          <ActionCard emoji="🎂" title="Choisir une occasion" description="Anniversaire, mariage, naissance, réussite et bien plus." onClick={() => navigate('/celebrer/type')} />
          <ActionCard emoji="🌍" title="Célébrations du moment" description="Découvre les occasions universelles et prépare un vœu à partager." onClick={() => navigate('/celebrer/type')} />
        </section>
        <div className="cl-footer">Un lien suffit pour faire plaisir. ✨</div>
      </div>
    </main>
  )
}
