// Preset configurations for different project types
export interface ProjectPreset {
  name: string;
  description: string;
  languages: string;
  frameworks: string;
  packageManager: string;
  styling: string;
  stateManagement: string;
  backend: string;
}

// Module-based presets for quick configuration
export interface ModulePreset {
  name: string;
  description: string;
  modules: string[];
  advisory: string[]; // Modules that should be warn-only
}

export const MODULE_PRESETS: Record<string, ModulePreset> = {
  'startup-mvp': {
    name: 'Startup MVP',
    description: 'Fast iteration with essential safety',
    modules: ['exploratory-spike', 'security', 'documentation'],
    advisory: ['security', 'documentation']
  },
  'enterprise-api': {
    name: 'Enterprise API',
    description: 'Full safety for production systems',
    modules: ['security', 'ops-production-safety', 'database-data-integrity', 
              'tdd', 'code-review', 'api-design', 'documentation', 'performance'],
    advisory: []
  },
  'open-source-library': {
    name: 'Open Source Library',
    description: 'Quality code, no ops overhead',
    modules: ['tdd', 'code-review', 'documentation', 'api-design'],
    advisory: []
  },
  'legacy-modernization': {
    name: 'Legacy Modernization',
    description: 'Safe incremental refactoring',
    modules: ['legacy-migration', 'tdd', 'documentation'],
    advisory: []
  }
};

export const PROJECT_PRESETS: Record<string, ProjectPreset> = {
  'modern-web-app': {
    name: 'Modern Web App (Greenfield)',
    description: 'Latest tech stack for new projects',
    languages: 'TypeScript',
    frameworks: 'React (Vite), Tailwind CSS',
    packageManager: 'pnpm',
    styling: 'Tailwind CSS',
    stateManagement: 'Zustand',
    backend: 'Supabase / Firebase',
  },
  'enterprise-web': {
    name: 'Enterprise Web App',
    description: 'Stable, well-supported stack for large organizations',
    languages: 'TypeScript',
    frameworks: 'React, Next.js, Material-UI',
    packageManager: 'npm',
    styling: 'Material-UI, CSS Modules',
    stateManagement: 'Redux Toolkit',
    backend: 'Node.js (Express), PostgreSQL',
  },
  'legacy-modernization': {
    name: 'Legacy Project (Cash Cow)',
    description: 'Modernizing existing legacy applications',
    languages: 'JavaScript, TypeScript (gradual migration)',
    frameworks: 'jQuery → React (incremental), Bootstrap',
    packageManager: 'npm',
    styling: 'Bootstrap, SASS',
    stateManagement: 'Context API',
    backend: 'Existing backend (REST APIs)',
  },
  'fullstack-node': {
    name: 'Full-Stack Node.js',
    description: 'Complete JavaScript/TypeScript stack',
    languages: 'TypeScript, JavaScript',
    frameworks: 'React, Express, Node.js',
    packageManager: 'npm',
    styling: 'Tailwind CSS',
    stateManagement: 'React Query, Zustand',
    backend: 'Express, PostgreSQL, Prisma',
  },
  'jamstack': {
    name: 'JAMstack / Static Site',
    description: 'Fast, secure, scalable static sites',
    languages: 'TypeScript, JavaScript',
    frameworks: 'Next.js, Gatsby, Astro',
    packageManager: 'pnpm',
    styling: 'Tailwind CSS, CSS Modules',
    stateManagement: 'React Context',
    backend: 'Headless CMS (Strapi, Contentful), Serverless Functions',
  },
  'mobile-hybrid': {
    name: 'Mobile Hybrid App',
    description: 'Cross-platform mobile applications',
    languages: 'TypeScript, JavaScript',
    frameworks: 'React Native, Expo',
    packageManager: 'npm',
    styling: 'React Native StyleSheet, NativeBase',
    stateManagement: 'Redux Toolkit, React Query',
    backend: 'Firebase, REST APIs',
  },
  'vue-ecosystem': {
    name: 'Vue.js Ecosystem',
    description: 'Vue-based web applications',
    languages: 'TypeScript, JavaScript',
    frameworks: 'Vue 3, Nuxt, Vite',
    packageManager: 'pnpm',
    styling: 'Tailwind CSS, Vuetify',
    stateManagement: 'Pinia',
    backend: 'Node.js, Express',
  },
  'python-fullstack': {
    name: 'Python Full-Stack',
    description: 'Python backend with modern frontend',
    languages: 'Python, TypeScript',
    frameworks: 'Django/FastAPI, React',
    packageManager: 'pip (backend), npm (frontend)',
    styling: 'Tailwind CSS',
    stateManagement: 'Zustand, React Query',
    backend: 'Django, FastAPI, PostgreSQL',
  },
  'microservices': {
    name: 'Microservices Architecture',
    description: 'Distributed system with multiple services',
    languages: 'TypeScript, Go, Python',
    frameworks: 'Node.js, Express, gRPC',
    packageManager: 'npm, go modules',
    styling: 'Tailwind CSS (frontend)',
    stateManagement: 'Redux Toolkit',
    backend: 'Docker, Kubernetes, PostgreSQL, Redis, RabbitMQ',
  },
  'serverless': {
    name: 'Serverless Application',
    description: 'Cloud-native serverless architecture',
    languages: 'TypeScript, JavaScript',
    frameworks: 'Next.js, AWS Lambda, API Gateway',
    packageManager: 'npm',
    styling: 'Tailwind CSS',
    stateManagement: 'React Query, Zustand',
    backend: 'AWS Lambda, DynamoDB, S3, CloudFront',
  },
};

// Individual field presets for more granular control
export const FIELD_PRESETS = {
  languages: [
    'TypeScript',
    'JavaScript',
    'TypeScript, JavaScript',
    'Python',
    'Python, TypeScript',
    'Go',
    'Rust',
    'Java',
    'C#, .NET',
    'PHP',
    'Ruby',
  ],
  frameworks: [
    'React (Vite)',
    'React, Next.js',
    'Vue 3, Vite',
    'Angular',
    'Svelte, SvelteKit',
    'Astro',
    'Express, Node.js',
    'Django',
    'FastAPI',
    'Flask',
    'Spring Boot',
    'ASP.NET Core',
    'Laravel',
    'Ruby on Rails',
  ],
  packageManagers: [
    'npm',
    'pnpm',
    'yarn',
    'bun',
  ],
  styling: [
    'Tailwind CSS',
    'CSS Modules',
    'Styled Components',
    'Emotion',
    'SASS/SCSS',
    'Material-UI',
    'Chakra UI',
    'Bootstrap',
    'Ant Design',
    'Mantine',
  ],
  stateManagement: [
    'Zustand',
    'Redux Toolkit',
    'React Query',
    'Context API',
    'Pinia (Vue)',
    'Vuex (Vue)',
    'MobX',
    'Jotai',
    'Recoil',
    'XState',
  ],
  backend: [
    'Supabase',
    'Firebase',
    'Node.js, Express',
    'PostgreSQL',
    'MongoDB',
    'MySQL',
    'Redis',
    'AWS (Lambda, DynamoDB, S3)',
    'Google Cloud',
    'Azure',
    'REST APIs',
    'GraphQL',
    'tRPC',
  ],
};
