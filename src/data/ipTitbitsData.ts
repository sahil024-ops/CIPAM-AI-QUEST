export interface IPTitbit {
  id: string;
  title: string;
  category: 'Patents' | 'Trademarks' | 'Copyrights' | 'Designs' | 'GI Tags';
  tagline: string;
  content: string;
  fact: string;
  imageEmoji: string;
  badgeRequired?: string;
}

export const IP_TITBITS: IPTitbit[] = [
  {
    id: 'turmeric_patent',
    title: 'The Great Turmeric Patent Victory 🇮🇳',
    category: 'Patents',
    tagline: 'How India revoked a foreign patent on wound-healing turmeric!',
    content: 'In 1995, a US patent was granted for using Turmeric (Haldi) to heal wounds. India\'s CSIR challenged this patent, providing ancient Sanskrit texts to prove Haldi\'s healing properties were traditional Indian knowledge, not a new invention. The US Patent Office cancelled all claims!',
    fact: 'Lesson: An invention MUST be completely novel. Traditional knowledge cannot be patented!',
    imageEmoji: '🌿',
  },
  {
    id: 'basmati_gi',
    title: 'Basmati Rice & Geographical Indication 🌾',
    category: 'GI Tags',
    tagline: 'Protecting India\'s famous aromatic rice',
    content: 'Basmati rice possesses unique aroma, long grain size, and flavor cultivated in specific Himalayan foothills. India registered Basmati as a Geographical Indication (GI Tag) so no unauthorized seller worldwide can mislabel non-Basmati rice.',
    fact: 'GI Tags protect agricultural, natural, or manufactured goods originating from a specific geographic location!',
    imageEmoji: '🍚',
  },
  {
    id: 'coca_cola_bottle',
    title: 'The Iconic Contour Bottle Design 🍾',
    category: 'Designs',
    tagline: 'Recognizable even in the dark or if broken!',
    content: 'In 1915, the Root Glass Company created a distinctive curved contour bottle for Coca-Cola. The goal was to make a bottle so distinctive that you could recognize it by touch in the dark, or even when broken on the floor. It was registered as an Industrial Design!',
    fact: 'Industrial Designs protect ONLY the visual shape and aesthetic look, not the liquid formula!',
    imageEmoji: '🍾',
  },
  {
    id: 'amul_trademark',
    title: 'Amul - The Taste of India 🧈',
    category: 'Trademarks',
    tagline: 'One of India\'s most trusted Well-Known Trademarks',
    content: 'The "Amul" brand name and the famous polka-dotted "Amul Girl" mascot are protected trademarks registered with CIPAM\'s Trademark Registry in India. Even if a company sells shoes or computers, they CANNOT use the name Amul because it is a protected Well-Known Trademark!',
    fact: 'Trademarks prevent consumer confusion and protect brand goodwill.',
    imageEmoji: '🧈',
  },
  {
    id: 'mickey_mouse_copyright',
    title: 'Mickey Mouse & Copyright Terms 🐭',
    category: 'Copyrights',
    tagline: 'How long does a copyright last?',
    content: 'In India and most countries, copyright lasts for the author\'s entire life PLUS 60 years after their death! The original 1928 version of Mickey Mouse ("Steamboat Willie") entered the Public Domain recently, meaning anyone can now freely use that specific early version.',
    fact: 'Copyright is automatic the moment an original creative work is expressed in a tangible form!',
    imageEmoji: '🎨',
  },
  {
    id: 'darjeeling_tea',
    title: 'Darjeeling Tea - The Champagne of Teas ☕',
    category: 'GI Tags',
    tagline: 'India\'s very first GI Tag registered in 2004!',
    content: 'Darjeeling Tea was the first product in India to receive a Geographical Indication (GI) tag in 2004. Only tea grown in the 87 tea gardens of Darjeeling district in West Bengal can legally be sold as "Darjeeling Tea".',
    fact: 'GI Tags safeguard local artisans, farmers, and traditional heritage from cheap imitations.',
    imageEmoji: '☕',
  }
];
