export interface RecapTopic {
  id: string;
  category: 'Patents' | 'Trademarks' | 'Copyrights' | 'Industrial Designs' | 'GI & Trade Secrets';
  title: string;
  symbol: string;
  definition: string;
  keyPoints: string[];
  examples: string[];
  validityPeriod: string;
  governingOffice: string;
}

export const RECAP_TOPICS: RecapTopic[] = [
  {
    id: 'recap_patents',
    category: 'Patents',
    title: 'Patents (Inventions & Technology)',
    symbol: '⚙️',
    definition: 'An exclusive legal right granted for a new, useful, and non-obvious invention (product or process).',
    keyPoints: [
      'Must be NOVEL (brand new, never disclosed anywhere in the world).',
      'Must involve an INVENTIVE STEP (not obvious to an average technical expert).',
      'Must have INDUSTRIAL APPLICATION (capable of being made or used).',
      'Protects technical function, mechanism, or process.'
    ],
    examples: ['Solar-powered water purifier', 'Foldable smartphone display mechanism', 'Biodegradable plastic formula'],
    validityPeriod: '20 Years from filing date',
    governingOffice: 'Indian Patent Office (Controller General of Patents, Designs and Trade Marks - CGPDTM)'
  },
  {
    id: 'recap_trademarks',
    category: 'Trademarks',
    title: 'Trademarks (Brands, Logos & Names)',
    symbol: '®',
    definition: 'A unique sign, logo, word, brand name, slogan, or sound that distinguishes goods/services of one seller from others.',
    keyPoints: [
      '™ symbol can be used while application is pending.',
      '® symbol is used ONLY after official registration.',
      'Must be distinctive and not deceptively similar to existing brand logos.',
      'Protects brand identity and prevents consumer confusion.'
    ],
    examples: ['Tata logo', 'Amul Girl mascot', 'Nike Swoosh symbol', 'Intel Inside chime sound'],
    validityPeriod: '10 Years (Renewable indefinitely every 10 years)',
    governingOffice: 'Trademark Registry India (CGPDTM)'
  },
  {
    id: 'recap_copyrights',
    category: 'Copyrights',
    title: 'Copyrights (Artistic & Literary Works)',
    symbol: '©',
    definition: 'Exclusive legal rights given to creators over their original artistic, literary, musical, dramatic, and software works.',
    keyPoints: [
      'Automatic protection upon creation in tangible form.',
      'Protects EXPRESSION of ideas, NOT the abstract idea itself.',
      'Fair Use allows limited usage for educational, news, and review purposes.',
      'Software code & mobile app source code are protected under Copyright!'
    ],
    examples: ['Harry Potter novels', 'A.R. Rahman music tracks', 'School textbook illustrations', 'Python code scripts'],
    validityPeriod: 'Author\'s Lifetime + 60 Years in India',
    governingOffice: 'Copyright Office India'
  },
  {
    id: 'recap_designs',
    category: 'Industrial Designs',
    title: 'Industrial Designs (Visual Shape & Aesthetics)',
    symbol: '🎨',
    definition: 'Protects only the aesthetic visual appearance, shape, pattern, ornament, or color combination of an article.',
    keyPoints: [
      'Applies ONLY to 2D or 3D visual appearance.',
      'Does NOT cover any functional or technical mechanism (that requires a Patent).',
      'Must be new, original, and significantly distinguishable.'
    ],
    examples: ['Unique curved Coca-Cola contour bottle', 'Futuristic car body shape', 'Ergonomic gaming chair design'],
    validityPeriod: '10 Years (Extendable by 5 years up to 15 years total)',
    governingOffice: 'Design Office, Kolkata (CGPDTM)'
  }
];
