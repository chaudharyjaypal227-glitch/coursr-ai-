import { Course } from '../types';

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'ai-saas-nextjs',
    title: 'Full-Stack AI SaaS Development with Next.js & OpenAI',
    slug: 'ai-saas-nextjs',
    shortDescription: 'Build and monetize modern AI-powered software applications from scratch.',
    description: 'Master the end-to-end process of building, deploying, and monetizing scalable AI software products using Next.js, React, Tailwind CSS, Stripe, and OpenAI APIs. Learn how to handle streaming completions, multi-tenant databases, rate limiting, and automated billing.',
    instructor: 'Alex Rivera',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    price: 99,
    originalPrice: 199,
    salePrice: 99,
    rating: 4.9,
    reviews: 1240,
    level: 'Intermediate',
    duration: '14 hours',
    totalLessons: 42,
    category: 'AI Development',
    courseType: 'bundle',
    status: 'published',
    published: true,
    featured: true,
    benefits: [
      'Build 3 production-ready AI SaaS applications',
      'Full downloadable source code ZIP + Architecture PDF Handbook',
      'Integrate subscriptions and secure webhook handling',
      'Implement real-time token streaming and UI states'
    ],
    whatYouWillLearn: [
      'Full-stack architecture with Next.js App Router and Server Actions',
      'OpenAI & Gemini API integration with streaming responses',
      'Database modeling and session security',
      'Production deployment and SEO optimization'
    ],
    files: [
      {
        id: 'file-ai-saas-handbook',
        name: 'AI_SaaS_Architecture_Handbook.pdf',
        type: 'pdf',
        size: 8420000,
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        displayOrder: 1,
        downloadable: true,
        description: 'Comprehensive 85-page Next.js + AI engineering blueprints & system schemas.',
        uploadedAt: '2026-03-01T10:00:00.000Z',
      },
      {
        id: 'file-ai-saas-source',
        name: 'Full_SaaS_Starter_Kit_Source.zip',
        type: 'zip',
        size: 15400000,
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        displayOrder: 2,
        downloadable: true,
        description: 'Complete production repository with Tailwind, Auth, and Database migrations.',
        uploadedAt: '2026-03-01T10:00:00.000Z',
      }
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Foundations & Architecture',
        order: 0,
        lessons: [
          {
            id: 'les-1-1',
            title: 'Welcome to the Course & Architecture Overview',
            duration: '12:30',
            order: 0,
            isFree: true,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          },
          {
            id: 'les-1-2',
            title: 'Setting up the Modern React & Next.js Workspace',
            duration: '18:45',
            order: 1,
            isFree: true,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Building the AI Engine',
        order: 1,
        lessons: [
          {
            id: 'les-2-1',
            title: 'Connecting to OpenAI & Gemini APIs with Streaming',
            duration: '22:15',
            order: 0,
            isFree: false,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          },
          {
            id: 'les-2-2',
            title: 'Vector Databases and Semantic Search (RAG)',
            duration: '25:40',
            order: 1,
            isFree: false,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          }
        ]
      }
    ]
  },
  {
    id: 'deep-dive-system-design-pdf',
    title: 'Modern System Design & Microservices Architecture Handbook',
    slug: 'deep-dive-system-design-pdf',
    shortDescription: 'Comprehensive PDF guide to designing distributed systems, caching tiers, and resilient APIs.',
    description: 'The definitive architectural field guide for software engineers and architects. Covers high-concurrency event processing, database sharding, CAP theorem trade-offs, consensus algorithms (Raft/Paxos), and real-world enterprise architectures with diagrams and step-by-step case studies.',
    instructor: 'Alex Rivera',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    price: 49,
    originalPrice: 99,
    salePrice: 49,
    rating: 4.95,
    reviews: 1850,
    level: 'Advanced',
    duration: '184 Pages',
    pages: 184,
    totalLessons: 12,
    category: 'System Design',
    courseType: 'pdf',
    status: 'published',
    published: true,
    featured: true,
    benefits: [
      '184 pages high-resolution PDF engineering manual',
      'Downloadable offline cheat-sheets & design diagrams',
      'Real-world system design interview walkthroughs',
      'Database sharding and replication formulas'
    ],
    whatYouWillLearn: [
      'High-throughput message brokers and Kafka partitioning',
      'Distributed caching strategies with Redis and Memcached',
      'Idempotency, distributed locking, and saga orchestration',
      'Microservices failure recovery and rate limiting patterns'
    ],
    pdfFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfFileName: 'system-design-handbook-v2.pdf',
    pdfFileSize: 8420000,
    files: [
      {
        id: 'file-sys-design-pdf',
        name: 'System_Design_Comprehensive_Handbook_2026.pdf',
        type: 'pdf',
        size: 8420000,
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        displayOrder: 1,
        downloadable: true,
        description: '184-page complete PDF handbook with architecture diagrams.',
        uploadedAt: '2026-03-01T10:00:00.000Z',
      },
      {
        id: 'file-sys-design-cheatsheets',
        name: 'Architecture_Cheatsheets_Pack.pdf',
        type: 'pdf',
        size: 3200000,
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        displayOrder: 2,
        downloadable: true,
        description: 'Quick-reference cheat-sheets for capacity estimation and system metrics.',
        uploadedAt: '2026-03-01T10:00:00.000Z',
      }
    ],
    modules: []
  },
  {
    id: 'mastering-prompt-engineering',
    title: 'Prompt Engineering & Autonomous LLM Agents',
    slug: 'mastering-prompt-engineering',
    shortDescription: 'Design resilient agentic workflows, chain-of-thought prompts, and autonomous tools.',
    description: 'Go beyond basic chat interactions. Learn the cognitive architectures of modern LLM agents, dynamic memory systems, tool calling, recursive evaluation, and zero-shot reasoning frameworks.',
    instructor: 'Elena Rostova',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    price: 79,
    originalPrice: 149,
    salePrice: 79,
    rating: 4.8,
    reviews: 890,
    level: 'Beginner',
    duration: '10 hours',
    totalLessons: 32,
    category: 'Machine Learning',
    courseType: 'bundle',
    status: 'published',
    published: true,
    featured: true,
    benefits: [
      'Master ReAct and Plan-and-Solve agent frameworks',
      'Downloadable Agent Frameworks Playbook (PDF)',
      'Build autonomous research and coding agents',
      'Optimize token efficiency and reduce latency'
    ],
    whatYouWillLearn: [
      'System prompt design patterns and few-shot calibration',
      'Tool execution and function-calling schemas',
      'Long-term memory vectors and state persistence',
      'Evaluating agent accuracy and reliability'
    ],
    files: [
      {
        id: 'file-prompt-playbook',
        name: 'LLM_Agent_Architecture_Playbook.pdf',
        type: 'pdf',
        size: 6150000,
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        displayOrder: 1,
        downloadable: true,
        description: '142-page tactical manual with production function-calling schemas.',
        uploadedAt: '2026-03-10T12:00:00.000Z',
      }
    ],
    modules: [
      {
        id: 'mod-pe-1',
        title: 'Core Principles of Prompt Engineering',
        order: 0,
        lessons: [
          {
            id: 'les-pe-1',
            title: 'System Prompts & Persona Priming',
            duration: '15:20',
            order: 0,
            isFree: true,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          }
        ]
      }
    ]
  },
  {
    id: 'deep-learning-python',
    title: 'Deep Learning & Neural Networks with PyTorch',
    slug: 'deep-learning-python',
    shortDescription: 'Construct neural network architectures from scratch using PyTorch and Python.',
    description: 'A comprehensive deep dive into convolutional networks, transformers, reinforcement learning, and production inference optimization. Gain deep theoretical understanding paired with hands-on labs.',
    instructor: 'Dr. Marcus Vance',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80',
    price: 119,
    originalPrice: 229,
    salePrice: 119,
    rating: 4.95,
    reviews: 2150,
    level: 'Advanced',
    duration: '22 hours',
    totalLessons: 58,
    category: 'Data Science',
    courseType: 'video',
    status: 'published',
    published: true,
    featured: false,
    benefits: [
      'Build custom neural layers and loss functions',
      'Train vision transformers and diffusion models',
      'Deploy models using ONNX and TensorRT',
      'Portfolio-grade capstone projects'
    ],
    whatYouWillLearn: [
      'Backpropagation mathematics and computational graphs',
      'CNNs for computer vision and object detection',
      'Attention mechanisms and transformer architectures',
      'Distributed training on GPU clusters'
    ],
    modules: [
      {
        id: 'mod-dl-1',
        title: 'Tensors and Autograd',
        order: 0,
        lessons: [
          {
            id: 'les-dl-1',
            title: 'Introduction to PyTorch Tensors',
            duration: '20:10',
            order: 0,
            isFree: true,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          }
        ]
      }
    ]
  },
  {
    id: 'cloud-devops-kubernetes',
    title: 'Cloud Native DevOps: Docker, Kubernetes & Terraform',
    slug: 'cloud-devops-kubernetes',
    shortDescription: 'Architect robust CI/CD pipelines and production Kubernetes clusters on Google Cloud.',
    description: 'Learn modern infrastructure as code, container orchestration, microservices monitoring, and zero-downtime deployment strategies for enterprise web applications.',
    instructor: 'Sarah Jenkins',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    price: 89,
    originalPrice: 169,
    salePrice: 89,
    rating: 4.85,
    reviews: 740,
    level: 'Intermediate',
    duration: '16 hours',
    totalLessons: 46,
    category: 'DevOps & Cloud',
    courseType: 'bundle',
    status: 'published',
    published: true,
    featured: false,
    benefits: [
      'Write modular Terraform configurations',
      'Configure auto-scaling Kubernetes clusters',
      'Downloadable Cloud-Native Kubernetes & Docker Manual (PDF)',
      'Implement Prometheus and Grafana dashboards'
    ],
    whatYouWillLearn: [
      'Docker multi-stage builds and security scanning',
      'Helm chart packaging and deployment',
      'Ingress controllers, TLS cert-manager, and DNS',
      'Infrastructure disaster recovery and backup'
    ],
    files: [
      {
        id: 'file-devops-manual',
        name: 'Kubernetes_DevOps_Production_Manual.pdf',
        type: 'pdf',
        size: 11200000,
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        displayOrder: 1,
        downloadable: true,
        description: '210-page enterprise reference manual for container orchestration.',
        uploadedAt: '2026-03-15T08:00:00.000Z',
      }
    ],
    modules: [
      {
        id: 'mod-dev-1',
        title: 'Containerization with Docker',
        order: 0,
        lessons: [
          {
            id: 'les-dev-1',
            title: 'Docker Fundamentals for Developers',
            duration: '14:40',
            order: 0,
            isFree: true,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          }
        ]
      }
    ]
  }
];

export const DEFAULT_PDF_COURSES = DEFAULT_COURSES.filter(c => c.courseType === 'pdf' || (c.files && c.files.length > 0));

