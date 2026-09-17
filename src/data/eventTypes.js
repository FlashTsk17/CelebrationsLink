export const EVENT_TYPES = [
  { id: 'birthday', label: 'Anniversaire', emoji: '🎂' },
  { id: 'wedding', label: 'Mariage', emoji: '💍' },
  { id: 'engagement', label: 'Fiançailles', emoji: '💞' },
  { id: 'graduation', label: 'Diplôme', emoji: '🎓' },
  { id: 'birth', label: 'Naissance', emoji: '👶' },
  { id: 'baptism', label: 'Baptême', emoji: '🕊️' },
  { id: 'party', label: 'Fête', emoji: '🎉' },
  { id: 'inauguration', label: 'Inauguration', emoji: '🏛️' },
  { id: 'commemoration', label: 'Commémoration', emoji: '🕯️' },
  { id: 'other', label: 'Autre occasion', emoji: '✨' },
]

export const UNIVERSAL_OCCASIONS = [
  { id: 'christmas', label: 'Noël', emoji: '🎄' },
  { id: 'new-year', label: 'Nouvel An', emoji: '🎆' },
  { id: 'mothers-day', label: 'Fête des Mères', emoji: '💐' },
  { id: 'fathers-day', label: 'Fête des Pères', emoji: '👔' },
  { id: 'valentines-day', label: 'Saint-Valentin', emoji: '❤️' },
  { id: 'easter', label: 'Pâques', emoji: '🐣' },
  { id: 'eid', label: 'Aïd', emoji: '🌙' },
  { id: 'womens-day', label: 'Journée des Femmes', emoji: '🌸' },
]

export const EVENT_MODES = {
  ANNOUNCEMENT: 'announcement',
  INVITATION: 'invitation',
}

export const getEventType = (id) => EVENT_TYPES.find((type) => type.id === id)
