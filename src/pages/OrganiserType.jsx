import { useNavigate } from 'react-router-dom'
import EventTypePicker from '../components/EventTypePicker.jsx'

export default function OrganiserType() {
  const navigate = useNavigate()
  const selected = sessionStorage.getItem('cl:event-type') || ''

  const choose = (type) => {
    sessionStorage.setItem('cl:event-type', type)
    navigate('/organiser')
  }

  return (
    <main className="cl-shell">
      <div className="cl-container">
        <section className="cl-panel">
          <p className="cl-eyebrow">Étape 1</p>
          <h1>Quel événement veux-tu organiser ?</h1>
          <p>Choisis une occasion. Tu pourras ensuite créer une annonce ou une invitation.</p>
          <EventTypePicker value={selected} onChange={choose} />
        </section>
      </div>
    </main>
  )
}
