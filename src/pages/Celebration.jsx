import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCelebrationBySlug } from '../services/celebrationService.js'
import { getCelebrationTemplate } from '../data/celebrationTemplates.js'

function FloatingHearts() {
  return <div className="cl-celebration__particles" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} style={{ '--i': index }}>♥</span>)}</div>
}

export default function Celebration() {
  const { slug } = useParams()
  const celebration = useMemo(() => getCelebrationBySlug(slug), [slug])
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (celebration) {
      const timer = window.setTimeout(() => setRevealed(true), 120)
      return () => window.clearTimeout(timer)
    }
  }, [celebration])

  if (!celebration) {
    return <main className="cl-shell"><div className="cl-container"><section className="cl-panel"><p className="cl-eyebrow">Célébration</p><h1>Cette célébration est introuvable</h1><p>Le lien est peut-être incorrect ou cette célébration n'est plus disponible.</p></section></div></main>
  }

  const template = getCelebrationTemplate(celebration.template)
  const animated = celebration.animations !== false
  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: celebration.title, text: `Une célébration pour ${celebration.recipient} ❤️`, url }) } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <main className={`cl-shell cl-celebration cl-celebration--${template.accent} ${animated ? 'cl-celebration--animated' : ''} ${revealed ? 'is-revealed' : ''}`}>
      {animated && <FloatingHearts />}
      <div className="cl-container">
        <section className="cl-celebration__hero">
          <span className="cl-celebration__badge">{template.name}</span>
          <div className="cl-celebration__icon" aria-hidden="true">{celebration.occasion === 'birthday' ? '🎂' : '✨'}</div>
          <p className="cl-eyebrow">Une célébration pour</p>
          <h1>{celebration.recipient || 'Quelqu’un de spécial'} ❤️</h1>
          {celebration.title && <h2>{celebration.title}</h2>}
          <div className="cl-celebration__message">{celebration.message}</div>
          {celebration.sender && <p className="cl-celebration__sender">Avec affection, {celebration.sender}</p>}
          <button className="cl-primary-button cl-celebration__share" type="button" onClick={share}>Partager cette célébration ↗</button>
        </section>

        {celebration.photos?.length > 0 && <section className="cl-celebration__gallery" aria-label="Photos de la célébration">
          {celebration.photos.map((photo, index) => <figure key={`${photo}-${index}`}><img src={photo} alt={`Souvenir ${index + 1}`} loading="lazy" /><figcaption>Souvenir {index + 1}</figcaption></figure>)}
        </section>}

        <div className="cl-celebration__footer-note">Créé avec ❤️ sur CélébrationsLink</div>
        <div className="cl-footer">CélébrationsLink · Crée. Célèbre. Partage. ❤️</div>
      </div>
    </main>
  )
}
