import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EVENT_TYPES, UNIVERSAL_OCCASIONS } from '../data/eventTypes.js'
import { CELEBRATION_TEMPLATES } from '../data/celebrationTemplates.js'
import { createCelebration } from '../services/celebrationService.js'
import { getCurrentUser } from '../services/auth.js'
import { uploadImageFile, validateImageFile, MAX_CELEBRATION_IMAGES } from '../services/mediaStorage.js'
import MusicPicker from '../components/MusicPicker.jsx'

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
  const [photoFiles, setPhotoFiles] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [music, setMusic] = useState(null)
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const allOccasions = useMemo(() => [...EVENT_TYPES, ...UNIVERSAL_OCCASIONS], [])
  const selectedType = useMemo(() => allOccasions.find((type) => type.id === form.occasion), [allOccasions, form.occasion])
  const selectedTemplate = useMemo(() => CELEBRATION_TEMPLATES.find((template) => template.id === form.template) || CELEBRATION_TEMPLATES[0], [form.template])
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handlePhotos = async (event) => {
    setError('')
    const files = Array.from(event.target.files || []).slice(0, MAX_CELEBRATION_IMAGES)
    try {
      for (const file of files) {
        const validation = validateImageFile(file)
        if (!validation.valid) throw new Error(validation.error)
      }
      setPhotoFiles(files)
      setPhotoPreviews(await Promise.all(files.map(readImage)))
    } catch (err) {
      setPhotoFiles([])
      setPhotoPreviews([])
      setError(err.message || 'Impossible de charger les photos.')
    } finally {
      event.target.value = ''
    }
  }

  const removePhoto = (index) => {
    setPhotoFiles((items) => items.filter((_, i) => i !== index))
    setPhotoPreviews((items) => items.filter((_, i) => i !== index))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.recipient.trim() || !form.message.trim()) { setError('Indique au moins le destinataire et ton message.'); return }
    setSaving(true)
    try {
      const user = await getCurrentUser()
      const hasCloudMusic = music?.storage === 'supabase'
      if (hasCloudMusic && !user) throw new Error('Reconnecte-toi à ton compte Membre avant de publier cette musique.')
      if (photoFiles.length > 0 && !user) throw new Error('Les photos sur un lien public nécessitent un compte Membre. Crée ton compte gratuitement pour les conserver dans le cloud.')
      const persistence = user && (hasCloudMusic || music?.source === 'library' || photoFiles.length > 0) ? 'cloud' : 'local'
      if (persistence === 'local' && music?.storage === 'local') {
        throw new Error('Ta musique personnelle nécessite un compte Membre pour être conservée sur le lien public. Tu peux aussi créer la célébration sans musique.')
      }

      let photos = photoPreviews
      if (persistence === 'cloud' && photoFiles.length) {
        const uploaded = []
        for (const file of photoFiles) {
          const media = await uploadImageFile(file)
          if (!media) throw new Error('Le stockage cloud des photos n’est pas disponible.')
          uploaded.push({ storage: 'supabase', storagePath: media.path, src: media.url, fileName: media.fileName, mimeType: media.mimeType, size: media.size })
        }
        photos = uploaded
      }

      const celebration = await createCelebration({ ...form, photos, music, persistence, title: form.title.trim() || `${selectedType?.label || 'Célébration'} pour ${form.recipient.trim()}` })
      setCreated(celebration)
    } catch (err) { setError(err?.message || 'Impossible de créer la célébration.') }
    finally { setSaving(false) }
  }

  if (created) {
    const publicPath = `/c/${created.slug}`
    const share = async () => {
      const url = window.location.origin + publicPath
      if (navigator.share) await navigator.share({ title: created.title, text: `Une célébration pour ${created.recipient} ❤️`, url })
      else await navigator.clipboard?.writeText(url)
    }
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel cl-success-panel"><p className="cl-eyebrow">🎉 C’est prêt !</p><h1>Ton vœu a été créé.</h1><p>{created.owner_id ? 'La célébration et ses médias sont enregistrés dans le cloud et peuvent être ouverts depuis un autre appareil.' : 'Un simple lien suffit maintenant pour le partager sur cet appareil.'}</p><div className="cl-link-box">{window.location.origin}{publicPath}</div><div className="cl-grid"><button className="cl-primary-button" type="button" onClick={() => navigate(publicPath)}>Voir ma célébration →</button><button className="cl-secondary-button" type="button" onClick={share}>Partager / copier le lien</button><button className="cl-secondary-button" type="button" onClick={() => navigate('/')}>Retour à l’accueil</button></div></section></div></main>
  }

  return <main className="cl-shell"><div className="cl-container"><section className="cl-panel cl-studio-panel"><div className="cl-studio-heading"><div><p className="cl-eyebrow">💌 Celebration Studio · Sans compte</p><h1>Crée une expérience qui lui ressemble.</h1><p>Personnalise ton message, choisis une ambiance, une musique et ajoute quelques souvenirs.</p><div className="cl-studio-steps"><span className="is-active">1. Contenu</span><span>2. Style</span><span>3. Enrichir</span><span>4. Publier</span></div></div><div className={`cl-studio-mini cl-studio-mini--${selectedTemplate.accent}`}>{selectedType?.emoji || '✨'}<strong>{selectedTemplate.name}</strong></div></div><div className="cl-studio-layout">
    <form className="cl-form" onSubmit={submit}>
      <label>Occasion<select value={form.occasion} onChange={(e) => update('occasion', e.target.value)}>
        <optgroup label="Occasions personnelles">{EVENT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.emoji} {type.label}</option>)}</optgroup>
        <optgroup label="Occasions universelles">{UNIVERSAL_OCCASIONS.map((occasion) => <option key={occasion.id} value={occasion.id}>{occasion.emoji} {occasion.label}</option>)}</optgroup>
      </select></label>
      <div className="cl-form-row"><label>À qui s’adresse le vœu ? *<input value={form.recipient} onChange={(e) => update('recipient', e.target.value)} placeholder="Ex. Nadia" required /></label><label>Ton prénom<input value={form.sender} onChange={(e) => update('sender', e.target.value)} placeholder="Ex. Tsadok" /></label></div>
      <label>Titre<input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Ex. Joyeux anniversaire Nadia 🎂" /></label>
      <label>Ton message *<textarea value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Écris ton message ici…" rows="7" required /></label>
      <label>Ajouter des photos <span>Jusqu’à 5 images · 8 Mo max par image · compte Membre requis pour le lien public</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handlePhotos} /></label>
      {photoPreviews.length > 0 && <div className="cl-photo-picker">{photoPreviews.map((photo, index) => <div key={`${photo.slice(0, 20)}-${index}`}><img src={photo} alt={`Souvenir ${index + 1}`} /><button type="button" onClick={() => removePhoto(index)} aria-label={`Supprimer la photo ${index + 1}`}>×</button></div>)}</div>}
      <MusicPicker occasion={form.occasion} value={music} onChange={setMusic} />
      <fieldset><legend>Choisis ton ambiance</legend><div className="cl-template-grid">{CELEBRATION_TEMPLATES.map((template) => <button key={template.id} type="button" className={`cl-template-card cl-template-card--${template.accent} ${form.template === template.id ? 'is-selected' : ''}`} onClick={() => update('template', template.id)}><span className="cl-template-card__preview">{template.id === 'romantic' ? '♥' : template.id === 'minimal' ? '✦' : template.id === 'joyful' ? '✹' : '✧'}</span><strong>{template.name}</strong><span>{template.description}</span></button>)}</div></fieldset>
      <label className="cl-checkbox"><input type="checkbox" checked={form.animations} onChange={(e) => update('animations', e.target.checked)} /><span>Activer les animations ✨</span></label>
      {error && <p className="cl-form-error" role="alert">{error}</p>}<button className="cl-primary-button" type="submit" disabled={saving}>{saving ? 'Publication en cours…' : 'Créer ma célébration 🎉'}</button>
    </form>
    <aside className={`cl-live-preview cl-live-preview--${selectedTemplate.accent}`}><span className="cl-live-preview__label">Aperçu en direct</span><div className="cl-live-preview__icon">{selectedType?.emoji || '✨'}</div><p className="cl-eyebrow">{selectedTemplate.name}</p><h2>{form.recipient.trim() || 'Quelqu’un de spécial'} ❤️</h2><h3>{form.title.trim() || `${selectedType?.label || 'Célébration'} pour ${form.recipient.trim() || 'toi'}`}</h3><p>{form.message.trim() || 'Ton message apparaîtra ici au fur et à mesure…'}</p>{form.sender && <small>Avec affection, {form.sender}</small>}{photoPreviews.length > 0 && <div className="cl-live-preview__photos">{photoPreviews.slice(0, 3).map((photo, index) => <img key={index} src={photo} alt="Aperçu du souvenir" />)}</div>}{music && <div className="cl-live-preview__music">🎵 {music.title}</div>}<span className="cl-live-preview__hint">{form.animations ? '✨ Animations activées' : 'Animations désactivées'}</span></aside>
  </div></section></div></main>
}
