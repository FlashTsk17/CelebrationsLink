import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EVENT_TYPES } from '../data/eventTypes.js'
import { CELEBRATION_TEMPLATES } from '../data/celebrationTemplates.js'
import { createCelebration } from '../services/celebrationService.js'

export default function CelebrationCreate() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    occasion: params.get('occasion') || 'birthday',
    recipient: '',
    sender: '',
    title: '',
    message: '',
    template: 'classic',
    animations: true,
  })
  const [created, setCreated] = useState(null)

  const selectedType = useMemo(
    () => EVENT_TYPES.find((type) => type.id === form.occasion),
    [form.occasion],
  )

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const submit = (event) => {
    event.preventDefault()
    if (!form.recipient.trim() || !form.message.trim()) return
    const celebration = createCelebration({
      ...form,
      title: form.title.trim() || `${selectedType?.label || 'Célébration'} pour ${form.recipient.trim()}`,
    })
    setCreated(celebration)
  }

  if (created) {
    const publicPath = `/c/${created.slug}`
    return (
      <main className="cl-shell">
        <div className="cl-container">
          <section className="cl-panel cl-success-panel">
            <p className="cl-eyebrow">🎉 C’est prêt !</p>
            <h1>Ton vœu a été créé.</h1>
            <p>Un simple lien suffit maintenant pour le partager.</p>
            <div className="cl-link-box">{window.location.origin}{publicPath}</div>
            <div className="cl-grid">
              <button className="cl-primary-button" type="button" onClick={() => navigate(publicPath)}>Voir ma célébration →</button>
              <button className="cl-secondary-button" type="button" onClick={() => navigator.clipboard?.writeText(window.location.origin + publicPath)}>Copier le lien</button>
              <button className="cl-secondary-button" type="button" onClick={() => navigate('/')}>Retour à l’accueil</button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-panel">
          <p className="cl-eyebrow">💌 Créer un vœu · Sans compte</p>
          <h1>Fais plaisir en quelques instants.</h1>
          <p>Renseigne l’essentiel, choisis une ambiance et partage ton lien.</p>

          <form className="cl-form" onSubmit={submit}>
            <label>Occasion
              <select value={form.occasion} onChange={(e) => update('occasion', e.target.value)}>
                {EVENT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.emoji} {type.label}</option>)}
              </select>
            </label>

            <div className="cl-form-grid">
              <label>À qui s’adresse le vœu ? *
                <input value={form.recipient} onChange={(e) => update('recipient', e.target.value)} placeholder="Ex. Nadia" required />
              </label>
              <label>Ton prénom
                <input value={form.sender} onChange={(e) => update('sender', e.target.value)} placeholder="Ex. Tsadok" />
              </label>
            </div>

            <label>Titre
              <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Ex. Joyeux anniversaire Nadia 🎂" />
            </label>

            <label>Ton message *
              <textarea value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Écris ton message ici…" rows="7" required />
            </label>

            <fieldset>
              <legend>Choisis ton ambiance</legend>
              <div className="cl-template-grid">
                {CELEBRATION_TEMPLATES.map((template) => (
                  <button key={template.id} type="button" className={`cl-template-card ${form.template === template.id ? 'is-selected' : ''}`} onClick={() => update('template', template.id)}>
                    <strong>{template.name}</strong>
                    <span>{template.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="cl-checkbox">
              <input type="checkbox" checked={form.animations} onChange={(e) => update('animations', e.target.checked)} />
              <span>Activer les animations ✨</span>
            </label>

            <button className="cl-primary-button" type="submit">Créer ma célébration 🎉</button>
          </form>
        </section>
      </div>
    </main>
  )
}
