import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getEventType } from '../data/eventTypes.js'
import { createEvent, getEventPublicPath } from '../services/eventService.js'

export default function EventForm({ mode }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const typeId = params.get('type') || sessionStorage.getItem('cl:event-type') || 'other'
  const type = useMemo(() => getEventType(typeId), [typeId])
  const [form, setForm] = useState({ title: '', host: '', description: '', date: '', time: '', location: '' })
  const [error, setError] = useState('')

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) return setError('Donne un titre à ton événement.')
    if (!form.host.trim()) return setError('Indique qui organise l’événement.')
    if (mode === 'invitation' && (!form.date || !form.time || !form.location.trim())) {
      return setError('Pour une invitation, la date, l’heure et le lieu sont obligatoires.')
    }

    const created = createEvent({ ...form, type: typeId, mode })
    sessionStorage.removeItem('cl:event-type')
    navigate(mode === 'invitation' ? `/organiser/dashboard?event=${encodeURIComponent(created.slug)}` : getEventPublicPath(created))
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-panel">
          <p className="cl-eyebrow">{mode === 'invitation' ? 'Invitation' : 'Annonce'} · {type?.emoji} {type?.label}</p>
          <h1>{mode === 'invitation' ? 'Créer ton invitation' : 'Créer ton annonce'}</h1>
          <p>{mode === 'invitation' ? 'Donne à tes invités toutes les informations utiles.' : 'Présente ton événement simplement et partage le lien.'}</p>

          <form className="cl-form" onSubmit={submit}>
            <label>Titre de l’événement<input value={form.title} onChange={update('title')} placeholder="Ex. Mariage de Sarah & David" required /></label>
            <label>Organisé par<input value={form.host} onChange={update('host')} placeholder="Ex. La famille ADIDO" required /></label>
            <label>Description<textarea value={form.description} onChange={update('description')} placeholder="Quelques mots pour présenter l’événement…" rows="4" /></label>
            <div className="cl-form-row">
              <label>Date<input type="date" value={form.date} onChange={update('date')} required={mode === 'invitation'} /></label>
              <label>Heure<input type="time" value={form.time} onChange={update('time')} required={mode === 'invitation'} /></label>
            </div>
            <label>Lieu {mode === 'invitation' && <span>(obligatoire)</span>}<input value={form.location} onChange={update('location')} placeholder="Ex. Salle des fêtes, Cotonou" required={mode === 'invitation'} /></label>
            {error && <p className="cl-form-error" role="alert">{error}</p>}
            <button className="cl-primary-button" type="submit">Créer et continuer →</button>
          </form>
        </section>
      </div>
    </main>
  )
}
