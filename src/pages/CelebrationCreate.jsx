import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EVENT_TYPES } from '../data/eventTypes.js'
import { CELEBRATION_TEMPLATES } from '../data/celebrationTemplates.js'
import { createCelebration } from '../services/celebrationService.js'

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function CelebrationCreate() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ occasion: params.get('occasion') || 'birthday', recipient: '', sender: '', title: '', message: '', template: 'classic', animations: true })
  const [photos, setPhotos] = useState([])
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')
  const selectedType = useMemo(() => EVENT_TYPES.find((type) => type.id === form.occasion), [form.occasion])
  const selectedTemplate = useMemo(() => CELEBRATION_TEMPLATES.find((template) => template.id === form.template) || CELEBRATION_TEMPLATES[0], [form.template])
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handlePhotos = async (event) => {
    setError('')
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/')).slice(0, 5)
    try { setPhotos(await Promise.all(files.map(readImage))) } catch { setError('Impossible de charger les photos. Essaie avec d’autres images.') }
  }

  const submit = (event) => {
    event.preventDefault()
    if (!form.recipient.trim() || !form.message.trim()) { setError('Indique au moins le destinataire et ton message.'); return }
    const celebration = createCelebration({ ...form, photos, title: form.title.trim() || `${selectedType?.label || 'Célébration'} pour ${form.recipient.trim()}` })
    setCreated(celebration)
  }

  if (created) {
    const publicPath = `/c/${created.slug}`
    const share = async () => {
      const url = window.location.origin + publicPath
      if (navigator.share) await navigator.share({ title: created.title, text: `Une célébration pour ${created.recipient} ❤️`, url })
      else await navigator.clipboard?.writeText(url)
    }
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel cl-success-panel"><p className="cl-eyebrow">🎉 C’est prêt !</p><h1>Ton vœu a été créé.</h1><p>Un simple lien suffit maintenant pour le partager.</p><div className="cl-link-box">{window.location.origin}{publicPath}</div><div className="cl-grid"><button className="cl-primary-button" type="button" onClick={() => navigate(publicPath)}>Voir ma célébration →</button><button className="cl-secondary-button" type="button" onClick={share}>Partager / copier le lien</button><button className="cl-secondary-button" type="button" onClick={() => navigate('/')}>Retour à l’accueil</button></div></section></div></main>
  }

  return <main className="cl-shell"><div className="cl-container"><section className="cl-panel cl-studio-panel"><div className="cl-studio-heading"><div><p className="cl-eyebrow">💌 Celebration Studio · Sans compte</p><h1>Crée une expérience qui lui ressemble.</h1><p>Personnalise ton message, choisis une ambiance et ajoute quelques souvenirs.</p></div><div className={`cl-studio-mini cl-studio-mini--${selectedTemplate.accent}`}>{selectedType?.emoji || '✨'}<strong>{selectedTemplate.name}</strong></div></div><div className="cl-studio-layout">
    <form className="cl-form" onSubmit={submit}>
      <label>Occasion<select value={form.occasion} onChange={(e) => update('occasion', e.target.value)}>{EVENT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.emoji} {type.label}</option>)}</select></label>
      <div className="cl-form-row"><label>À qui s’adresse le vœu ? *<input value={form.recipient} onChange={(e) => update('recipient', e.target.value)} placeholder="Ex. Nadia" required /></label><label>Ton prénom<input value={form.sender} onChange={(e) => update('sender', e.target.value)} placeholder="Ex. Tsadok" /></label></div>
      <label>Titre<input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Ex. Joyeux anniversaire Nadia 🎂" /></label>
      <label>Ton message *<textarea value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Écris ton message ici…" rows="7" required /></label>
      <label>Ajouter des photos <span>Jusqu’à 5 images · stockées localement pour cette création</span><input type="file" accept="image/*" multiple onChange={handlePhotos} /></label>
      {photos.length > 0 && <div className="cl-photo-picker">{photos.map((photo, index) => <div key={`${photo.slice(0, 20)}-${index}`}><img src={photo} alt={`Souvenir ${index + 1}`} /><button type="button" onClick={() => setPhotos((items) => items.filter((_, i) => i !== index))} aria-label={`Supprimer la photo ${index + 1}`}>×</button></div>)}</div>}
      <fieldset><legend>Choisis ton ambiance</legend><div className="cl-template-grid">{CELEBRATION_TEMPLATES.map((template) => <button key={template.id} type="button" className={`cl-template-card cl-template-card--${template.accent} ${form.template === template.id ? 'is-selected' : ''}`} onClick={() => update('template', template.id)}><span className="cl-template-card__preview">{template.id === 'romantic' ? '♥' : template.id === 'minimal' ? '✦' : template.id === 'joyful' ? '✹' : '✧'}</span><strong>{template.name}</strong><span>{template.description}</span></button>)}</div></fieldset>
      <label className="cl-checkbox"><input type="checkbox" checked={form.animations} onChange={(e) => update('animations', e.target.checked)} /><span>Activer les animations ✨</span></label>
      {error && <p className="cl-form-error" role="alert">{error}</p>}<button className="cl-primary-button" type="submit">Créer ma célébration 🎉</button>
    </form>
    <aside className={`cl-live-preview cl-live-preview--${selectedTemplate.accent}`}><span className="cl-live-preview__label">Aperçu en direct</span><div className="cl-live-preview__icon">{selectedType?.emoji || '✨'}</div><p className="cl-eyebrow">{selectedTemplate.name}</p><h2>{form.recipient.trim() || 'Quelqu’un de spécial'} ❤️</h2><h3>{form.title.trim() || `${selectedType?.label || 'Célébration'} pour ${form.recipient.trim() || 'toi'}`}</h3><p>{form.message.trim() || 'Ton message apparaîtra ici au fur et à mesure…'}</p>{form.sender && <small>Avec affection, {form.sender}</small>}{photos.length > 0 && <div className="cl-live-preview__photos">{photos.slice(0, 3).map((photo, index) => <img key={index} src={photo} alt="Aperçu du souvenir" />)}</div>}<span className="cl-live-preview__hint">{form.animations ? '✨ Animations activées' : 'Animations désactivées'}</span></aside>
  </div></section></div></main>
}
