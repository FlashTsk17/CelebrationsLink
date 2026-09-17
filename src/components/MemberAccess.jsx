import { useEffect, useState } from 'react'
import AuthModal from './AuthModal.jsx'
import { getCurrentUser, onAuthStateChange, signOutMember } from '../services/auth.js'

export default function MemberAccess() {
  const [user, setUser] = useState(null)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    let active = true
    getCurrentUser().then((currentUser) => { if (active) setUser(currentUser) })
    const unsubscribe = onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => { active = false; unsubscribe() }
  }, [])

  if (user) {
    return (
      <div className="cl-member-access">
        <span>🔵 Membre</span>
        <strong>{user.user_metadata?.display_name || user.email}</strong>
        <button className="cl-secondary-button" type="button" onClick={() => signOutMember()}>Se déconnecter</button>
      </div>
    )
  }

  return (
    <>
      <div className="cl-member-access">
        <span>Tu veux retrouver tes créations plus tard ?</span>
        <button className="cl-secondary-button" type="button" onClick={() => setModal('signup')}>Créer mon compte gratuitement</button>
        <button className="cl-auth-link" type="button" onClick={() => setModal('signin')}>Se connecter</button>
      </div>
      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onSuccess={(currentUser) => { setUser(currentUser); setModal(null) }} />}
    </>
  )
}
