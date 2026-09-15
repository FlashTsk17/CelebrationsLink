import { useMemo } from 'react'
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
  const event = useMemo(() => getEventBySlug(slug), [slug])
  const rsvps = useMemo(() => (event ? listRsvps(event.id) : []), [event])
  const summary = useMemo(() => (event ? getRsvpSummary(event.id) : null), [event, rsvps.length])

  if (!event) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><h1>Événement introuvable</h1><p>Impossible de trouver cet événement sur cet appareil.</p><button className="cl-primary-button" type="button" onClick={() => navigate('/organiser')}>Créer un événement</button></section></div></main>
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-panel">
          <p className="cl-eyebrow">Espace organisateur</p>
          <h1>{event.title}</h1>
          <p>Voici les réponses reçues pour ton invitation.</p>

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

          <button className="cl-secondary-button" type="button" onClick={() => navigate(`/e/${event.slug}`)}>Voir l’invitation publique →</button>
        </section>
      </div>
    </main>
  )
}
