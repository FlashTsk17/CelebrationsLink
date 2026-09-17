export const ACCESS_LEVELS = {
  BASIC: 'basic',
  MEMBER: 'member',
  PREMIUM: 'premium',
}

export const ACCESS_LEVEL_LABELS = {
  [ACCESS_LEVELS.BASIC]: 'Basic',
  [ACCESS_LEVELS.MEMBER]: 'Membre',
  [ACCESS_LEVELS.PREMIUM]: 'Premium',
}

export const ACCESS_LEVEL_DESCRIPTIONS = {
  [ACCESS_LEVELS.BASIC]: 'Les fonctions essentielles, sans compte.',
  [ACCESS_LEVELS.MEMBER]: 'Un espace personnel gratuit pour retrouver et gérer ses créations.',
  [ACCESS_LEVELS.PREMIUM]: 'Des fonctionnalités avancées, activées après validation de la demande Premium.',
}

export const PREMIUM_FEATURES = [
  'Modèles et designs Premium',
  'Animations avancées',
  'Musique et personnalisation enrichie',
  'Fonctionnalités IA',
  'Plus de médias et de stockage',
  'Statistiques et options de partage avancées',
]

export function hasAccess(level, requiredLevel) {
  const order = [ACCESS_LEVELS.BASIC, ACCESS_LEVELS.MEMBER, ACCESS_LEVELS.PREMIUM]
  return order.indexOf(level) >= order.indexOf(requiredLevel)
}
