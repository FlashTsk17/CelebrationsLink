import { EVENT_TYPES } from '../data/eventTypes.js'

export default function EventTypePicker({ value, onChange }) {
  return (
    <div className="cl-type-grid">
      {EVENT_TYPES.map((type) => (
        <button
          key={type.id}
          type="button"
          className={`cl-type-card ${value === type.id ? 'is-selected' : ''}`}
          onClick={() => onChange(type.id)}
          aria-pressed={value === type.id}
        >
          <span className="cl-type-card__emoji">{type.emoji}</span>
          <strong>{type.label}</strong>
        </button>
      ))}
    </div>
  )
}
