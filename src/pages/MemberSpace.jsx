import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, onAuthStateChange, signOutMember } from '../services/auth.js'
import { listMyEvents } from '../services/eventService.js'

export default function MemberSpace() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      const currentUser = await getCurrentUser()
      if (!active) return
      if (!currentUser) {
        navigate('/membre?auth=login', { replace: true })
        return
      }
      setUser(currentUser)
      try {
        setEvents(await listMyEvents())
      } catch (loadError) {
        setError(loadError?.message || 'Impossible de charger tes créations.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    const unsubscribe = onAuthStateChange((_, session) => {
      if (!session) navigate('/membre?auth=login', { replace: true })
      else setUser(session.user)
    })
    return () => { active = false; unsubscribe() }
  }, [navigate])

  const logout = async () => {
    await signOutMember()
    navigate('/')
  }

  if (loading) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p>Ouverture de ton espace membre…</p></section></div></main>

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-panel">
          <p className="cl-eyebrow">Membre 🔵</p>
          <h1>Mon espace</h1>
          <p>Retrouve ici les événements créés avec ton compte.</p>
          <p><strong>{user?.user_metadata?.display_name || user?.email}</strong></p>

          {error && <p className="cl-form-error" role="alert">{error}</p>}

          <div className="cl-grid">
            <button className="cl-action-card" type="button" onClick={() => navigate('/organiser')}>
              <span className="cl-action-card__emoji">🎉</span>
              <span className="cl-action-card__body"><strong>Créer un événement</strong><span>Annonce ou invitation.</span></span>
              <span className="cl-action-card__arrow">→</span>
            </button>
          </div>

          <section className="cl-rsvp-list">
            <h2>Mes créations</h2>
            {events.length === 0 ? <p className="cl-empty">Tu n’as pas encore de création liée à ce compte.</p> : events.map((event) => (
              <article className="cl-rsvp-item" key={event.id}>
                <div><strong>{event.title}</strong><p>{event.mode === 'invitation' ? '💌 Invitation' : '📢 Annonce'}</p></div>
                <button className="cl-secondary-button" type="button" onClick={() => navigate(`/e/${event.slug}`)}>Voir →</button>
              </article>
            ))}
          </section>

          <button className="cl-secondary-button" type="button" onClick={logout}>Se déconnecter</button>
        </section>
      </div>
    </main>
  )
}
