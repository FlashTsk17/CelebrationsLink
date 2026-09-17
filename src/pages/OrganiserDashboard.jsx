import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getEventBySlug } from '../services/eventService.js'
import { getRsvpSummary, listRsvps, RSVP_STATUS } from '../services/rsvp.js'

const LABELS = {
  [RSVP_STATUS.YES]: 'Oui',
  [RSVP_STATUS.MAYBE]: 'Peut-être',
  [RSVP_STATUS.NO]: 'Non',
}

export default function OrganiserDashboard() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const slug = params.get('event')
  const [event, setEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [summary, setSummary] = useState({ total: 0, yes: 0, maybe: 0, no: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      if (!slug) {
        setError('Aucun événement n’a été indiqué.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const loadedEvent = await getEventBySlug(slug)
        if (!loadedEvent) {
          if (active) setError('Impossible de trouver cet événement sur cet appareil.')
          return
        }

        const loadedRsvps = loadedEvent.mode === 'invitation' ? await listRsvps(loadedEvent.id) : []
        const loadedSummary = loadedEvent.mode === 'invitation'
          ? await getRsvpSummary(loadedEvent.id)
          : { total: 0, yes: 0, maybe: 0, no: 0 }

        if (active) {
          setEvent(loadedEvent)
          setRsvps(loadedRsvps)
          setSummary(loadedSummary)
        }
      } catch (loadError) {
        if (active) setError(loadError?.message || 'Impossible de charger l’espace organisateur.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [slug])

  if (loading) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p>Chargement de ton espace organisateur…</p></section></div></main>
  }

  if (error || !event) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel">
      <p className="cl-eyebrow">Espace organisateur</p>
      <h1>Événement introuvable</h1>
      <p>{error || 'Impossible de trouver cet événement.'}</p>
      <button className="cl-primary-button" type="button" onClick={() => navigate('/organiser')}>Créer un événement</button>
    </section></div></main>
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-panel">
          <p className="cl-eyebrow">Espace organisateur</p>
          <h1>{event.title}</h1>
          <p>{event.mode === 'invitation' ? 'Voici les réponses reçues pour ton invitation.' : 'Ton annonce est prête à être partagée.'}</p>

          {event.mode === 'invitation' && (
            <>
              <div className="cl-rsvp-summary">
                <div><strong>{summary.total}</strong><span>Total</span></div>
                <div><strong>{summary.yes}</strong><span>✅ Oui</span></div>
                <div><strong>{summary.maybe}</strong><span>🤔 Peut-être</span></div>
                <div><strong>{summary.no}</strong><span>❌ Non</span></div>
              </div>

              <div className="cl-rsvp-list">
                <h2>Invités</h2>
                {rsvps.length === 0 ? (
                  <p className="cl-empty">Aucune réponse pour le moment. Partage ton invitation pour commencer à recevoir des réponses.</p>
                ) : (
                  rsvps.map((rsvp) => (
                    <article className="cl-rsvp-item" key={rsvp.id}>
                      <div>
                        <strong>{rsvp.name}</strong>
                        {rsvp.message && <p>{rsvp.message}</p>}
                      </div>
                      <span className={`cl-rsvp-status is-${rsvp.status}`}>{LABELS[rsvp.status]}</span>
                    </article>
                  ))
                )}
              </div>
            </>
          )}

          <button className="cl-secondary-button" type="button" onClick={() => navigate(`/e/${event.slug}`)}>Voir l’événement public →</button>
        </section>
      </div>
    </main>
  )
}
