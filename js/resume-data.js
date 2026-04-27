/**
 * ResumeGlow — js/resume-data.js
 * Default resume data structure and template configuration
 */

/**
 * Factory: creates a blank resume data object
 * @param {string} [id]
 * @returns {Object}
 */
function createBlankResume(id) {
  return {
    id: id || uid(),
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    photo: '',
    summary: '',
    accentColor: '#d4852a',
    fontSize: 12,
    experience: [
      {
        id: uid(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        bullets: ['']
      }
    ],
    education: [
      {
        id: uid(),
        degree: '',
        school: '',
        year: '',
        gpa: ''
      }
    ],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Factory: creates a sample resume (for demo/first-load)
 * @returns {Object}
 */
function createSampleResume() {
  return {
    id: uid(),
    name: 'Alexandra Chen',
    title: 'Senior Product Designer',
    email: 'alex.chen@email.com',
    phone: '+1 (555) 012-3456',
    location: 'San Francisco, CA',
    website: 'linkedin.com/in/alexchen',
    photo: '',
    summary: 'Award-winning Product Designer with 7+ years crafting intuitive digital experiences for Fortune 500 companies. Led design systems that reduced user drop-off by 34% and increased engagement by 2.4×. Passionate about the intersection of human psychology and technology.',
    accentColor: '#d4852a',
    fontSize: 12,
    experience: [
      {
        id: uid(),
        title: 'Senior Product Designer',
        company: 'Stripe',
        location: 'San Francisco, CA',
        startDate: 'Mar 2021',
        endDate: 'Present',
        bullets: [
          'Led end-to-end redesign of payment flow, increasing conversion rate by 23% and reducing support tickets by 40%.',
          'Built and maintained the Stripe Design System used by 120+ engineers, cutting component build time by 60%.',
          'Mentored 4 junior designers, establishing quarterly design reviews and a shared critique framework.',
          'Collaborated with ML team to design AI-powered fraud detection UI, protecting $2B+ in annual transactions.'
        ]
      },
      {
        id: uid(),
        title: 'Product Designer',
        company: 'Airbnb',
        location: 'San Francisco, CA',
        startDate: 'Jun 2018',
        endDate: 'Feb 2021',
        bullets: [
          'Redesigned host onboarding experience, increasing listing completion rate from 42% to 71%.',
          'Shipped mobile-first search experience to 150M+ users across iOS and Android platforms.',
          'Ran 30+ user research sessions and A/B tests to validate design decisions with data.'
        ]
      }
    ],
    education: [
      {
        id: uid(),
        degree: 'B.F.A. Interaction Design',
        school: 'California College of the Arts',
        year: '2018',
        gpa: 'GPA: 3.9 / 4.0'
      }
    ],
    skills: ['Figma', 'Sketch', 'Framer', 'Prototyping', 'User Research', 'Design Systems', 'Accessibility', 'SQL', 'HTML/CSS', 'Leadership'],
    projects: [
      {
        id: uid(),
        name: 'GlowUI — Open Source Design System',
        link: 'github.com/alexchen/glowui',
        description: 'Built a fully accessible component library with 80+ components used by 2,000+ developers. Featured in Smashing Magazine.',
        tech: 'Figma, React, Storybook, Tailwind CSS'
      }
    ],
    certifications: [
      'Google UX Design Certificate · 2022',
      'Nielsen Norman UX Certification · 2020'
    ],
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Mandarin', level: 'Fluent' },
      { name: 'French', level: 'Intermediate' }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Template definitions
 * Each template drives the preview renderer's CSS class selection
 */
const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    tagline: 'Bold & Structured',
    previewBg: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    accent: '#d4852a',
    cssClass: 'resume-modern'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Clean & Refined',
    previewBg: 'linear-gradient(135deg, #1c1c1c, #2a2a2a)',
    accent: '#b8a990',
    cssClass: 'resume-minimal'
  },
  {
    id: 'executive',
    name: 'Executive',
    tagline: 'Prestige & Authority',
    previewBg: 'linear-gradient(135deg, #0f2027, #203a43)',
    accent: '#c9a96e',
    cssClass: 'resume-executive'
  },
  {
    id: 'creative',
    name: 'Creative',
    tagline: 'Bold & Expressive',
    previewBg: 'linear-gradient(135deg, #2d1b69, #11998e)',
    accent: '#6c63ff',
    cssClass: 'resume-creative'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    tagline: 'Timeless & Classic',
    previewBg: 'linear-gradient(135deg, #2c1810, #4a2c1a)',
    accent: '#c4956a',
    cssClass: 'resume-elegant'
  },
  {
    id: 'tech',
    name: 'Tech',
    tagline: 'Dev-Friendly',
    previewBg: 'linear-gradient(135deg, #0d1117, #161b22)',
    accent: '#58a6ff',
    cssClass: 'resume-tech'
  }
];

/**
 * Accent color presets
 */
const ACCENT_COLORS = [
  { name: 'Amber Gold',    value: '#d4852a' },
  { name: 'Midnight Blue', value: '#2563eb' },
  { name: 'Forest Green',  value: '#16a34a' },
  { name: 'Crimson',       value: '#dc2626' },
  { name: 'Violet',        value: '#7c3aed' },
  { name: 'Teal',          value: '#0d9488' },
  { name: 'Rose',          value: '#e11d48' },
  { name: 'Slate',         value: '#475569' },
  { name: 'Indigo',        value: '#4f46e5' },
  { name: 'Terracotta',    value: '#c2410c' },
  { name: 'Ocean',         value: '#0284c7' },
  { name: 'Charcoal',      value: '#292524' }
];

/**
 * Section visibility options
 */
const DEFAULT_SECTIONS = [
  { key: 'summary',        label: 'Summary',        visible: true },
  { key: 'experience',     label: 'Experience',     visible: true },
  { key: 'education',      label: 'Education',      visible: true },
  { key: 'skills',         label: 'Skills',         visible: true },
  { key: 'projects',       label: 'Projects',       visible: true },
  { key: 'certifications', label: 'Certifications', visible: true },
  { key: 'languages',      label: 'Languages',      visible: true }
];
