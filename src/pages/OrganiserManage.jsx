import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loadBasicEvent } from '../services/accountlessEvent.js'

const LABELS = { yes: 'Oui', maybe: 'Peut-être', no: 'Non' }

export default function OrganiserManage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const slug = params.get('event') || ''
  const token = useMemo(() => new URLSearchParams(window.location.hash.slice(1)).get('token'), [])
  const [event, setEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !slug) {
      setError('Ce lien de gestion est incomplet.')
      setLoading(false)
      return
    }
    loadBasicEvent(slug, token)
      .then((data) => { setEvent(data.event); setRsvps(data.guests || []) })
      .catch((loadError) => setError(loadError?.message || 'Impossible d’ouvrir cet espace de gestion.'))
      .finally(() => setLoading(false))
  }, [slug, token])

  if (loading) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p>Ouverture de ton espace organisateur…</p></section></div></main>
  if (error || !event) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><h1>Espace organisateur</h1><p className="cl-form-error">{error || 'Événement introuvable.'}</p><button className="cl-primary-button" type="button" onClick={() => navigate('/organiser')}>Créer un événement</button></section></div></main>

  const summary = rsvps.reduce((acc, rsvp) => {
    acc.total += 1
    acc[rsvp.status] = (acc[rsvp.status] || 0) + 1
    return acc
  }, { total: 0, yes: 0, maybe: 0, no: 0 })

  return <main className="cl-shell"><div className="cl-container"><section className="cl-panel">
    <p className="cl-eyebrow">Espace organisateur · accès Basic</p>
    <h1>{event.title}</h1>
    <p>Ton événement reste gérable sans créer de compte grâce à ton lien privé.</p>
    {event.mode === 'invitation' && <div className="cl-rsvp-summary">
      <div><strong>{summary.total}</strong><span>Total</span></div><div><strong>{summary.yes}</strong><span>✅ Oui</span></div><div><strong>{summary.maybe}</strong><span>🤔 Peut-être</span></div><div><strong>{summary.no}</strong><span>❌ Non</span></div>
    </div>}
    {event.mode === 'invitation' && <div className="cl-rsvp-list"><h2>Réponses</h2>{rsvps.length === 0 ? <p className="cl-empty">Aucune réponse pour le moment.</p> : rsvps.map((rsvp) => <article className="cl-rsvp-item" key={rsvp.id}><div><strong>{rsvp.name}</strong>{rsvp.message && <p>{rsvp.message}</p>}</div><span className={`cl-rsvp-status is-${rsvp.status}`}>{LABELS[rsvp.status]}</span></article>)}</div>}
    <button className="cl-secondary-button" type="button" onClick={() => navigate(`/e/${event.slug}`)}>Voir l’événement public →</button>
  </section></div></main>
}
