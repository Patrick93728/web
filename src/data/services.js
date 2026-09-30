import {
  Globe,
  Smartphone,
  Palette,
  Server,
  Bug,
  Zap,
  Wrench,
  LayoutDashboard,
} from 'lucide-react';

export const services = [
  {
    id: 'web-dev',
    icon: Globe,
    title: 'Website Development',
    description:
      'Build responsive and functional websites that help businesses, organizations, and individuals establish a professional online presence.',
    deliverables: [
      'Business websites',
      'Landing pages',
      'Portfolio websites',
      'Responsive layouts',
      'Frontend development',
      'Backend integration',
      'Contact forms',
    ],
  },
  {
    id: 'mobile-dev',
    icon: Smartphone,
    title: 'Mobile App Development',
    description:
      'Develop mobile applications that provide useful experiences for customers, employees, students, or organizations.',
    deliverables: [
      'Flutter applications',
      'React Native applications',
      'Cross-platform app interfaces',
      'API integration',
      'Authentication flows',
      'Data-driven screens',
    ],
  },
  {
    id: 'uiux',
    icon: Palette,
    title: 'UI/UX Design',
    description:
      'Design interfaces that are visually organized, easy to understand, and aligned with the needs of the intended users.',
    deliverables: [
      'User flows',
      'Wireframes',
      'High-fidelity interface designs',
      'Mobile app screens',
      'Interactive prototypes',
      'Design systems',
    ],
  },
  {
    id: 'backend-api',
    icon: Server,
    title: 'Backend & API Integration',
    description:
      'Connect applications to backend services, databases, and external tools to support real functionality.',
    deliverables: [
      'REST API integration',
      'Database connectivity',
      'Authentication & authorization',
      'Third-party service integration',
      'Error handling',
      'Basic backend development',
    ],
  },
  {
    id: 'testing',
    icon: Bug,
    title: 'Software Testing & Bug Fixing',
    description:
      'Help identify application issues and improve reliability through structured testing and debugging.',
    deliverables: [
      'Functional testing',
      'UI testing',
      'Bug investigation',
      'Regression checks',
      'Debugging support',
      'Issue documentation',
    ],
  },
  {
    id: 'automation',
    icon: Zap,
    title: 'Business Automation & AI Integration',
    description:
      'Explore practical ways to simplify repetitive workflows and connect business processes with digital tools.',
    deliverables: [
      'Workflow automation',
      'AI API integration',
      'Chatbot features',
      'Data processing scripts',
      'Internal productivity tools',
    ],
  },
  {
    id: 'maintenance',
    icon: Wrench,
    title: 'Website & App Maintenance',
    description:
      'Support existing websites and applications through updates, troubleshooting, and incremental improvements.',
    deliverables: [
      'Bug fixes',
      'Feature updates',
      'Dependency updates',
      'UI improvements',
      'Troubleshooting',
      'Technical handover support',
    ],
  },
  {
    id: 'dashboards',
    icon: LayoutDashboard,
    title: 'Admin Dashboards & Business Systems',
    description:
      'Create internal tools that help organizations manage information, workflows, and daily operations.',
    deliverables: [
      'Admin dashboards',
      'Attendance systems',
      'Inventory systems',
      'Booking systems',
      'CRUD applications',
      'Role-based access',
      'Data visualization',
    ],
  },
];
