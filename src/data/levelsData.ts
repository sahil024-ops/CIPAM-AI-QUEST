export type LevelTier = 'Basic' | 'Intermediate' | 'Advanced';

export interface LevelItem {
  id: string;
  tier: LevelTier;
  tierNumber: number;
  title: string;
  subtitle: string;
  ipCategory: 'Patents' | 'Trademarks' | 'Copyrights' | 'Designs' | 'Mixed IP';
  icon: string;
  color: string;
  description: string;
  maxScore: number;
  unlockedByDefault: boolean;
  requiredStarsForNext: number;
  badgeAwarded: string;
  storyBrief: string;
}

export const LEVELS_DATA: LevelItem[] = [
  // --- TIER 1: BASIC (IP EXPLORER) ---
  {
    id: 'patents_basic',
    tier: 'Basic',
    tierNumber: 1,
    title: 'The Inventor\'s Workshop',
    subtitle: 'Patents & Novelty Sorting',
    ipCategory: 'Patents',
    icon: 'Lightbulb',
    color: 'from-amber-500 to-yellow-600',
    description: 'Help young inventor Alex evaluate new inventions! Sort items on the patent conveyor belt based on Novelty, Inventive Step, and Utility.',
    maxScore: 300,
    unlockedByDefault: true,
    requiredStarsForNext: 1,
    badgeAwarded: 'patent_pioneer',
    storyBrief: 'Welcome to the High-Tech Inventor Workshop! Alex built 5 cool gadgets. Can you inspect each invention and decide if it satisfies Indian Patent Law criteria?'
  },
  {
    id: 'trademarks_basic',
    tier: 'Basic',
    tierNumber: 1,
    title: 'Brand Guardian Quest',
    subtitle: 'Trademarks & Logo Inspector',
    ipCategory: 'Trademarks',
    icon: 'ShieldCheck',
    color: 'from-blue-500 to-indigo-600',
    description: 'Protect local startups from counterfeit products! Differentiate ™ from ®, inspect brand logos, and catch trademark infringers.',
    maxScore: 300,
    unlockedByDefault: false,
    requiredStarsForNext: 1,
    badgeAwarded: 'brand_guardian',
    storyBrief: 'Scammers are selling fake products in the town market! Put on your Brand Inspector glasses and save genuine startup trademarks.'
  },
  {
    id: 'copyrights_basic',
    tier: 'Basic',
    tierNumber: 1,
    title: 'The Creator\'s Studio',
    subtitle: 'Copyrights & Fair Use Lab',
    ipCategory: 'Copyrights',
    icon: 'Music',
    color: 'from-purple-500 to-pink-600',
    description: 'Protect digital art, music, books, and code. Resolve Fair Use puzzles and catch original vs copied works.',
    maxScore: 300,
    unlockedByDefault: false,
    requiredStarsForNext: 1,
    badgeAwarded: 'copyright_defender',
    storyBrief: 'Maya created digital art and composed a hit song, but someone copied it without permission! Help Maya enforce her Copyright © rights.'
  },
  {
    id: 'designs_basic',
    tier: 'Basic',
    tierNumber: 1,
    title: 'Product Design Lab',
    subtitle: 'Industrial Designs vs Utility',
    ipCategory: 'Designs',
    icon: 'Palette',
    color: 'from-emerald-500 to-teal-600',
    description: 'Design futuristic products! Learn how Industrial Design registration protects shape and visual appeal without patenting mechanics.',
    maxScore: 300,
    unlockedByDefault: false,
    requiredStarsForNext: 1,
    badgeAwarded: 'design_maestro',
    storyBrief: 'Look at these ergonomic headphones and sleek bottles! Can you separate visual aesthetic shapes from internal technical mechanisms?'
  },

  // --- TIER 2: INTERMEDIATE (IP DETECTIVE) ---
  {
    id: 'detective_case1',
    tier: 'Intermediate',
    tierNumber: 2,
    title: 'Case #101: The Counterfeit Tech',
    subtitle: 'Trademarks & Design Theft Mystery',
    ipCategory: 'Mixed IP',
    icon: 'Search',
    color: 'from-cyan-500 to-blue-600',
    description: 'Investigate fake smartwatch clones sold online with copied logo fonts and identical curved casing.',
    maxScore: 400,
    unlockedByDefault: false,
    requiredStarsForNext: 1,
    badgeAwarded: 'ip_detective',
    storyBrief: 'An illegal factory is making knockoff smartwatches using a registered brand name and copied industrial design. Interrogate suspects and gather legal evidence!'
  },
  {
    id: 'detective_case2',
    tier: 'Intermediate',
    tierNumber: 2,
    title: 'Case #102: The Viral Beat Heist',
    subtitle: 'Music Copyright & Sampling Trial',
    ipCategory: 'Copyrights',
    icon: 'Headphones',
    color: 'from-violet-500 to-purple-600',
    description: 'A famous influencer sampled Maya\'s original music track without a license. Analyze Fair Use vs Copyright infringement.',
    maxScore: 400,
    unlockedByDefault: false,
    requiredStarsForNext: 1,
    badgeAwarded: 'ip_detective',
    storyBrief: 'Did the influencer use Maya\'s music under Fair Use, or is it illegal sampling? Examine the song length, commercial revenue, and credit attribution.'
  },
  {
    id: 'detective_case3',
    tier: 'Intermediate',
    tierNumber: 2,
    title: 'Case #103: The Herbal Secret Battle',
    subtitle: 'Patents vs Traditional Knowledge',
    ipCategory: 'Patents',
    icon: 'Microscope',
    color: 'from-amber-600 to-red-600',
    description: 'A foreign company filed a patent for Neem & Tulsi soap claiming it as their novel discovery. Defend traditional Indian knowledge!',
    maxScore: 400,
    unlockedByDefault: false,
    requiredStarsForNext: 1,
    badgeAwarded: 'ip_detective',
    storyBrief: 'Prove that Neem and Tulsi have been documented in AYUSH texts for centuries to invalidate the bad patent claim!'
  },

  // --- TIER 3: ADVANCED (IP MASTERMIND) ---
  {
    id: 'startup_simulator',
    tier: 'Advanced',
    tierNumber: 3,
    title: 'IP Empire Simulator',
    subtitle: 'CIPAM Startup Founder Challenge',
    ipCategory: 'Mixed IP',
    icon: 'Building2',
    color: 'from-rose-500 via-pink-600 to-amber-500',
    description: 'Launch an Indian student tech startup! Decide IP strategies, file applications with CIPAM, handle licensing deals, and protect your portfolio.',
    maxScore: 500,
    unlockedByDefault: false,
    requiredStarsForNext: 0,
    badgeAwarded: 'startup_tycoon',
    storyBrief: 'You are the Founder of "TechVeda Innovations". Manage your budget, register your Brand, Patent your AI hardware, Copyright your software, and win the CIPAM National Championship!'
  }
];
