import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getCelebrationBySlug } from '../services/celebrationService.js'
import { getCelebrationTemplate } from '../data/celebrationTemplates.js'

export default function Celebration() {
  const { slug } = useParams()
  const celebration = useMemo(() => getCelebrationBySlug(slug), [slug])

  if (!celebration) {
    return (
      <main className="cl-shell">
        <div className="cl-container">
          <section className="cl-panel">
            <p className="cl-eyebrow">Célébration</p>
            <h1>Cette célébration est introuvable</h1>
            <p>Le lien est peut-être incorrect ou cette célébration n'est plus disponible.</p>
          </section>
        </div>
      </main>
    )
  }

  const template = getCelebrationTemplate(celebration.template)

  return (
    <main className={`cl-shell cl-celebration cl-celebration--${template.accent}`}>
      <div className="cl-container">
        <section className="cl-celebration__hero">
          <span className="cl-celebration__badge">{template.name}</span>
          <p className="cl-eyebrow">Une célébration pour</p>
          <h1>{celebration.recipient || 'Quelqu’un de spécial'} ❤️</h1>
          {celebration.title && <h2>{celebration.title}</h2>}
          <p className="cl-celebration__message">{celebration.message}</p>
          {celebration.sender && <p className="cl-celebration__sender">Avec affection, {celebration.sender}</p>}
        </section>

        {celebration.photos?.length > 0 && (
          <section className="cl-celebration__gallery" aria-label="Photos de la célébration">
            {celebration.photos.map((photo, index) => (
              <img key={`${photo}-${index}`} src={photo} alt="Souvenir de la célébration" loading="lazy" />
            ))}
          </section>
        )}

        <div className="cl-footer">CélébrationsLink · Crée. Célèbre. Partage. ❤️</div>
      </div>
    </main>
  )
}
