import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MemberAccess from '../components/MemberAccess.jsx'
import { getCurrentUser } from '../services/auth.js'

export default function Membre() {
  const navigate = useNavigate()
  const [user, setUser] = useState(undefined)

  useEffect(() => { getCurrentUser().then(setUser) }, [])

  if (user === undefined) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p>Ouverture de ton espace Membre…</p></section></div></main>
  }

  if (!user) {
    return (
      <main className="cl-shell">
        <div className="cl-container">
          <section className="cl-panel">
            <p className="cl-eyebrow">Espace Membre 🔵</p>
            <h1>Ton espace personnel</h1>
            <p>Crée un compte gratuitement pour retrouver tes créations et continuer sur plusieurs appareils.</p>
            <MemberAccess />
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-panel">
          <p className="cl-eyebrow">Bienvenue dans ton espace Membre 🔵</p>
          <h1>{user.user_metadata?.display_name || 'Mon espace'}</h1>
          <p>{user.email}</p>
          <div className="cl-grid">
            <button className="cl-action-card" type="button" onClick={() => navigate('/organiser')}><span className="cl-action-card__emoji">🎉</span><span className="cl-action-card__body"><strong>Créer un événement</strong><span>Annonce ou invitation.</span></span><span>→</span></button>
            <button className="cl-action-card" type="button" onClick={() => navigate('/celebrer')}><span className="cl-action-card__emoji">💌</span><span className="cl-action-card__body"><strong>Créer un vœu</strong><span>Prépare une célébration personnalisée.</span></span><span>→</span></button>
          </div>
          <div className="cl-member-placeholder"><strong>Mes créations</strong><p>L’historique connecté sera branché ici à la prochaine étape, avec tes événements et célébrations enregistrés.</p></div>
        </section>
      </div>
    </main>
  )
}
