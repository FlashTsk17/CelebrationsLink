import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCelebrationBySlugAsync } from '../services/celebrationService.js'
import { getCelebrationTemplate } from '../data/celebrationTemplates.js'

export default function PublicCelebration() {
  const { slug } = useParams()
  const [celebration, setCelebration] = useState(undefined)
  const [muted, setMuted] = useState(false)

  useEffect(() => { getCelebrationBySlugAsync(slug).then(setCelebration).catch(() => setCelebration(null)) }, [slug])

  if (celebration === undefined) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p>Chargement de ta célébration…</p></section></div></main>
  if (!celebration) return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p className="cl-eyebrow">🔗 CélébrationsLink</p><h1>Célébration introuvable</h1><p>Ce lien n’existe pas ou cette célébration n’est plus disponible.</p></section></div></main>

  const template = getCelebrationTemplate(celebration.template)
  const music = celebration.music?.src || celebration.music?.url || null
  const photos = Array.isArray(celebration.photos) ? celebration.photos : []
  const share = async () => {
    const payload = { title: celebration.title || `Pour ${celebration.recipient}`, text: celebration.message, url: window.location.href }
    if (navigator.share) { try { await navigator.share(payload) } catch {} }
    else { await navigator.clipboard?.writeText(window.location.href) }
  }

  return <main className={`cl-shell cl-celebration-page cl-theme-${template.accent}`}>
    <div className="cl-container"><section className="cl-celebration-card">
      {celebration.animations && <div className="cl-celebration-sparkles" aria-hidden="true">✦ ✧ ✦</div>}
      <div className="cl-celebration-icon">{template.id === 'romantic' ? '💖' : template.id === 'joyful' ? '🎉' : template.id === 'minimal' ? '✦' : '✨'}</div>
      <p className="cl-eyebrow">{celebration.occasion}</p><h1>{celebration.title || `Pour ${celebration.recipient}`}</h1>
      <p className="cl-celebration-to">Pour <strong>{celebration.recipient}</strong></p>
      <div className="cl-celebration-message">{celebration.message}</div>
      {celebration.sender && <p className="cl-celebration-from">Avec affection, <strong>{celebration.sender}</strong> ❤️</p>}
      {photos.length > 0 && <div className="cl-celebration-gallery" aria-label="Souvenirs"><h2>📸 Souvenirs</h2><div>{photos.map((photo, i) => <img key={i} src={photo.src || photo} alt={`Souvenir ${i + 1}`} loading="lazy" />)}</div></div>}
      {music && <div className="cl-celebration-music"><audio src={music} controls loop muted={muted} preload="metadata" /><button type="button" className="cl-small-button" onClick={() => setMuted((v) => !v)}>{muted ? '🔇 Muet' : '🔊 Son'}</button></div>}
      {celebration.animations && <p className="cl-celebration-animation-note">✨ Une petite touche de magie est activée</p>}
      <button className="cl-primary-button" type="button" onClick={share}>Partager cette célébration ↗</button>
      <div className="cl-footer">Créé avec CélébrationsLink · Crée. Annonce. Invite. Célèbre. Partage. ❤️</div>
    </section></div>
  </main>
}
