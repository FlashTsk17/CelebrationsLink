export const MUSIC_CATEGORIES = [
  { id: 'festive', label: 'Festif', emoji: '🎉' },
  { id: 'romantic', label: 'Romantique', emoji: '💕' },
  { id: 'afro', label: 'Afro', emoji: '🥁' },
  { id: 'dance', label: 'Dansant', emoji: '💃' },
  { id: 'emotional', label: 'Émotion', emoji: '🌅' },
  { id: 'elegant', label: 'Élégant', emoji: '🎹' },
  { id: 'chill', label: 'Doux & Chill', emoji: '🌿' },
  { id: 'success', label: 'Réussite', emoji: '🏆' },
  { id: 'spiritual', label: 'Spirituel', emoji: '🙏' },
]

export const MUSIC_LIBRARY = [
  { id: 'birthday-vibes', title: 'Birthday Vibes', category: 'festive', occasions: ['birthday', 'party'], artist: 'CélébrationsLink', src: '', mood: 'joyful' },
  { id: 'love-story', title: 'Love Story', category: 'romantic', occasions: ['wedding', 'engagement'], artist: 'CélébrationsLink', src: '', mood: 'romantic' },
  { id: 'afro-celebration', title: 'Afro Celebration', category: 'afro', occasions: ['birthday', 'party', 'wedding'], artist: 'CélébrationsLink', src: '', mood: 'energetic' },
  { id: 'amapiano-party', title: 'Amapiano Party', category: 'dance', occasions: ['birthday', 'party'], artist: 'CélébrationsLink', src: '', mood: 'energetic' },
  { id: 'tender-moment', title: 'Tender Moment', category: 'emotional', occasions: ['birth', 'baptism', 'commemoration'], artist: 'CélébrationsLink', src: '', mood: 'tender' },
  { id: 'elegant-piano', title: 'Elegant Piano', category: 'elegant', occasions: ['wedding', 'graduation', 'inauguration'], artist: 'CélébrationsLink', src: '', mood: 'elegant' },
  { id: 'success-energy', title: 'Success Energy', category: 'success', occasions: ['graduation', 'inauguration'], artist: 'CélébrationsLink', src: '', mood: 'energetic' },
  { id: 'soft-wishes', title: 'Soft Wishes', category: 'chill', occasions: ['birthday', 'birth', 'other'], artist: 'CélébrationsLink', src: '', mood: 'calm' },
]

export function getRecommendedMusic(occasion, category = 'all') {
  return MUSIC_LIBRARY
    .filter((track) => !occasion || track.occasions.includes(occasion))
    .filter((track) => category === 'all' || track.category === category)
}

export function scoreMusicForOccasion(track, occasion) {
  if (!track) return 0
  if (!occasion) return 0
  return track.occasions.includes(occasion) ? 100 : 0
}
