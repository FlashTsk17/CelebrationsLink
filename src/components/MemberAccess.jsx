import { useEffect, useState } from 'react'
import AuthModal from './AuthModal.jsx'
import { getCurrentUser, onAuthStateChange, signOutMember } from '../services/auth.js'

export default function MemberAccess() {
  const [user, setUser] = useState(null)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    let active = true
    getCurrentUser().then((current) => { if (active) setUser(current) })
    const unsubscribe = onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => { active = false; unsubscribe() }
  }, [])

  if (user) return (
    <div className="cl-member-access cl-member-access--signed">
      <span className="cl-member-badge">✦ Membre</span>
      <strong>{user.user_metadata?.display_name || user.email}</strong>
      <button className="cl-secondary-button" type="button" onClick={() => signOutMember()}>Se déconnecter</button>
    </div>
  )

  return (
    <>
      <div className="cl-member-access cl-member-access--hero">
        <div><span className="cl-member-badge">Espace gratuit</span><strong>Garde tes créations avec toi.</strong><span>Crée un compte quand tu veux, sans bloquer la création.</span></div>
        <div className="cl-member-access__actions">
          <button className="cl-primary-button" type="button" onClick={() => setModal('signup')}>Créer mon compte</button>
          <button className="cl-auth-link" type="button" onClick={() => setModal('signin')}>J’ai déjà un compte</button>
        </div>
      </div>
      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onSuccess={(current) => { setUser(current); setModal(null) }} />}
    </>
  )
}
