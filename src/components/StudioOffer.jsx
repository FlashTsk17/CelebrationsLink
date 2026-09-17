import { STUDIO_OFFER } from '../data/studioOffers.js'

export default function StudioOffer({ onClick, context }) {
  return (
    <aside className="cl-studio-offer" data-studio-context={context}>
      <span className="cl-studio-offer__icon" aria-hidden="true">✨</span>
      <div className="cl-studio-offer__body">
        <strong>{STUDIO_OFFER.title}</strong>
        <p>{STUDIO_OFFER.description}</p>
      </div>
      <button className="cl-secondary-button" type="button" onClick={onClick}>
        {STUDIO_OFFER.cta} →
      </button>
    </aside>
  )
}
