export const CELEBRATION_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Une présentation élégante et simple pour tous les vœux.',
    mood: 'festive',
    accent: 'violet',
  },
  {
    id: 'joyful',
    name: 'Joyeux',
    description: 'Une ambiance colorée et dynamique pour les grandes occasions.',
    mood: 'festive',
    accent: 'blue',
  },
  {
    id: 'romantic',
    name: 'Romantique',
    description: 'Une atmosphère douce pour célébrer une personne chère.',
    mood: 'romantic',
    accent: 'rose',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Une expérience épurée qui met le message au premier plan.',
    mood: 'calm',
    accent: 'indigo',
  },
]

export function getCelebrationTemplate(id) {
  return CELEBRATION_TEMPLATES.find((template) => template.id === id) || CELEBRATION_TEMPLATES[0]
}
