export interface BadgeItem {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  unlockedByDefault?: boolean;
}

export const BADGES_LIST: BadgeItem[] = [
  {
    id: 'patent_pioneer',
    name: 'Patent Pioneer',
    title: 'Master Inventor',
    description: 'Successfully categorized 5 inventions and protected Alex\'s Solar Backpack innovation!',
    icon: 'Lightbulb',
    color: 'from-amber-400 to-yellow-600',
    requirement: 'Complete Level 1: Patents Workshop'
  },
  {
    id: 'brand_guardian',
    name: 'Brand Guardian',
    title: 'Trademark Shield',
    description: 'Saved local startups from counterfeit products and identified authentic ™ and ® marks!',
    icon: 'ShieldCheck',
    color: 'from-blue-500 to-indigo-600',
    requirement: 'Complete Level 1: Trademark Rescue'
  },
  {
    id: 'copyright_defender',
    name: 'Copyright Defender',
    title: 'Fair Use Champion',
    description: 'Defended Maya\'s digital art and songs while distinguishing Fair Use from piracy!',
    icon: 'Music',
    color: 'from-purple-500 to-pink-600',
    requirement: 'Complete Level 1: Creator Studio'
  },
  {
    id: 'design_maestro',
    name: 'Design Maestro',
    title: 'Aesthetic Visionary',
    description: 'Mastered visual industrial designs and distinguished visual shape from technical utility!',
    icon: 'Palette',
    color: 'from-emerald-400 to-teal-600',
    requirement: 'Complete Level 1: Design Lab'
  },
  {
    id: 'ip_detective',
    name: 'IP Detective',
    title: 'Case File Master',
    description: 'Solved the Counterfeit Tech Mystery & Viral Song Theft case files with perfect legal evidence!',
    icon: 'Search',
    color: 'from-cyan-400 to-blue-600',
    requirement: 'Solve Level 2 Detective Cases'
  },
  {
    id: 'startup_tycoon',
    name: 'IP Startup Tycoon',
    title: 'Empire Builder',
    description: 'Built a 100% compliant Indian IP portfolio for a school tech startup with CIPAM registration!',
    icon: 'Building2',
    color: 'from-rose-500 to-orange-600',
    requirement: 'Complete Level 3 Startup Simulator'
  },
  {
    id: 'cipam_champion',
    name: 'CIPAM Youth IP Champion',
    title: 'National IP Hero',
    description: 'Achieved 3 stars across all modules and earned the Official CIPAM IPR Certificate!',
    icon: 'Award',
    color: 'from-yellow-400 via-amber-500 to-amber-700',
    requirement: 'Complete All Game Progression Levels'
  }
];
