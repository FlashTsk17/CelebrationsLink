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
  { id: 'birthday-vibes', title: 'Birthday Vibes', category: 'festive', occasions: ['birthday', 'party'], artist: 'CélébrationsLink', src: '' },
  { id: 'love-story', title: 'Love Story', category: 'romantic', occasions: ['wedding', 'engagement'], artist: 'CélébrationsLink', src: '' },
  { id: 'afro-celebration', title: 'Afro Celebration', category: 'afro', occasions: ['birthday', 'party', 'wedding'], artist: 'CélébrationsLink', src: '' },
  { id: 'amapiano-party', title: 'Amapiano Party', category: 'dance', occasions: ['birthday', 'party'], artist: 'CélébrationsLink', src: '' },
  { id: 'tender-moment', title: 'Tender Moment', category: 'emotional', occasions: ['birth', 'baptism', 'commemoration'], artist: 'CélébrationsLink', src: '' },
  { id: 'elegant-piano', title: 'Elegant Piano', category: 'elegant', occasions: ['wedding', 'graduation', 'inauguration'], artist: 'CélébrationsLink', src: '' },
  { id: 'success-energy', title: 'Success Energy', category: 'success', occasions: ['graduation', 'inauguration'], artist: 'CélébrationsLink', src: '' },
  { id: 'soft-wishes', title: 'Soft Wishes', category: 'chill', occasions: ['birthday', 'birth', 'other'], artist: 'CélébrationsLink', src: '' },
]

export function getRecommendedMusic(occasion) {
  return MUSIC_LIBRARY.filter((track) => track.occasions.includes(occasion))
}
