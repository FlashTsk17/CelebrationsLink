import { useNavigate, useSearchParams } from 'react-router-dom'
import EventTypePicker from '../components/EventTypePicker.jsx'

export default function OrganiserType() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mode = params.get('mode')
  const selected = sessionStorage.getItem('cl:event-type') || ''

  const choose = (type) => {
    sessionStorage.setItem('cl:event-type', type)
    const targetMode = mode === 'invitation' ? 'invitation' : 'announcement'
    navigate(`/organiser/${targetMode}?type=${encodeURIComponent(type)}`)
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-panel">
          <p className="cl-eyebrow">Étape 1 · {mode === 'invitation' ? 'Invitation' : 'Annonce'}</p>
          <h1>Quel événement veux-tu organiser ?</h1>
          <p>Choisis une occasion. Ensuite, tu pourras renseigner les informations de ton événement.</p>
          <EventTypePicker value={selected} onChange={choose} />
        </section>
      </div>
    </main>
  )
}
