import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loadBasicEvent, updateBasicEvent, updateBasicEventStatus } from '../services/accountlessEvent.js'

const LABELS = { yes: 'Oui', maybe: 'Peut-être', no: 'Non' }

export default function OrganiserManage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const slug = params.get('event') || ''
  const token = useMemo(() => new URLSearchParams(window.location.hash.slice(1)).get('token'), [])
  const [event, setEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title:'', host:'', description:'', date:'', time:'', location:'' })

  async function load() {
    if (!token || !slug) throw new Error('Ce lien de gestion est incomplet.')
    const data = await loadBasicEvent(slug, token)
    setEvent(data.event)
    setRsvps(data.guests || [])
    setForm({
      title:data.event.title || '', host:data.event.host || '', description:data.event.description || '',
      date:data.event.date || '', time:data.event.time || '', location:data.event.location || '',
    })
  }

  useEffect(() => {
    load().catch((loadError) => setError(loadError?.message || 'Impossible d’ouvrir cet espace de gestion.')).finally(() => setLoading(false))
  }, [slug, token])

  async function saveChanges(e) {
    e.preventDefault()
    setSaving(true); setError(''); setMessage('')
    try {
      const data = await updateBasicEvent(slug, token, form)
      setEvent(data.event)
      setEditing(false)
      setMessage('Les informations de l’événement ont été mises à jour.')
    } catch (saveError) {
      setError(saveError?.message || 'Impossible d’enregistrer les modifications.')
    } finally { setSaving(false) }
  }

  async function changeStatus(status) {
    setSaving(true); setError(''); setMessage('')
    try {
      const data = await updateBasicEventStatus(slug, token, status)
      setEvent(data.event)
      setMessage(status === 'published' ? 'L’événement est à nouveau publié.' : status === 'closed' ? 'Les réponses sont maintenant fermées.' : 'L’événement est archivé.')
    } catch (statusError) {
      setError(statusError?.message || 'Impossible de modifier le statut.')
    } finally { setSaving(false) }
  }

  if (loading) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p>Ouverture de ton espace organisateur…</p></section></div></main>
  if (error && !event) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><h1>Espace organisateur</h1><p className="cl-form-error">{error}</p><button className="cl-primary-button" type="button" onClick={() => navigate('/organiser')}>Créer un événement</button></section></div></main>

  const summary = rsvps.reduce((acc, rsvp) => { acc.total += 1; acc[rsvp.status] = (acc[rsvp.status] || 0) + 1; return acc }, { total:0, yes:0, maybe:0, no:0 })

  return <main className="cl-shell"><div className="cl-container"><section className="cl-panel">
    <p className="cl-eyebrow">Espace organisateur · accès Basic</p>
    <h1>{event.title}</h1>
    <p>Ton événement reste gérable sans créer de compte grâce à ton lien privé.</p>
    {error && <p className="cl-form-error" role="alert">{error}</p>}
    {message && <p className="cl-share-feedback" role="status">{message}</p>}

    <div className="cl-manage-status"><strong>Statut : {event.status === 'published' ? '🟢 Publié' : event.status === 'closed' ? '🟠 Fermé' : '⚪ Archivé'}</strong>
      {event.status !== 'published' && <button className="cl-small-button" disabled={saving} onClick={() => changeStatus('published')}>Publier</button>}
      {event.status === 'published' && <button className="cl-small-button" disabled={saving} onClick={() => changeStatus('closed')}>Fermer les réponses</button>}
      {event.status !== 'archived' && <button className="cl-small-button" disabled={saving} onClick={() => changeStatus('archived')}>Archiver</button>}
    </div>

    <div className="cl-manage-section">
      <div className="cl-list-heading"><div><h2>Informations</h2><span>Modifie ton événement à tout moment.</span></div><button className="cl-small-button" onClick={() => setEditing((value) => !value)}>{editing ? 'Annuler' : '✏️ Modifier'}</button></div>
      {editing ? <form className="cl-manage-form" onSubmit={saveChanges}>
        <label>Titre<input value={form.title} onChange={e => setForm({...form,title:e.target.value})} required /></label>
        <label>Organisateur<input value={form.host} onChange={e => setForm({...form,host:e.target.value})} required /></label>
        <label>Description<textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows="3" /></label>
        <label>Date<input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} /></label>
        <label>Heure<input type="time" value={form.time} onChange={e => setForm({...form,time:e.target.value})} /></label>
        <label>Lieu<input value={form.location} onChange={e => setForm({...form,location:e.target.value})} /></label>
        <button className="cl-primary-button" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</button>
      </form> : <div className="cl-event-info"><span>📅 {event.date || 'Date non définie'}</span>{event.time && <span>🕐 {event.time}</span>} {event.location && <span>📍 {event.location}</span>}</div>}
    </div>

    {event.mode === 'invitation' && <><div className="cl-rsvp-summary">
      <div><strong>{summary.total}</strong><span>Total</span></div><div><strong>{summary.yes}</strong><span>✅ Oui</span></div><div><strong>{summary.maybe}</strong><span>🤔 Peut-être</span></div><div><strong>{summary.no}</strong><span>❌ Non</span></div>
    </div>
    <div className="cl-rsvp-list"><h2>Réponses</h2>{rsvps.length === 0 ? <p className="cl-empty">Aucune réponse pour le moment.</p> : rsvps.map(rsvp => <article className="cl-rsvp-item" key={rsvp.id}><div><strong>{rsvp.name}</strong>{rsvp.message && <p>{rsvp.message}</p>}</div><span className={`cl-rsvp-status is-${rsvp.status}`}>{LABELS[rsvp.status]}</span></article>)}</div></>}

    <button className="cl-secondary-button" type="button" onClick={() => navigate(`/e/${event.slug}`)}>Voir l’événement public →</button>
  </section></div></main>
}
