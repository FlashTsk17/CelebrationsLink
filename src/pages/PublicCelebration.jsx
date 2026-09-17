import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCelebrationBySlug } from '../services/celebrationService.js'
import { getCelebrationTemplate } from '../data/celebrationTemplates.js'

export default function PublicCelebration() {
  const { slug } = useParams()
  const [celebration, setCelebration] = useState(undefined)

  useEffect(() => setCelebration(getCelebrationBySlug(slug)), [slug])

  if (celebration === undefined) return null
  if (!celebration) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p className="cl-eyebrow">🔗 CélébrationsLink</p><h1>Célébration introuvable</h1><p>Ce lien n’existe pas ou cette célébration n’est plus disponible.</p></section></div></main>
  }

  const template = getCelebrationTemplate(celebration.template)
  return (
    <main className={`cl-shell cl-celebration-page cl-theme-${template.accent}`}>
      <div className="cl-container">
        <section className="cl-celebration-card">
          <div className="cl-celebration-icon">{template.id === 'romantic' ? '💖' : '🎉'}</div>
          <p className="cl-eyebrow">{celebration.occasion}</p>
          <h1>{celebration.title || `Pour ${celebration.recipient}`}</h1>
          <p className="cl-celebration-to">Pour <strong>{celebration.recipient}</strong></p>
          <div className="cl-celebration-message">{celebration.message}</div>
          {celebration.sender && <p className="cl-celebration-from">Avec affection, <strong>{celebration.sender}</strong> ❤️</p>}
          <button className="cl-primary-button" type="button" onClick={() => navigator.share?.({ title: celebration.title, text: celebration.message, url: window.location.href })}>Partager cette célébration ↗</button>
          <div className="cl-footer">Créé avec CélébrationsLink · Crée. Annonce. Invite. Célèbre. Partage. ❤️</div>
        </section>
      </div>
    </main>
  )
}
