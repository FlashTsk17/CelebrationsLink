export default function ActionCard({ emoji, title, description, onClick }) {
  return (
    <button className="cl-action-card" type="button" onClick={onClick}>
      <span className="cl-action-card__emoji" aria-hidden="true">{emoji}</span>
      <span className="cl-action-card__body">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className="cl-action-card__arrow" aria-hidden="true">→</span>
    </button>
  )
}
