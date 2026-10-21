// ═══════════════════════════════════════════════════════════════════
// Gumroad Clone — Comprehensive Final Year Project Seed Script
// ═══════════════════════════════════════════════════════════════════
// Run: cd packages/db && bun run db:seed
// All accounts password: Password123!
// ═══════════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = "738786efab72bf9d9067e0c02fddbcaf";
  const key = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${key.toString("hex")}`;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatLicenseKey(): string {
  const part = () => randomBytes(2).toString("hex").toUpperCase();
  return `DIGI-${part()}-${part()}-${part()}`;
}

const HASHED_PASSWORD = hashPassword("Password123!");

// ─── Users ──────────────────────────────────────────────────────────

interface UserSeed {
  id: string;
  name: string;
  email: string;
  role: "admin" | "creator" | "user";
  username: string | null;
  bio: string | null;
  accentColor: string;
  socialTwitter: string | null;
  socialWebsite: string | null;
  image: string | null;
}

const users: UserSeed[] = [
  // ─ Admin
  {
    id: "usr_admin",
    name: "System Administrator",
    email: "admin@example.com",
    role: "admin",
    username: "admin",
    bio: "Platform Administrator overseeing DigiStore transactions, security, and creators.",
    accentColor: "#EF4444",
    socialTwitter: null,
    socialWebsite: "https://digistore.internal",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=admin",
  },
  // ─ Creators
  {
    id: "usr_marcusjohnson",
    name: "Marcus Johnson",
    email: "marcusjohnson@example.com",
    role: "creator",
    username: "marcusjohnson",
    bio: "Senior Cloud Architect & OSS Builder. Author of production Next.js & Go microservices. Saving engineers 100+ hours.",
    accentColor: "#10B981",
    socialTwitter: "https://twitter.com/marcusdev",
    socialWebsite: "https://marcusjohnson.dev",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_alexchen",
    name: "Alex Chen",
    email: "alexchen@example.com",
    role: "creator",
    username: "alexchen",
    bio: "Staff UI/UX Designer previously at Stripe & Figma. Creating design systems, Figma component kits, and accessible design tokens.",
    accentColor: "#6366F1",
    socialTwitter: "https://twitter.com/alexchenui",
    socialWebsite: "https://alexchen.design",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_yukitanaka",
    name: "Yuki Tanaka",
    email: "yukitanaka@example.com",
    role: "creator",
    username: "yukitanaka",
    bio: "3D Visual Artist & Motion Designer. Crafting Blender geometry node shaders, photorealistic environments, and game-ready assets.",
    accentColor: "#14B8A6",
    socialTwitter: "https://twitter.com/yukitanaka3d",
    socialWebsite: "https://yukitanaka.art",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_davidkim",
    name: "David Kim",
    email: "davidkim@example.com",
    role: "creator",
    username: "davidkim",
    bio: "Grammy-nominated Music Producer & Sound Designer. Creating curated sample libraries, analog synth patches, and mixing courses.",
    accentColor: "#8B5CF6",
    socialTwitter: "https://twitter.com/davidkimmusic",
    socialWebsite: "https://davidkim.audio",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_sarahmitchell",
    name: "Sarah Mitchell",
    email: "sarahmitchell@example.com",
    role: "creator",
    username: "sarahmitchell",
    bio: "Commercial Photographer & Colorist. Lightroom master presets featured in National Geographic & Vogue. Helping 40,000+ photographers level up.",
    accentColor: "#F59E0B",
    socialTwitter: "https://twitter.com/sarahmitchell",
    socialWebsite: "https://sarahmitchell.photo",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_emmarodriguez",
    name: "Emma Rodriguez",
    email: "emmarodriguez@example.com",
    role: "creator",
    username: "emmarodriguez",
    bio: "Sci-Fi & Fantasy Author, Editor & Story Consultant. Helping aspiring writers outline, draft, and publish best-selling novels.",
    accentColor: "#EF4444",
    socialTwitter: "https://twitter.com/emmarodriguez",
    socialWebsite: "https://emmarodriguez.com",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_jamesobrien",
    name: "James O'Brien",
    email: "jamesobrien@example.com",
    role: "creator",
    username: "jamesobrien",
    bio: "Bootstrapped Founder (scaled 2 SaaS products to ₹10Cr+ ARR). Sharing tactical Notion operating systems, pitch playbooks, and SaaS frameworks.",
    accentColor: "#F97316",
    socialTwitter: "https://twitter.com/jamesobrien",
    socialWebsite: "https://jamesobrien.biz",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_priyasharma",
    name: "Priya Sharma",
    email: "priyasharma@example.com",
    role: "creator",
    username: "priyasharma",
    bio: "Illustrator & Concept Artist. Procreate & Photoshop brush artisan. Guiding digital artists with anatomical studies and master tutorials.",
    accentColor: "#EC4899",
    socialTwitter: "https://twitter.com/priyasharma",
    socialWebsite: "https://priyasharma.art",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_alanturing",
    name: "Dr. Alan Turing",
    email: "alanturing@example.com",
    role: "creator",
    username: "alanturing",
    bio: "Computer Science Professor & Competitive Programming Coach. Demystifying distributed systems, data structures, and practical AI engineering.",
    accentColor: "#3B82F6",
    socialTwitter: "https://twitter.com/alanturing_edu",
    socialWebsite: "https://alanturing.institute",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_kainakamura",
    name: "Kai Nakamura",
    email: "kainakamura@example.com",
    role: "creator",
    username: "kainakamura",
    bio: "Manga Artist & Storyboard Director. Creator of sci-fi comic series 'Neon Tokyo 2099' and comic production toolkits.",
    accentColor: "#EC4899",
    socialTwitter: "https://twitter.com/kainakamura_art",
    socialWebsite: "https://kainakamura.studio",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_chloedubois",
    name: "Chloé Dubois",
    email: "chloedubois@example.com",
    role: "creator",
    username: "chloedubois",
    bio: "Cannes-selected Cinematographer & Senior Colorist. Crafting film emulation LUTs, motion graphics packages, and cinematic video assets.",
    accentColor: "#F59E0B",
    socialTwitter: "https://twitter.com/chloeduboisfilm",
    socialWebsite: "https://chloedubois.film",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_samuelvance",
    name: "Samuel Vance",
    email: "samuelvance@example.com",
    role: "creator",
    username: "samuelvance",
    bio: "Audio Engineer & Podcaster with 12M+ downloads. Sharing broadcast-grade mastering presets, vocal chains, and foley sound effects.",
    accentColor: "#3B82F6",
    socialTwitter: "https://twitter.com/samuelvanceaudio",
    socialWebsite: "https://vanceaudio.co",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },

  // ─ Buyers (Students & Professionals)
  {
    id: "usr_demo_buyer",
    name: "Alex Hunter (Demo Buyer)",
    email: "buyer@example.com",
    role: "user",
    username: "alexhunter",
    bio: "Tech Lead & Digital Enthusiast. Subscribed to leading design and software engineering creators.",
    accentColor: "#6366F1",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_oliviachen",
    name: "Olivia Chen",
    email: "oliviachen@example.com",
    role: "user",
    username: null,
    bio: null,
    accentColor: "#EC4899",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_noahwilliams",
    name: "Noah Williams",
    email: "noahwilliams@example.com",
    role: "user",
    username: null,
    bio: null,
    accentColor: "#10B981",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_avapatel",
    name: "Ava Patel",
    email: "avapatel@example.com",
    role: "user",
    username: null,
    bio: null,
    accentColor: "#F59E0B",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_liamrodriguez",
    name: "Liam Rodriguez",
    email: "liam@example.com",
    role: "user",
    username: null,
    bio: null,
    accentColor: "#8B5CF6",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "usr_sophiakim",
    name: "Sophia Kim",
    email: "sophia@example.com",
    role: "user",
    username: null,
    bio: null,
    accentColor: "#14B8A6",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
];

// ─── Products Definition (2-3 per Category) ─────────────────────────

interface ProductFileSeed {
  fileName: string;
  fileSizeBytes: bigint;
  fileType: string;
}

interface ProductSeed {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  priceCents: number;
  productType: "digital" | "membership" | "course";
  recurrence?: "monthly" | "yearly" | null;
  thumbnailUrl: string;
  coverUrl: string;
  category: string;
  tags: string[];
  callToAction: string;
  publishedAt: Date;
  isPayWhatYouWant: boolean;
  minPriceCents: number;
  suggestedPriceCents: number | null;
  systemRequirements?: string;
  files: ProductFileSeed[];
}

const products: ProductSeed[] = [
  // ═══════════════════════════════════════════════════════════════════
  // 1. SOFTWARE DEVELOPMENT
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_nextsaas_starter",
    creatorId: "usr_marcusjohnson",
    name: "NextSaaS Pro — Next.js 15 & AI Starter Kit",
    slug: "nextsaas-pro-starter",
    summary: "Production-ready SaaS template with Next.js 15 App Router, Better-Auth, Polar/Stripe billing, and TailwindCSS.",
    description: `# NextSaaS Pro Starter Kit

Launch your micro-SaaS in days, not months. Built with enterprise standards, maximum performance, and production-tested security.

### What's Inside:
- ⚡ **Next.js 15 App Router** with React Server Components & Turbopack
- 🔐 **Better-Auth Authentication** (Email, Google, GitHub, 2FA, Magic Links)
- 💳 **Pre-configured Checkout & Subscriptions** (Polar & Stripe integrated)
- 🗄️ **Prisma ORM & PostgreSQL** with multi-tenant workspace architecture
- 🎨 **Neo-Brutalist & Tailwind UI Components** with Dark/Light mode tokens
- 🤖 **OpenAI & Anthropic Streaming Integration** with edge route handlers

> "Saved me over 80 hours building my latest AI SaaS MVP." — Sarah K., Indie Hacker`,
    priceCents: 8900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "software",
    tags: ["nextjs", "saas", "react", "typescript", "starter-kit"],
    callToAction: "Get Instant Access",
    publishedAt: daysAgo(120),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    systemRequirements: "Node.js 20+ or Bun 1.1+\nPostgreSQL database\nGit",
    files: [
      { fileName: "nextsaas-pro-v2.4.zip", fileSizeBytes: BigInt(18540000), fileType: "application/zip" },
      { fileName: "NextSaaS-Production-Guide.pdf", fileSizeBytes: BigInt(4200000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_devops_guild",
    creatorId: "usr_marcusjohnson",
    name: "DevOps & Cloud Architecture Guild",
    slug: "devops-cloud-guild",
    summary: "Monthly membership for engineers. Access battle-tested Terraform templates, Kubernetes recipes, and private office hours.",
    description: `# DevOps & Cloud Architecture Guild (Monthly Membership)

Join an exclusive community of 500+ DevOps and backend engineers leveling up their infrastructure craft.

### Monthly Membership Perks:
- 📦 **Monthly Production Infrastructure Blueprint** (Terraform, Docker Compose, Helm)
- 💬 **Private VIP Discord Community** with direct architect office hours
- 🔒 **Zero-Trust Security & Cost-Optimization Audits**
- 🚀 **Monthly Live Architecture Teardowns** (Simulating 1M+ req/sec scale)

*Cancel anytime with 1 click. Access valid through current billing period.*`,
    priceCents: 2900,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "software",
    tags: ["devops", "cloud", "terraform", "kubernetes", "membership"],
    callToAction: "Join the Guild",
    publishedAt: daysAgo(90),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    systemRequirements: "Docker & AWS/GCP account recommended",
    files: [
      { fileName: "Cloud-Architecture-Playbook-2026.pdf", fileSizeBytes: BigInt(6500000), fileType: "application/pdf" },
      { fileName: "terraform-starter-modules.zip", fileSizeBytes: BigInt(12400000), fileType: "application/zip" },
    ],
  },
  {
    id: "prd_devlens_desktop",
    creatorId: "usr_marcusjohnson",
    name: "DevLens — Desktop API Debugger & Network Inspector",
    slug: "devlens-api-debugger",
    summary: "High-performance native desktop tool for inspecting HTTP, WebSocket, and gRPC traffic. Licensed software.",
    description: `# DevLens Desktop API Debugger

A blazing-fast, lightweight alternative to bloated API tools. Inspect, intercept, and replay network traffic locally.

### Features:
- ⚡ Sub-millisecond response latency benchmarking
- 🔌 Full WebSocket & SSE stream timeline inspector
- 🔑 Includes 3 device seat activations (Gumroad v2 license key validation)
- 🛡️ 100% offline-first; no data ever leaves your computer`,
    priceCents: 4900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "software",
    tags: ["devtools", "api", "desktop", "license-key", "software"],
    callToAction: "Buy DevLens License",
    publishedAt: daysAgo(75),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    systemRequirements: "macOS 12+, Windows 10/11, or Ubuntu 22.04 LTS",
    files: [
      { fileName: "DevLens-Setup-v2.1.exe", fileSizeBytes: BigInt(68500000), fileType: "application/octet-stream" },
      { fileName: "DevLens-Documentation-and-Shortcuts.pdf", fileSizeBytes: BigInt(3100000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 2. DESIGN
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_aurora_ui_kit",
    creatorId: "usr_alexchen",
    name: "Aurora UI Kit — 500+ Figma Components",
    slug: "aurora-ui-kit",
    summary: "500+ pixel-perfect Figma components with dark/light themes, auto-layout 5.0, and responsive design tokens.",
    description: `# Aurora UI Kit — 500+ Figma Components

The ultimate design system starter kit. Crafted following the official Figma component architecture guidelines.

### What's Included:
- 🎨 **500+ Variants** (Buttons, Inputs, Selectors, Modals, Breadcrumbs, Badges)
- 🌓 **Full Dark / Light System Modes** with calibrated contrast ratios
- 📐 **100% Auto-Layout 5.0** (Responsive across desktop, tablet, and mobile)
- 🔠 **Typography Scales & Semantic Colors** mapped to standard Tailwind tokens`,
    priceCents: 4900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "design",
    tags: ["figma", "ui-kit", "components", "design-system", "dashboard"],
    callToAction: "Download UI Kit",
    publishedAt: daysAgo(160),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "aurora-ui-kit-tokens.fig", fileSizeBytes: BigInt(34500000), fileType: "application/octet-stream" },
      { fileName: "Aurora-Component-Architecture.pdf", fileSizeBytes: BigInt(5200000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_figma_membership",
    creatorId: "usr_alexchen",
    name: "Figma Mastery VIP Club",
    slug: "figma-mastery-vip",
    summary: "Monthly design subscription. Get fresh SaaS UI layouts, monthly design audits, and interactive component libraries.",
    description: `# Figma Mastery VIP Club

Upgrade your UI/UX workflow with monthly drops of curated components, screens, and design critique sessions.

### Member Perks:
- ✨ 2 new production web app dashboards dropped every month
- 🎙️ Monthly live portfolio & UI critique livestream
- ⚡ Access to private component requests Discord`,
    priceCents: 1900,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "design",
    tags: ["figma", "membership", "uiux", "templates", "design"],
    callToAction: "Subscribe to VIP Club",
    publishedAt: daysAgo(80),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Figma-Mastery-Curriculum.pdf", fileSizeBytes: BigInt(3800000), fileType: "application/pdf" },
      { fileName: "exclusive-design-assets-vol1.zip", fileSizeBytes: BigInt(22000000), fileType: "application/zip" },
    ],
  },
  {
    id: "prd_brand_mockups",
    creatorId: "usr_alexchen",
    name: "Minimalist Brand Identity Mockups & Guidelines",
    slug: "brand-identity-mockups",
    summary: "25 ultra-realistic PSD mockups and brand identity guideline templates for client presentations.",
    description: `# Minimalist Brand Identity Mockups & Guidelines

Present brand guidelines like a high-end agency. Photorealistic shadows, smart objects, and customizable textures.`,
    priceCents: 3500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "design",
    tags: ["mockup", "branding", "photoshop", "presentation", "guidelines"],
    callToAction: "Get Mockup Pack",
    publishedAt: daysAgo(100),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Brand-Identity-Mockups-Pack.zip", fileSizeBytes: BigInt(185000000), fileType: "application/zip" },
      { fileName: "Brand-Presentation-Guide.pdf", fileSizeBytes: BigInt(4100000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 3. 3D & ANIMATION
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_cyberpunk_3d",
    creatorId: "usr_yukitanaka",
    name: "Cyberpunk Sci-Fi Environment Kit & Shaders",
    slug: "cyberpunk-3d-environment-kit",
    summary: "60+ modular 3D buildings, neon signs, and procedural shaders for Blender 4.2 & Unreal Engine 5.",
    description: `# Cyberpunk Sci-Fi Environment Kit

Create sprawling neon-lit futuristic cities in minutes. Optimized for real-time rendering and cinematic ray-tracing.`,
    priceCents: 4500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3d",
    tags: ["blender", "unreal-engine", "cyberpunk", "3d-models", "assets"],
    callToAction: "Get 3D Assets",
    publishedAt: daysAgo(110),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Cyberpunk-Environment-Blender.zip", fileSizeBytes: BigInt(142000000), fileType: "application/zip" },
      { fileName: "Shader-Nodes-Manual.pdf", fileSizeBytes: BigInt(6800000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_3d_patron_pass",
    creatorId: "usr_yukitanaka",
    name: "3D Asset Vault & Monthly Blender Drops",
    slug: "3d-asset-vault-pass",
    summary: "Monthly membership for 3D animators and indie game developers. 5 fresh rigged models every month.",
    description: `# 3D Asset Vault (Monthly Membership)

Unlock our complete library of 150+ game-ready 3D models with commercial license, plus 5 new asset packs every 30 days.`,
    priceCents: 2500,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3d",
    tags: ["blender", "membership", "rigged-models", "gamedev", "assets"],
    callToAction: "Subscribe to Asset Vault",
    publishedAt: daysAgo(60),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Asset-Vault-Commercial-License.pdf", fileSizeBytes: BigInt(2100000), fileType: "application/pdf" },
      { fileName: "blender-monthly-pack-july.zip", fileSizeBytes: BigInt(98000000), fileType: "application/zip" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 4. MUSIC & SOUND DESIGN
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_lofi_stems",
    creatorId: "usr_davidkim",
    name: "Midnight Lofi & Chillhop Master Sample Library",
    slug: "midnight-lofi-sample-pack",
    summary: "800+ royalty-free analog drum breaks, vinyl keys, lush Rhodes chords, and warm basslines recorded through tape.",
    description: `# Midnight Lofi & Chillhop Master Library

Analog warmth recorded through vintage tape machines. 100% royalty-free for commercial music releases and streams.`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "music",
    tags: ["lofi", "samples", "beats", "audio", "production"],
    callToAction: "Download Sample Library",
    publishedAt: daysAgo(140),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Midnight-Lofi-Lossless-WAV-Stems.zip", fileSizeBytes: BigInt(512000000), fileType: "application/zip" },
      { fileName: "Royalty-Free-Audio-License.pdf", fileSizeBytes: BigInt(1800000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_producer_syndicate",
    creatorId: "usr_davidkim",
    name: "Producer Syndicate — Monthly Sample & Preset Drop",
    slug: "producer-syndicate-pass",
    summary: "Monthly recurring subscription for beatmakers. New 24-bit sample kit + Serum presets + project stems every month.",
    description: `# Producer Syndicate (Monthly Subscription)

Never run out of inspiration. Every 30 days, receive an exclusive, unreleased sample pack and Serum soundbank directly to your dashboard.`,
    priceCents: 1500,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "music",
    tags: ["membership", "samples", "serum", "ableton", "music"],
    callToAction: "Join Producer Syndicate",
    publishedAt: daysAgo(70),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Producer-Syndicate-Welcome-Guide.pdf", fileSizeBytes: BigInt(2600000), fileType: "application/pdf" },
      { fileName: "syndicate-sample-drop-vol3.zip", fileSizeBytes: BigInt(180000000), fileType: "application/zip" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 5. PHOTOGRAPHY
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_golden_hour_presets",
    creatorId: "usr_sarahmitchell",
    name: "Golden Hour Cinematic Lightroom Presets",
    slug: "golden-hour-lightroom-presets",
    summary: "30 professional Lightroom Desktop & Mobile presets for portraits, golden hour landscapes, and film tones.",
    description: `# Golden Hour Cinematic Lightroom Presets

Crafted over 8 years of editorial and travel shoots. Gives skin tones a rich, warm, filmic glow in just one click.`,
    priceCents: 2400,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "photography",
    tags: ["lightroom", "presets", "photography", "portrait", "color-grading"],
    callToAction: "Get Presets",
    publishedAt: daysAgo(170),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Golden-Hour-Presets-DNG-XMP.zip", fileSizeBytes: BigInt(26000000), fileType: "application/zip" },
      { fileName: "Lightroom-Mobile-Installation-Manual.pdf", fileSizeBytes: BigInt(3200000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_photo_collective",
    creatorId: "usr_sarahmitchell",
    name: "Pro Photography Collective & Raw Critiques",
    slug: "pro-photo-collective",
    summary: "Monthly membership with weekly RAW editing breakdowns, live photo critiques, and editorial client pitch decks.",
    description: `# Pro Photography Collective (Monthly Membership)

Transform your photography from a hobby into a thriving freelance business.

### Included with Membership:
- 📷 Weekly downloadable high-res RAW files for practice
- 🎥 Step-by-step Lightroom & Photoshop color grading masterclasses
- 📝 Pitch deck templates that have won ₹10L+ commercial contracts`,
    priceCents: 2000,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "photography",
    tags: ["photography", "membership", "critique", "raw", "editing"],
    callToAction: "Join the Collective",
    publishedAt: daysAgo(65),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Commercial-Photography-Rate-Card.pdf", fileSizeBytes: BigInt(2900000), fileType: "application/pdf" },
      { fileName: "Sample-RAW-Files-Pack.zip", fileSizeBytes: BigInt(140000000), fileType: "application/zip" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 6. WRITING & PUBLISHING
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_fiction_blueprint",
    creatorId: "usr_emmarodriguez",
    name: "The Fiction Writer's Master Blueprint: Outline to Publication",
    slug: "fiction-writers-blueprint",
    summary: "Comprehensive 200-page guide with plotting worksheets, three-act story structures, and query letter templates.",
    description: `# The Fiction Writer's Master Blueprint

Everything you need to write and publish your novel. Covers pacing, character arcs, worldbuilding, and querying agents.`,
    priceCents: 2700,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "fiction",
    tags: ["writing", "novel", "fiction", "publishing", "guide"],
    callToAction: "Get the Blueprint",
    publishedAt: daysAgo(130),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Fiction-Writers-Master-Blueprint.pdf", fileSizeBytes: BigInt(8900000), fileType: "application/pdf" },
      { fileName: "Character-Arc-Worksheets.pdf", fileSizeBytes: BigInt(2400000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_author_mastermind",
    creatorId: "usr_emmarodriguez",
    name: "Author's Accountability & Novel Sprint Guild",
    slug: "authors-accountability-guild",
    summary: "Monthly writer's guild. Weekly live writing sprints, peer manuscript critiques, and literary agent Q&As.",
    description: `# Author's Accountability Guild (Monthly Membership)

Stop procrastinating on your manuscript. Join our weekly scheduled writing sprints and get feedback on your chapters.`,
    priceCents: 1400,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "fiction",
    tags: ["writing", "membership", "books", "author", "sprint"],
    callToAction: "Join Writer Guild",
    publishedAt: daysAgo(50),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Guild-Writing-Sprint-Calendar.pdf", fileSizeBytes: BigInt(1900000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 7. BUSINESS & MONEY
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_solo_founder_os",
    creatorId: "usr_jamesobrien",
    name: "The Solo Founder Operating System (Notion)",
    slug: "solo-founder-operating-system",
    summary: "All-in-one Notion workspace for solo founders: product roadmap, CRM, financial modeling, and marketing kanban.",
    description: `# The Solo Founder Operating System

The exact Notion operating system used to bootstrap and manage two 7-figure online businesses.`,
    priceCents: 4700,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "business",
    tags: ["notion", "business", "founder", "productivity", "saas"],
    callToAction: "Get Founder OS",
    publishedAt: daysAgo(150),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Solo-Founder-OS-Template-Link.pdf", fileSizeBytes: BigInt(2200000), fileType: "application/pdf" },
      { fileName: "SaaS-Financial-Model-Template.xlsx", fileSizeBytes: BigInt(1850000), fileType: "application/octet-stream" },
    ],
  },
  {
    id: "prd_microsaas_club",
    creatorId: "usr_jamesobrien",
    name: "Micro-SaaS Founders Inner Circle",
    slug: "microsaas-founders-inner-circle",
    summary: "Monthly membership for bootstrapped tech entrepreneurs. Teardowns, revenue sharing insights, and mastermind group.",
    description: `# Micro-SaaS Founders Inner Circle (Monthly Membership)

Real metrics, real revenue, and unfiltered founder masterminds. Build sustainable recurring revenue with peer support.`,
    priceCents: 3900,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "business",
    tags: ["business", "membership", "saas", "bootstrapping", "finance"],
    callToAction: "Subscribe to Inner Circle",
    publishedAt: daysAgo(85),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Micro-SaaS-Playbook-and-KPI-Framework.pdf", fileSizeBytes: BigInt(5100000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 8. DRAWING & PAINTING
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_watercolor_brushes",
    creatorId: "usr_priyasharma",
    name: "Master Watercolor & Inking Brushes for Procreate",
    slug: "master-watercolor-procreate-brushes",
    summary: "45 dynamic pressure-sensitive watercolor, gouache, and ink brushes designed for digital artists.",
    description: `# Master Watercolor & Inking Brushes for Procreate

Experience realistic wet-on-wet watercolor bleeding and authentic paper grain textures directly on your iPad.`,
    priceCents: 2200,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "drawing",
    tags: ["procreate", "brushes", "watercolor", "art", "drawing"],
    callToAction: "Get Brush Pack",
    publishedAt: daysAgo(140),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Master-Watercolor-Brushes.brushset", fileSizeBytes: BigInt(48000000), fileType: "application/octet-stream" },
      { fileName: "Watercolor-Digital-Techniques-Guide.pdf", fileSizeBytes: BigInt(6900000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_daily_sketch_club",
    creatorId: "usr_priyasharma",
    name: "Daily Sketch Club & Digital Art Mentorship",
    slug: "daily-sketch-club-mentorship",
    summary: "Monthly digital art mentorship. Weekly anatomy drawing prompts, brush stroke critique videos, and PSD project files.",
    description: `# Daily Sketch Club & Digital Art Mentorship

Level up your character illustrations with weekly feedback, layered PSD master files, and private community drawing sessions.`,
    priceCents: 1600,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "drawing",
    tags: ["drawing", "membership", "illustration", "mentorship", "art"],
    callToAction: "Join Sketch Club",
    publishedAt: daysAgo(75),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Daily-Sketch-Anatomy-Prompts.pdf", fileSizeBytes: BigInt(4200000), fileType: "application/pdf" },
      { fileName: "layered-illustration-study.psd", fileSizeBytes: BigInt(85000000), fileType: "application/octet-stream" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 9. EDUCATION & COMPUTER SCIENCE
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_fullstack_ts_course",
    creatorId: "usr_alanturing",
    name: "Full-Stack TypeScript & Distributed Systems Masterclass",
    slug: "fullstack-typescript-masterclass",
    summary: "Comprehensive 12-module course on high-scale Node.js/Bun architectures, caching with Redis, and Kafka event pipelines.",
    description: `# Full-Stack TypeScript & Distributed Systems Masterclass

Build systems that handle millions of requests without breaking a sweat. From database indexing to event-driven architectures.`,
    priceCents: 7900,
    productType: "course",
    thumbnailUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "education",
    tags: ["typescript", "education", "course", "architecture", "backend"],
    callToAction: "Enroll in Masterclass",
    publishedAt: daysAgo(100),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Distributed-Systems-Handouts.pdf", fileSizeBytes: BigInt(9500000), fileType: "application/pdf" },
      { fileName: "Course-Source-Code-Projects.zip", fileSizeBytes: BigInt(62000000), fileType: "application/zip" },
    ],
  },
  {
    id: "prd_algosprint_prep",
    creatorId: "usr_alanturing",
    name: "AlgoSprint — Daily LeetCode & System Design Prep",
    slug: "algosprint-daily-prep",
    summary: "Monthly technical interview coaching. Daily algorithmic pattern walkthroughs and bi-weekly mock system design reviews.",
    description: `# AlgoSprint Interview Prep (Monthly Membership)

Crack Senior Software Engineer and Tech Lead technical interviews with systematic pattern recognition.`,
    priceCents: 2400,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "education",
    tags: ["education", "membership", "algorithms", "interview-prep", "coding"],
    callToAction: "Start Daily Prep",
    publishedAt: daysAgo(55),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "AlgoSprint-Top-75-Patterns.pdf", fileSizeBytes: BigInt(7800000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 10. SOFTWARE DEVELOPMENT (Additional Products)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_rust_microservices",
    creatorId: "usr_marcusjohnson",
    name: "Rust Microservices & High-Throughput Toolkit",
    slug: "rust-microservices-toolkit",
    summary: "Production-ready Actix-Web & Tokio template with gRPC, Kafka streaming, and Docker Compose.",
    description: `# Rust Microservices & High-Throughput Toolkit

Engineered for extreme sub-millisecond concurrency. Build scalable microservices with memory safety, zero-copy serialization, and rock-solid reliability.

### ⚡ What's Inside:
- 🚀 **Actix-Web & Tokio Asynchronous Runtime** with optimized connection pooling
- 📡 **gRPC & Protocol Buffers Definitions** with auto-generated client and server stubs
- 📨 **Apache Kafka & Redpanda Event Streaming** with dead-letter queue handlers
- 🗄️ **SQLx Compile-Time Checked Queries** targeting PostgreSQL with automatic migrations
- 📊 **OpenTelemetry Distributed Tracing** & Prometheus metrics scraping endpoint
- 🐳 **Multi-Stage Scratch Dockerfile** producing ultra-lean 18MB binaries`,
    priceCents: 6900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "software",
    tags: ["rust", "microservices", "tokio", "backend", "grpc"],
    callToAction: "Get Rust Toolkit",
    publishedAt: daysAgo(45),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    systemRequirements: "Rust 1.78+ (cargo)\nDocker & Docker Compose\nPostgreSQL 15+",
    files: [
      { fileName: "rust-microservices-starter.zip", fileSizeBytes: BigInt(14200000), fileType: "application/zip" },
      { fileName: "High-Throughput-Architecture-Guide.pdf", fileSizeBytes: BigInt(3800000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_react_native_starter",
    creatorId: "usr_marcusjohnson",
    name: "Superstack React Native & Expo Starter Kit",
    slug: "react-native-expo-starter",
    summary: "Universal iOS, Android & Web boilerplate with Expo Router, NativeWind v4, and offline-first SQLite sync.",
    description: `# Superstack React Native & Expo Starter Kit

The premier mobile template for shipping cross-platform apps at supersonic speed.

### 📱 Features:
- 🧭 **Expo Router v3 (File-Based Navigation)** with typed routes and deep-linking
- 💨 **NativeWind v4 (TailwindCSS)** for seamless cross-platform styling
- 💾 **Offline-First Local SQLite** with reactive sync and TanStack Query
- 🔐 **Biometric Authentication** (FaceID & Fingerprint) out of the box
- 💳 **In-App Purchases Ready** with RevenueCat pre-configured
- 🔔 **Push Notifications Engine** with Expo Notifications & token storage`,
    priceCents: 5900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "software",
    tags: ["react-native", "expo", "mobile", "ios", "android"],
    callToAction: "Get Mobile Starter",
    publishedAt: daysAgo(52),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    systemRequirements: "Node.js 20+ or Bun\nExpo Go or Simulator (Xcode / Android Studio)",
    files: [
      { fileName: "superstack-mobile-v1.8.zip", fileSizeBytes: BigInt(24500000), fileType: "application/zip" },
      { fileName: "App-Store-Submission-Guide.pdf", fileSizeBytes: BigInt(2400000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_ai_agents_scaffold",
    creatorId: "usr_marcusjohnson",
    name: "Autonomous AI Agents Production Framework (Python & LangGraph)",
    slug: "ai-agents-production-framework",
    summary: "Modular multi-agent framework with human-in-the-loop approvals, vector memory with pgvector, and FastAPI streaming.",
    description: `# Autonomous AI Agents Production Framework

Build resilient, reliable multi-agent workflows that don't get stuck in hallucination loops.

### 🤖 Capabilities:
- 🔄 **LangGraph Cyclic Execution Graphs** with explicit state machines
- ✋ **Human-in-the-Loop Interruption & Approval Gates** for sensitive tool calls
- 🧠 **Vector Memory & Semantic Caching** using PostgreSQL pgvector
- ⚡ **FastAPI Streaming Server** with Server-Sent Events (SSE) and token cost telemetry
- 🧪 **Eval Harness** to test agent accuracy across 100+ simulated scenarios`,
    priceCents: 7500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "software",
    tags: ["ai", "python", "agents", "langchain", "fastapi"],
    callToAction: "Download Agent Framework",
    publishedAt: daysAgo(28),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    systemRequirements: "Python 3.11+, Poetry or uv\nOpenAI / Anthropic API Key\nPostgreSQL with pgvector",
    files: [
      { fileName: "ai-agents-production-framework.zip", fileSizeBytes: BigInt(19200000), fileType: "application/zip" },
      { fileName: "Multi-Agent-Design-Patterns.pdf", fileSizeBytes: BigInt(5100000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_docker_k8s_cheatsheets",
    creatorId: "usr_marcusjohnson",
    name: "Production Docker & Kubernetes Visual Cheat Sheets",
    slug: "docker-kubernetes-visual-cheatsheets",
    summary: "High-resolution visual diagrams explaining container networking, ingress, Helm charts, and CI/CD pipelines.",
    description: `# Production Docker & Kubernetes Visual Cheat Sheets

Stop memorizing obscure kubectl commands. 24 high-resolution infographics and flowcharts breaking down cloud-native infrastructure concepts.`,
    priceCents: 1900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "software",
    tags: ["docker", "kubernetes", "devops", "cheatsheet", "containers"],
    callToAction: "Get Cheat Sheets",
    publishedAt: daysAgo(72),
    isPayWhatYouWant: true,
    minPriceCents: 1000,
    suggestedPriceCents: 1900,
    systemRequirements: "PDF reader",
    files: [
      { fileName: "Docker-Kubernetes-Visual-Sheets.pdf", fileSizeBytes: BigInt(16800000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 11. DESIGN (Additional Products)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_neobrutalism_icons",
    creatorId: "usr_alexchen",
    name: "Neo-Brutalist 3D & Vector Icon Vault (800+ Icons)",
    slug: "neobrutalist-3d-vector-icon-vault",
    summary: "800+ quirky, high-contrast, bold border vector icons in SVG, PNG, and 4K 3D renders for modern websites.",
    description: `# Neo-Brutalist 3D & Vector Icon Vault

Add instant personality and punch to your SaaS interfaces and marketing landing pages.

### 🎨 Included Formats:
- 📐 **Vector SVG & Figma Components** with stroke weight controls
- 🧊 **4K Transparent PNGs** in 3 curated lighting presets
- 🖌️ **Fully Customizable Blender Source Files** to render any custom angle
- 📦 **Organized into 16 Categories** (Finance, Tech, Social, Tools, E-commerce, Badges)`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "design",
    tags: ["icons", "neobrutalism", "vector", "3d", "figma"],
    callToAction: "Download Icon Vault",
    publishedAt: daysAgo(40),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "NeoBrutalist-Icons-Master.zip", fileSizeBytes: BigInt(185000000), fileType: "application/zip" },
      { fileName: "Figma-Component-Tokens.fig", fileSizeBytes: BigInt(18200000), fileType: "application/octet-stream" },
    ],
  },
  {
    id: "prd_framer_motion_components",
    creatorId: "usr_alexchen",
    name: "Framer Motion Interactive Component Library",
    slug: "framer-motion-interactive-components",
    summary: "40+ copy-paste interactive React & Tailwind micro-interactions, magnetic buttons, and page transitions.",
    description: `# Framer Motion Interactive Component Library

Elevate your web apps from static to delightful with studio-grade physics and fluid layout springs.

### ✨ Highlights:
- 🧲 **Magnetic Buttons & Hover Cards** with dynamic cursor glow
- 📜 **Scroll-Linked Parallax & Timeline Scrubbers**
- 🔀 **Shared Layout Transitions (layoutId)** for tabs and modal dialogs
- 📱 **Mobile Drawer & Gestures** with velocity-based fling dismiss`,
    priceCents: 3900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "design",
    tags: ["framer-motion", "react", "tailwind", "animation", "ui"],
    callToAction: "Get Components",
    publishedAt: daysAgo(35),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Framer-Motion-Components.zip", fileSizeBytes: BigInt(12500000), fileType: "application/zip" },
      { fileName: "Physics-Curves-Reference.pdf", fileSizeBytes: BigInt(1600000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_bento_grid_templates",
    creatorId: "usr_alexchen",
    name: "Bento Grid Marketing Layouts for Figma & Tailwind",
    slug: "bento-grid-marketing-layouts",
    summary: "28 high-converting modern Bento UI card layouts for SaaS landing pages and portfolio showcases.",
    description: `# Bento Grid Marketing Layouts

The modular aesthetic dominating Apple, Linear, and modern SaaS. Craft information-dense hero sections and feature matrices that convert.`,
    priceCents: 2500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "design",
    tags: ["bento", "figma", "landing-page", "saas", "ui"],
    callToAction: "Download Bento Grids",
    publishedAt: daysAgo(62),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Bento-Grid-Figma-Kit.fig", fileSizeBytes: BigInt(22400000), fileType: "application/octet-stream" },
      { fileName: "Tailwind-Bento-Snippets.zip", fileSizeBytes: BigInt(3400000), fileType: "application/zip" },
    ],
  },
  {
    id: "prd_saas_pitch_deck_figma",
    creatorId: "usr_alexchen",
    name: "SaaS Pitch Deck & Investor Presentation Kit (Figma & Keynote)",
    slug: "saas-pitch-deck-presentation-kit",
    summary: "60+ beautifully animated slides for seed and Series A tech startups looking to raise venture capital.",
    description: `# SaaS Pitch Deck & Investor Presentation Kit

Designed with typography hierarchy, financial chart components, and unit economics slides tested across leading Silicon Valley accelerators.`,
    priceCents: 3400,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "design",
    tags: ["pitch-deck", "presentation", "figma", "investor", "slide-deck"],
    callToAction: "Get Pitch Deck Kit",
    publishedAt: daysAgo(95),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "SaaS-Pitch-Deck-Figma-Keynote.zip", fileSizeBytes: BigInt(54000000), fileType: "application/zip" },
      { fileName: "Venture-Deck-Narrative-Guide.pdf", fileSizeBytes: BigInt(3200000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 12. 3D & ANIMATION (Additional Products)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_lowpoly_fantasy",
    creatorId: "usr_yukitanaka",
    name: "Low-Poly Fantasy RPG Game Asset Pack",
    slug: "lowpoly-fantasy-rpg-assets",
    summary: "350+ modular 3D assets: medieval castles, dungeons, weapons, foliage, and animated characters with color palettes.",
    description: `# Low-Poly Fantasy RPG Game Asset Pack

Ready to drop directly into Unity, Unreal Engine 5, or Godot 4.

### ⚔️ Included Assets:
- 🏰 **Modular Castle & Dungeon Tilesets** with snap-to-grid collision meshes
- 🌲 **Stylized Trees, Rocks & Foliage** with gentle wind vertex shaders
- 🗡️ **40+ Weapons & Shields** with custom particle FX points
- 🧙 **4 Rigged Base Characters** with 12 starter combat and idle animations`,
    priceCents: 3400,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3d",
    tags: ["low-poly", "gamedev", "unity", "godot", "blender"],
    callToAction: "Get Asset Pack",
    publishedAt: daysAgo(50),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Fantasy-RPG-Lowpoly-Complete.zip", fileSizeBytes: BigInt(85000000), fileType: "application/zip" },
      { fileName: "Color-Palette-Atlas.png", fileSizeBytes: BigInt(1200000), fileType: "image/png" },
    ],
  },
  {
    id: "prd_archviz_interior_shaders",
    creatorId: "usr_yukitanaka",
    name: "Photorealistic ArchViz Interior Shaders & Lighting Studio",
    slug: "photorealistic-archviz-shaders",
    summary: "80+ physically-accurate procedural shaders for Blender Cycles (marble, weathered oak, brushed brass, velvet, concrete).",
    description: `# Photorealistic ArchViz Shaders & Lighting Studio

Zero repeating seams, 100% procedurally generated materials calibrated with measured PBR index of refraction (IOR) and roughness maps.`,
    priceCents: 4200,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3d",
    tags: ["archviz", "blender", "shaders", "materials", "cycles"],
    callToAction: "Download Shaders",
    publishedAt: daysAgo(38),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "ArchViz-Procedural-Materials.blend.zip", fileSizeBytes: BigInt(210000000), fileType: "application/zip" },
      { fileName: "Studio-HDRI-Lighting-Presets.zip", fileSizeBytes: BigInt(95000000), fileType: "application/zip" },
    ],
  },
  {
    id: "prd_chibi_character_rigs",
    creatorId: "usr_yukitanaka",
    name: "Anime Stylized Character Rig & Base Meshes",
    slug: "anime-stylized-character-rigs",
    summary: "Fully rigged anime base meshes with 52 Apple ARKit blendshapes for VTubing, game engines, and cinematics.",
    description: `# Anime Stylized Character Rig & Base Meshes

Production-grade topological edge flow around the eyes and mouth designed specifically for facial capture and expressive anime emotions.`,
    priceCents: 4800,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3d",
    tags: ["anime", "vtuber", "rigging", "blender", "characters"],
    callToAction: "Get Rigged Mesh",
    publishedAt: daysAgo(70),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Anime-Rigged-Basemesh-Bundle.blend", fileSizeBytes: BigInt(98000000), fileType: "application/octet-stream" },
      { fileName: "ARKit-Blendshape-Mapping.pdf", fileSizeBytes: BigInt(3400000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_hard_surface_kitbash",
    creatorId: "usr_yukitanaka",
    name: "Hard-Surface Sci-Fi Kitbash & Alpha Brushes (500+ Pieces)",
    slug: "hard-surface-scifi-kitbash",
    summary: "Industrial bolts, panels, vents, mechanical joints, and ZBrush alpha brushes for weapon and mecha modeling.",
    description: `# Hard-Surface Sci-Fi Kitbash & Alpha Brushes

Speed up 3D concepting by 10x. Drag-and-drop mechanical details directly onto your sub-d surfaces in Blender, Maya, or ZBrush.`,
    priceCents: 3600,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3d",
    tags: ["kitbash", "hard-surface", "scifi", "zbrush", "3d-models"],
    callToAction: "Download Kitbash",
    publishedAt: daysAgo(90),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "SciFi-Kitbash-500-Pieces.obj.zip", fileSizeBytes: BigInt(165000000), fileType: "application/zip" },
      { fileName: "ZBrush-Alphas-4K.zip", fileSizeBytes: BigInt(72000000), fileType: "application/zip" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 13. MUSIC & SOUND DESIGN (Additional Products)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_synthwave_serum_pack",
    creatorId: "usr_davidkim",
    name: "Neon Horizon — Synthwave & Retrowave Serum Bank",
    slug: "neon-horizon-synthwave-serum",
    summary: "120 analog-modeled Serum presets: lush 80s pads, arpeggios, punchy basslines, and retro brass leads.",
    description: `# Neon Horizon: Synthwave Serum Soundbank

Imbued with the sonic DNA of the 1980s. Modeled directly after iconic synthesizers like the Roland Juno-106, Jupiter-8, and Yamaha DX7.`,
    priceCents: 2800,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "music",
    tags: ["synthwave", "serum", "presets", "80s", "electronic"],
    callToAction: "Get Soundbank",
    publishedAt: daysAgo(42),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Neon-Horizon-Serum-Presets.zip", fileSizeBytes: BigInt(65000000), fileType: "application/zip" },
      { fileName: "Midi-Progressions-Pack.mid.zip", fileSizeBytes: BigInt(12000000), fileType: "application/zip" },
    ],
  },
  {
    id: "prd_drill_trap_808s",
    creatorId: "usr_davidkim",
    name: "Sub-Zero: Heavy 808s & UK/NY Drill Drum Kit",
    slug: "sub-zero-heavy-808s-drill-kit",
    summary: "250 punchy 808 slides, saturated kicks, crisp hi-hat rolls, and percussion loops mixed for maximum club loudness.",
    description: `# Sub-Zero: Heavy 808s & Drill Drum Kit

Engineered for earth-shaking low-end definition without muddying the vocal pocket. Key-labeled from C1 to B2 with FL Studio glide presets.`,
    priceCents: 2200,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "music",
    tags: ["808", "trap", "drill", "drums", "hiphop"],
    callToAction: "Download 808 Kit",
    publishedAt: daysAgo(65),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Sub-Zero-808-Sample-Pack.zip", fileSizeBytes: BigInt(145000000), fileType: "application/zip" },
      { fileName: "Mix-Engineer-808-Guide.pdf", fileSizeBytes: BigInt(2100000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_cinematic_trailer_sound_fx",
    creatorId: "usr_davidkim",
    name: "Blockbuster Cinematic Trailer FX & Braams",
    slug: "blockbuster-cinematic-trailer-fx",
    summary: "Earth-shaking sub-drops, brass braams, suspense risers, and metallic hits engineered for high-impact movie trailers.",
    description: `# Blockbuster Cinematic Trailer FX & Braams

The sonic arsenal used in modern Hollywood blockbuster trailers. Recorded with custom analog brass ensembles and processed through modular distortion units.`,
    priceCents: 3100,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "music",
    tags: ["trailer", "cinematic", "braam", "sound-effects", "soundtrack"],
    callToAction: "Get Trailer FX",
    publishedAt: daysAgo(88),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Blockbuster-Trailer-FX-24bit.zip", fileSizeBytes: BigInt(380000000), fileType: "application/zip" },
      { fileName: "Trailer-Cue-Arrangement-Tips.pdf", fileSizeBytes: BigInt(2900000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 14. PHOTOGRAPHY (Additional Products)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_analog_film_emulation",
    creatorId: "usr_sarahmitchell",
    name: "Analog 35mm Master Film Emulation Profiles",
    slug: "analog-35mm-film-emulation-profiles",
    summary: "Authentic Kodak Portra 400, Fuji Pro 400H, and CineStill 800T color science profiles for Lightroom and Photoshop.",
    description: `# Analog 35mm Master Film Emulation Profiles

True non-destructive camera profiles created from lab-scanned negative film strips. Accurate red halation, organic grain, and luminous skin tones.`,
    priceCents: 3200,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "photography",
    tags: ["film", "kodak", "portra", "lightroom", "color-grading"],
    callToAction: "Get Film Profiles",
    publishedAt: daysAgo(58),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Analog-Film-Profiles-Pack.zip", fileSizeBytes: BigInt(35000000), fileType: "application/zip" },
      { fileName: "Film-Grain-Technique-Handbook.pdf", fileSizeBytes: BigInt(4800000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_moody_street_presets",
    creatorId: "usr_sarahmitchell",
    name: "Tokyo Nights: Moody Street & Cyber Neon Presets",
    slug: "tokyo-nights-moody-street-presets",
    summary: "18 dramatic night photography presets tailored for rain reflections, neon signs, and deep contrasted shadows.",
    description: `# Tokyo Nights: Moody Street Presets

Turn rainy city alleys and glowing neon signs into cinematic film stills. Includes both desktop XMP and mobile DNG presets.`,
    priceCents: 1900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "photography",
    tags: ["street-photography", "night", "urban", "presets", "lightroom"],
    callToAction: "Get Street Presets",
    publishedAt: daysAgo(82),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Tokyo-Nights-Lightroom-Presets.zip", fileSizeBytes: BigInt(22000000), fileType: "application/zip" },
    ],
  },
  {
    id: "prd_drone_aerial_luts",
    creatorId: "usr_sarahmitchell",
    name: "Aerial & Drone Master Color Grading Presets (DJI D-Log)",
    slug: "aerial-drone-color-grading-presets",
    summary: "Specially calibrated DNG and LUT presets for DJI Mavic, Air, and Mini series to remove atmospheric haze.",
    description: `# Aerial & Drone Color Grading Presets

Restore crisp contrast, vibrant ocean turquoises, and warm sunset highlights to flat D-Log drone captures.`,
    priceCents: 2300,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "photography",
    tags: ["drone", "dji", "aerial", "lightroom", "color-grading"],
    callToAction: "Download Drone Presets",
    publishedAt: daysAgo(115),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "DJI-Drone-Presets-Master.zip", fileSizeBytes: BigInt(18500000), fileType: "application/zip" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 15. FICTION BOOKS & WRITING (Additional Products)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_dark_fantasy_worldbuilding",
    creatorId: "usr_emmarodriguez",
    name: "The Grimdark & Fantasy Worldbuilding Codex",
    slug: "grimdark-fantasy-worldbuilding-codex",
    summary: "Comprehensive system for designing realistic magic systems, kingdom politics, pantheons, and ancient lore.",
    description: `# The Grimdark & Fantasy Worldbuilding Codex

Avoid writer's block and build immersive fantasy universes with internal logic, cultural depth, and unforgettable magic.`,
    priceCents: 2400,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "fiction",
    tags: ["worldbuilding", "fantasy", "writing", "authors", "scifi"],
    callToAction: "Get Worldbuilding Codex",
    publishedAt: daysAgo(48),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Fantasy-Worldbuilding-Codex.pdf", fileSizeBytes: BigInt(12400000), fileType: "application/pdf" },
      { fileName: "Faction-Lore-Spreadsheet.xlsx", fileSizeBytes: BigInt(1800000), fileType: "application/octet-stream" },
    ],
  },
  {
    id: "prd_screenplay_starter_kit",
    creatorId: "usr_emmarodriguez",
    name: "Hollywood Screenplay & TV Pilot Masterclass Template",
    slug: "screenplay-tv-pilot-template",
    summary: "Industry-standard Final Draft & Fountain templates, pitch bible outline, and beat sheet breakdown of top films.",
    description: `# Hollywood Screenplay & TV Pilot Masterclass Template

Format and pace your screenplay like a working Hollywood writer. Includes scene-by-scene beat sheets and character arc dossiers.`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "fiction",
    tags: ["screenwriting", "script", "filmmaking", "tv-pilot", "writing"],
    callToAction: "Get Screenplay Kit",
    publishedAt: daysAgo(78),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Screenplay-Templates-Fountain-FDX.zip", fileSizeBytes: BigInt(8500000), fileType: "application/zip" },
      { fileName: "Beat-Sheet-Breakdown-Guide.pdf", fileSizeBytes: BigInt(3900000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 16. BUSINESS & MONEY (Additional Products)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_cold_outreach_vault",
    creatorId: "usr_jamesobrien",
    name: "The B2B Sales Engine: 100+ Proven Cold Email & LinkedIn Scripts",
    slug: "b2b-cold-email-sales-engine",
    summary: "Battle-tested cold outreach sequences with 42% average open rate and 18% reply rate for agencies and B2B SaaS.",
    description: `# The B2B Sales Engine: 100+ Cold Outreach Scripts

Generate qualified enterprise leads without paid ads. Includes follow-up sequences, objection handling, and deliverability setup.`,
    priceCents: 3900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "business",
    tags: ["sales", "cold-email", "b2b", "marketing", "copywriting"],
    callToAction: "Get Sales Engine",
    publishedAt: daysAgo(44),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "B2B-Cold-Outreach-Scripts.pdf", fileSizeBytes: BigInt(4800000), fileType: "application/pdf" },
      { fileName: "Sequence-Templates.csv", fileSizeBytes: BigInt(1200000), fileType: "text/csv" },
    ],
  },
  {
    id: "prd_notion_agency_os",
    creatorId: "usr_jamesobrien",
    name: "Notion Agency Operating System & Client Portal",
    slug: "notion-agency-os-client-portal",
    summary: "Streamline client onboarding, project deliverables, time tracking, and invoicing in one unified Notion workspace.",
    description: `# Notion Agency Operating System & Client Portal

Replace 5 fragmented tools with one seamless Notion workspace. Impress high-ticket clients with real-time project portals and automated billing trackers.`,
    priceCents: 4900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "business",
    tags: ["notion", "agency", "client-portal", "freelance", "productivity"],
    callToAction: "Get Agency OS",
    publishedAt: daysAgo(68),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Agency-OS-Template-Access.pdf", fileSizeBytes: BigInt(2400000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 17. DRAWING & PAINTING (Additional Products)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_manga_inking_brushes",
    creatorId: "usr_priyasharma",
    name: "Authentic Manga & Webtoon Inking Brushes (Procreate & CSP)",
    slug: "manga-webtoon-inking-brushes",
    summary: "32 dynamic G-pen, maru-pen, and screentone brushes engineered for crisp, responsive comic lineart.",
    description: `# Authentic Manga & Webtoon Inking Brushes

Engineered with custom pressure dynamics to replicate vintage Japanese dip pens with tactile paper drag on digital tablets.`,
    priceCents: 2100,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "drawing",
    tags: ["manga", "webtoon", "procreate", "clip-studio", "inking"],
    callToAction: "Get Manga Brushes",
    publishedAt: daysAgo(36),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Manga-Inking-Brushes-Procreate.brushset", fileSizeBytes: BigInt(38000000), fileType: "application/octet-stream" },
      { fileName: "Comic-Inking-Guide.pdf", fileSizeBytes: BigInt(4300000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_pixel_art_masterclass",
    creatorId: "usr_priyasharma",
    name: "Pixel Art & Animation Starter Kit for Game Devs (Aseprite)",
    slug: "pixel-art-animation-starter-kit",
    summary: "Color palettes, walk cycles, attack animations, tilesets, and UI elements for retro 2D platformers and RPGs.",
    description: `# Pixel Art & Animation Starter Kit

Kickstart your indie 2D game. Includes modular 16x16 and 32x32 tilesets, sprite sheets with run/jump cycles, and Aseprite project files.`,
    priceCents: 2400,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "drawing",
    tags: ["pixel-art", "aseprite", "gamedev", "animation", "retro"],
    callToAction: "Get Pixel Kit",
    publishedAt: daysAgo(56),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Pixel-Art-Starter-Kit-Aseprite.zip", fileSizeBytes: BigInt(28000000), fileType: "application/zip" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 18. EDUCATION (Additional Products)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_machine_learning_scratch",
    creatorId: "usr_alanturing",
    name: "Machine Learning & Neural Networks From Scratch (Python & NumPy)",
    slug: "machine-learning-from-scratch",
    summary: "Build backpropagation, convolutional networks, transformers, and attention mechanisms from zero dependencies.",
    description: `# Machine Learning & Neural Networks From Scratch

Gain true deep intuitions by implementing modern deep learning primitives using only Python and pure linear algebra math.`,
    priceCents: 6500,
    productType: "course",
    thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "education",
    tags: ["machine-learning", "python", "ai", "deep-learning", "course"],
    callToAction: "Enroll in Course",
    publishedAt: daysAgo(30),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "ML-From-Scratch-Jupyter-Notebooks.zip", fileSizeBytes: BigInt(45000000), fileType: "application/zip" },
      { fileName: "Neural-Networks-Math-Handbook.pdf", fileSizeBytes: BigInt(8400000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_system_design_bible",
    creatorId: "usr_alanturing",
    name: "The Ultimate System Design Interview Bible (2026 Edition)",
    slug: "system-design-interview-bible",
    summary: "35 end-to-end distributed system case studies: YouTube, Uber, TinyURL, distributed caches, and payment gateways.",
    description: `# The Ultimate System Design Interview Bible

Pass Senior and Staff Software Engineer system design interviews with battle-tested architectures and rigorous tradeoff evaluations.`,
    priceCents: 4900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "education",
    tags: ["system-design", "interviews", "software-engineering", "backend", "scalability"],
    callToAction: "Get System Design Bible",
    publishedAt: daysAgo(45),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "System-Design-Bible-Complete.pdf", fileSizeBytes: BigInt(14200000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 19. COMICS & GRAPHIC NOVELS (comics)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_neon_tokyo_comic",
    creatorId: "usr_kainakamura",
    name: "Neon Tokyo 2099 — Volume 1: Cyber Heist (Digital Graphic Novel)",
    slug: "neon-tokyo-2099-graphic-novel",
    summary: "140 full-color pages of high-octane cyberpunk action, augmented detectives, and subterranean android warfare.",
    description: `# Neon Tokyo 2099 — Volume 1: Cyber Heist

In a neon-drenched metropolis where memories can be extracted and sold on the darknet, disgraced cyber-detective Ren must solve an impossible theft.`,
    priceCents: 1500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "comics",
    tags: ["comics", "cyberpunk", "graphic-novel", "scifi", "manga"],
    callToAction: "Read Comic",
    publishedAt: daysAgo(25),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Neon-Tokyo-2099-Vol1.cbz", fileSizeBytes: BigInt(98000000), fileType: "application/octet-stream" },
      { fileName: "Neon-Tokyo-2099-Vol1-HighRes.pdf", fileSizeBytes: BigInt(110000000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_comic_sfx_speech_bubbles",
    creatorId: "usr_kainakamura",
    name: "Comic Sound FX & Dynamic Speech Bubble Vector Kit",
    slug: "comic-sfx-speech-bubble-vector-kit",
    summary: "300+ hand-drawn vector action sounds (BAM, POW, KRAK), dialogue bubbles, caption boxes, and comic book fonts.",
    description: `# Comic Sound FX & Speech Bubble Vector Kit

Essential toolkit for comic book letterers, graphic novelists, and webtoon creators. 100% scalable vector artwork.`,
    priceCents: 1800,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "comics",
    tags: ["comics", "speech-bubbles", "sfx", "vector", "design"],
    callToAction: "Get SFX Kit",
    publishedAt: daysAgo(42),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Comic-SFX-Vector-Pack.zip", fileSizeBytes: BigInt(42000000), fileType: "application/zip" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 20. FILM & VIDEO PRODUCTION (film)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_cinematic_luts_bundle",
    creatorId: "usr_chloedubois",
    name: "Hollywood Film Emulation 3D LUTs Master Bundle",
    slug: "cinematic-3d-luts-bundle",
    summary: "24 cinematic 3D .CUBE LUTs calibrated for Arri LogC, Sony S-Log3, Canon Log, and Blackmagic Film.",
    description: `# Hollywood Film Emulation 3D LUTs Master Bundle

Used on award-winning festival short films. Gives modern digital cinema cameras the unmistakable organic texture and warmth of 35mm film stocks.`,
    priceCents: 3900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "film",
    tags: ["luts", "davinci-resolve", "cinematography", "color-grading", "premiere"],
    callToAction: "Get Film LUTs",
    publishedAt: daysAgo(32),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Hollywood-Cinematic-LUTs-CUBE.zip", fileSizeBytes: BigInt(28000000), fileType: "application/zip" },
      { fileName: "DaVinci-Resolve-Color-Grading-Guide.pdf", fileSizeBytes: BigInt(4600000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_filmmakers_membership",
    creatorId: "usr_chloedubois",
    name: "Cinema Craft: Monthly Color Grading & Directing Lab",
    slug: "cinema-craft-monthly-lab",
    summary: "Monthly cinema masterclass with raw ProRes 4444 footage downloads, timeline critiques, and gear teardowns.",
    description: `# Cinema Craft: Monthly Lab (Membership)

Elevate your cinematic storytelling with monthly raw camera footage, live grading streams, and community film teardowns.`,
    priceCents: 2900,
    productType: "membership",
    recurrence: "monthly",
    thumbnailUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "film",
    tags: ["filmmaking", "membership", "color-grading", "directing", "video"],
    callToAction: "Join Cinema Craft",
    publishedAt: daysAgo(50),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Cinema-Lighting-Schematics.pdf", fileSizeBytes: BigInt(7200000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 21. AUDIO & SOUND EFFECTS (audio)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_foley_fx_soundscapes",
    creatorId: "usr_samuelvance",
    name: "Ultimate Game & Film Foley FX Library (1,200+ Sounds)",
    slug: "ultimate-foley-fx-library",
    summary: "1,200+ pristine 96kHz/24-bit sound effects: footsteps, cloth rustle, weapon impacts, doors, UI clicks, and creature roars.",
    description: `# Ultimate Game & Film Foley FX Library

Recorded in an anechoic chamber using Sennheiser MKH 416 microphones. 100% royalty-free with UCS metadata tags for Soundminer.`,
    priceCents: 4500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "audio",
    tags: ["foley", "sound-effects", "gamedev", "film-sound", "audio"],
    callToAction: "Download Foley FX",
    publishedAt: daysAgo(35),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Foley-Sound-FX-Library-Lossless.zip", fileSizeBytes: BigInt(450000000), fileType: "application/zip" },
      { fileName: "UCS-Metadata-Index.csv", fileSizeBytes: BigInt(1500000), fileType: "text/csv" },
    ],
  },
  {
    id: "prd_podcast_production_suite",
    creatorId: "usr_samuelvance",
    name: "Broadcast Podcast Production & Mastering Suite",
    slug: "broadcast-podcast-production-suite",
    summary: "Plug-and-play vocal chains for Logic, Reaper, and Ableton. Includes intro/outro music beds, stagers, and LUFS mastering guide.",
    description: `# Broadcast Podcast Production & Mastering Suite

Achieve NPR and BBC broadcast audio standards from your home studio setup. Target -16 LUFS integrated loudness effortlessly.`,
    priceCents: 3200,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "audio",
    tags: ["podcast", "audio", "mastering", "vocal-chain", "broadcast"],
    callToAction: "Get Podcast Suite",
    publishedAt: daysAgo(60),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Podcast-Audio-Racks-Templates.zip", fileSizeBytes: BigInt(55000000), fileType: "application/zip" },
      { fileName: "Podcast-Mastering-Cheat-Sheet.pdf", fileSizeBytes: BigInt(3800000), fileType: "application/pdf" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 22. OTHER & LIFESTYLE (other)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "prd_hybrid_athlete_training",
    creatorId: "usr_jamesobrien",
    name: "The Hybrid Athlete Protocol: Strength & Marathon Endurance",
    slug: "hybrid-athlete-protocol",
    summary: "16-week periodized program balancing heavy compound lifting with sub-3:30 marathon aerobic conditioning.",
    description: `# The Hybrid Athlete Protocol

Deadlift 500 lbs and run a sub-3:30 marathon without destroying your joints or catabolizing muscle tissue.`,
    priceCents: 3500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "other",
    tags: ["fitness", "training", "running", "hybrid-athlete", "wellness"],
    callToAction: "Get Training Protocol",
    publishedAt: daysAgo(45),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
    files: [
      { fileName: "Hybrid-Athlete-16-Week-Protocol.pdf", fileSizeBytes: BigInt(9500000), fileType: "application/pdf" },
    ],
  },
  {
    id: "prd_second_brain_obsidian",
    creatorId: "usr_jamesobrien",
    name: "Second Brain Vault for Obsidian: PARA Method & Zettelkasten",
    slug: "second-brain-vault-obsidian",
    summary: "Pre-configured Obsidian vault with automatic daily notes, Dataview queries, Canvas dashboards, and book review templates.",
    description: `# Second Brain Vault for Obsidian

Turn information overload into creative output. Pre-configured with the PARA method (Projects, Areas, Resources, Archives) and Dataview dashboard widgets.`,
    priceCents: 2500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "other",
    tags: ["obsidian", "second-brain", "pkm", "productivity", "notion"],
    callToAction: "Get Obsidian Vault",
    publishedAt: daysAgo(20),
    isPayWhatYouWant: true,
    minPriceCents: 1500,
    suggestedPriceCents: 2500,
    files: [
      { fileName: "Second-Brain-Obsidian-Vault.zip", fileSizeBytes: BigInt(18000000), fileType: "application/zip" },
      { fileName: "Obsidian-Setup-and-Hotkeys.pdf", fileSizeBytes: BigInt(3100000), fileType: "application/pdf" },
    ],
  },
];

// ─── Review Comments Presets ────────────────────────────────────────

const reviewTemplates: Record<number, string[]> = {
  5: [
    "Incredible quality! Exceeded every expectation. Saved our team weeks of work.",
    "Best purchase I've made all year. The attention to detail and documentation is phenomenal.",
    "Worth every single penny. Very clean, high performance, and immediately applicable.",
    "10/10. The creator is super responsive and the files are top notch!",
    "Essential resource for anyone serious about their craft. Highly recommended!",
  ],
  4: [
    "Solid resource! Very well structured and easy to follow. Will definitely buy from this creator again.",
    "Great value for money. Minor setup required for our specific use case, but overall fantastic.",
    "Very helpful materials and clean presentation. Recommended!",
  ],
  3: [
    "Good overall. Covers the fundamentals well though I would have liked more advanced edge cases.",
  ],
};

// ─── Main Seed Execution ────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting Comprehensive Seed for DigiStore Prototype...\n");

  // 1. Clear existing data
  console.log("🗑️  Cleaning database tables...");
  await prisma.workflowStep.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.review.deleteMany();
  await prisma.licenseKey.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.follower.deleteMany();
  await prisma.order.deleteMany();
  await prisma.discountCode.deleteMany();
  await prisma.affiliate.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productFile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.twoFactor.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("   ✅ Database cleaned.\n");

  // 2. Create Users & Credentials
  console.log("👤 Creating user accounts & Better-Auth credentials...");
  for (const u of users) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: true,
        image: u.image,
        role: u.role,
        username: u.username,
        bio: u.bio,
        accentColor: u.accentColor,
        socialTwitter: u.socialTwitter,
        socialWebsite: u.socialWebsite,
        polarOnboarded: u.role === "creator",
        razorpayOnboarded: u.role === "creator",
      },
    });

    await prisma.account.create({
      data: {
        id: `acc_${u.id}`,
        accountId: u.id,
        providerId: "credential",
        userId: u.id,
        password: HASHED_PASSWORD,
      },
    });
  }
  console.log(`   ✅ Seeded ${users.length} users with password: Password123!\n`);

  // 3. Create Products & Product Files
  console.log("📦 Creating products and downloadable files...");
  // Convert product prices to Indian Rupee equivalent (multiply by 100)
  for (const p of products) {
    p.priceCents = p.priceCents * 100;
    p.minPriceCents = p.minPriceCents * 100;
    if (p.suggestedPriceCents) {
      p.suggestedPriceCents = p.suggestedPriceCents * 100;
    }
  }

  let totalFiles = 0;
  for (const p of products) {
    await prisma.product.create({
      data: {
        id: p.id,
        creatorId: p.creatorId,
        name: p.name,
        slug: p.slug,
        summary: p.summary,
        description: p.description,
        priceCents: p.priceCents,
        currency: "inr",
        productType: p.productType,
        recurrence: p.recurrence ?? null,
        thumbnailUrl: p.thumbnailUrl,
        coverUrl: p.coverUrl,
        category: p.category,
        tags: p.tags,
        status: "published",
        callToAction: p.callToAction,
        publishedAt: p.publishedAt,
        isPayWhatYouWant: p.isPayWhatYouWant,
        minPriceCents: p.minPriceCents,
        suggestedPriceCents: p.suggestedPriceCents,
        systemRequirements: p.systemRequirements ?? null,
        isListedOnDiscover: true,
      },
    });

    // Create files
    for (let i = 0; i < p.files.length; i++) {
      const f = p.files[i]!;
      await prisma.productFile.create({
        data: {
          productId: p.id,
          fileName: f.fileName,
          fileKey: `uploads/${p.id}/${f.fileName}`,
          fileSizeBytes: f.fileSizeBytes,
          fileType: f.fileType,
          sortOrder: i,
        },
      });
      totalFiles++;
    }
  }
  console.log(`   ✅ Seeded ${products.length} products across 13 categories with ${totalFiles} files.\n`);

  // 4. Create Product Variants for top products
  console.log("🏷️  Creating product tier variants...");
  const variantsData = [
    {
      productId: "prd_aurora_ui_kit",
      variants: [
        { name: "Personal License", priceCents: 4900, description: "Solo designer usage" },
        { name: "Team License (5 Seats)", priceCents: 14900, description: "Agency & product teams" },
        { name: "Enterprise Unlimited", priceCents: 29900, description: "Company-wide unlimited seats" },
      ],
    },
    {
      productId: "prd_nextsaas_starter",
      variants: [
        { name: "Standard Project", priceCents: 8900, description: "Single production deployment" },
        { name: "Unlimited Lifetime", priceCents: 18900, description: "Unlimited commercial projects" },
      ],
    },
    {
      productId: "prd_rust_microservices",
      variants: [
        { name: "Single Binary License", priceCents: 6900, description: "Deploy single microservice" },
        { name: "Full Organization Source", priceCents: 14900, description: "Unlimited internal microservices" },
      ],
    },
    {
      productId: "prd_cinematic_luts_bundle",
      variants: [
        { name: "Standard HD/4K Pack", priceCents: 3900, description: "Indie filmmaker usage" },
        { name: "Commercial Studio Grade", priceCents: 8900, description: "Full commercial production license" },
      ],
    },
  ];

  for (const item of variantsData) {
    for (let i = 0; i < item.variants.length; i++) {
      const v = item.variants[i]!;
      await prisma.productVariant.create({
        data: {
          productId: item.productId,
          name: v.name,
          priceCents: v.priceCents * 100,
          description: v.description,
          sortOrder: i,
        },
      });
    }
  }

  // 5. Create Orders, License Keys, and Subscriptions
  console.log("💳 Creating real orders, subscriptions, and software license keys...");
  const buyerUsers = users.filter((u) => u.role === "user");
  const countries = ["US", "CA", "GB", "DE", "IN", "JP", "FR", "AU"];
  let orderCount = 0;
  let licenseCount = 0;
  let membershipCount = 0;

  const productStats: Record<string, { sales: number; rev: number; ratings: number[] }> = {};
  for (const p of products) {
    productStats[p.id] = { sales: 0, rev: 0, ratings: [] };
  }

  // Every buyer purchases multiple products
  for (const buyer of buyerUsers) {
    // Select 16-28 products per buyer
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, randomBetween(16, 28));

    for (const prod of selected) {
      orderCount++;
      const orderId = `ord_seed_${orderCount.toString().padStart(4, "0")}`;
      const amountCents = prod.priceCents;
      const platformFee = Math.round(amountCents * 0.1);
      const processingFee = Math.round(amountCents * 0.029) + 30;
      const creatorRev = Math.max(0, amountCents - platformFee - processingFee);
      const orderDate = daysAgo(randomBetween(2, 60));

      const order = await prisma.order.create({
        data: {
          id: orderId,
          customerId: buyer.id,
          customerEmail: buyer.email,
          customerName: buyer.name,
          productId: prod.id,
          creatorId: prod.creatorId,
          amountCents,
          currency: "inr",
          platformFeeCents: platformFee,
          processingFeeCents: processingFee,
          creatorRevenueCents: creatorRev,
          status: "completed",
          paymentProvider: "polar",
          country: countries[randomBetween(0, countries.length - 1)],
          createdAt: orderDate,
        },
      });

      productStats[prod.id]!.sales++;
      productStats[prod.id]!.rev += amountCents;

      // If software or digital with software tag, issue a License Key
      if (
        prod.category === "software" ||
        prod.tags.includes("software") ||
        prod.tags.includes("license-key") ||
        prod.tags.includes("figma") ||
        prod.tags.includes("presets") ||
        prod.tags.includes("luts")
      ) {
        const lk = formatLicenseKey();
        const maxSeats = prod.category === "software" ? 3 : 5;
        const usedSeats = randomBetween(0, 2);
        await prisma.licenseKey.create({
          data: {
            orderId: order.id,
            productId: prod.id,
            licenseKey: lk,
            uses: usedSeats,
            maxUses: maxSeats,
            isDisabled: false,
            createdAt: orderDate,
          },
        });
        licenseCount++;
      }

      // If product is a membership, create a real Membership subscription!
      if (prod.productType === "membership") {
        // ~85% active, ~15% cancelled
        const isActive = Math.random() > 0.15;
        const currentPeriodEnd = isActive ? daysFromNow(randomBetween(12, 28)) : daysAgo(randomBetween(1, 10));

        await prisma.membership.create({
          data: {
            customerId: buyer.id,
            productId: prod.id,
            creatorId: prod.creatorId,
            status: isActive ? "active" : "cancelled",
            currentPeriodStart: daysAgo(randomBetween(5, 20)),
            currentPeriodEnd,
            cancelAtPeriodEnd: !isActive,
            cancelledAt: isActive ? null : daysAgo(2),
            createdAt: orderDate,
          },
        });
        membershipCount++;
      }

      // Add a Review for ~60% of purchases
      if (Math.random() < 0.6) {
        const rating = Math.random() < 0.75 ? 5 : Math.random() < 0.9 ? 4 : 3;
        const comments = reviewTemplates[rating] ?? reviewTemplates[5]!;
        const comment = comments[randomBetween(0, comments.length - 1)]!;

        await prisma.review.create({
          data: {
            productId: prod.id,
            customerId: buyer.id,
            orderId: order.id,
            rating,
            content: comment,
            isVerified: true,
            createdAt: new Date(orderDate.getTime() + randomBetween(1, 5) * 86400000),
          },
        });

        productStats[prod.id]!.ratings.push(rating);
      }
    }
  }

  // Ensure all products have at least 1 order and rating so stats are fully populated
  for (const prod of products) {
    if (productStats[prod.id]!.sales === 0) {
      const buyer = buyerUsers[randomBetween(0, buyerUsers.length - 1)]!;
      orderCount++;
      const orderId = `ord_seed_${orderCount.toString().padStart(4, "0")}`;
      const amountCents = prod.priceCents;
      const platformFee = Math.round(amountCents * 0.1);
      const processingFee = Math.round(amountCents * 0.029) + 30;
      const creatorRev = Math.max(0, amountCents - platformFee - processingFee);
      const orderDate = daysAgo(randomBetween(5, 45));

      const order = await prisma.order.create({
        data: {
          id: orderId,
          customerId: buyer.id,
          customerEmail: buyer.email,
          customerName: buyer.name,
          productId: prod.id,
          creatorId: prod.creatorId,
          amountCents,
          currency: "inr",
          platformFeeCents: platformFee,
          processingFeeCents: processingFee,
          creatorRevenueCents: creatorRev,
          status: "completed",
          paymentProvider: "polar",
          country: countries[randomBetween(0, countries.length - 1)],
          createdAt: orderDate,
        },
      });

      productStats[prod.id]!.sales++;
      productStats[prod.id]!.rev += amountCents;

      const rating = Math.random() < 0.8 ? 5 : 4;
      const comments = reviewTemplates[rating] ?? reviewTemplates[5]!;
      const comment = comments[randomBetween(0, comments.length - 1)]!;

      await prisma.review.create({
        data: {
          productId: prod.id,
          customerId: buyer.id,
          orderId: order.id,
          rating,
          content: comment,
          isVerified: true,
          createdAt: new Date(orderDate.getTime() + randomBetween(1, 4) * 86400000),
        },
      });
      productStats[prod.id]!.ratings.push(rating);
    }
  }

  console.log(`   ✅ Seeded ${orderCount} completed orders.`);
  console.log(`   ✅ Seeded ${licenseCount} software license keys (Gumroad v2 format).`);
  console.log(`   ✅ Seeded ${membershipCount} active/cancelled member subscriptions.\n`);

  // 6. Update Product Statistics
  console.log("📊 Updating denormalized product metrics...");
  for (const [pId, stat] of Object.entries(productStats)) {
    const avg = stat.ratings.length > 0 ? stat.ratings.reduce((a, b) => a + b, 0) / stat.ratings.length : 4.8;
    await prisma.product.update({
      where: { id: pId },
      data: {
        salesCount: stat.sales,
        revenueCents: BigInt(stat.rev),
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: Math.max(stat.ratings.length, 1),
        viewCount: randomBetween(350, 4200),
      },
    });
  }

  // 7. Create Creator Followers
  console.log("👥 Creating followers...");
  const creators = users.filter((u) => u.role === "creator");
  let followerCount = 0;
  for (const b of buyerUsers) {
    for (const c of creators) {
      if (Math.random() > 0.3) {
        await prisma.follower.create({
          data: {
            creatorId: c.id,
            followerEmail: b.email,
            followerId: b.id,
            isSubscribed: true,
          },
        });
        followerCount++;
      }
    }
  }
  console.log(`   ✅ Seeded ${followerCount} creator followers.\n`);

  // 8. Create Working Discount Codes
  console.log("🏷️  Creating promotional discount codes...");
  const discountCodes = [
    { creatorId: "usr_marcusjohnson", productId: "prd_nextsaas_starter", code: "BUILDER20", discountType: "percentage", discountValue: 20 },
    { creatorId: "usr_marcusjohnson", productId: "prd_devlens_desktop", code: "PROTOTYPE30", discountType: "percentage", discountValue: 30 },
    { creatorId: "usr_alexchen", productId: "prd_aurora_ui_kit", code: "FIGMA15", discountType: "percentage", discountValue: 15 },
    { creatorId: "usr_sarahmitchell", productId: "prd_golden_hour_presets", code: "PHOTO10", discountType: "fixed", discountValue: 100000 },
    { creatorId: "usr_davidkim", productId: "prd_lofi_stems", code: "BEATS25", discountType: "percentage", discountValue: 25 },
    { creatorId: "usr_alanturing", productId: "prd_fullstack_ts_course", code: "STUDENT50", discountType: "percentage", discountValue: 50 },
    { creatorId: "usr_kainakamura", productId: "prd_neon_tokyo_comic", code: "CYBER20", discountType: "percentage", discountValue: 20 },
    { creatorId: "usr_chloedubois", productId: "prd_cinematic_luts_bundle", code: "CINEMA15", discountType: "percentage", discountValue: 15 },
    { creatorId: "usr_samuelvance", productId: "prd_foley_fx_soundscapes", code: "AUDIO10", discountType: "fixed", discountValue: 100000 },
  ];

  for (const dc of discountCodes) {
    await prisma.discountCode.create({
      data: {
        creatorId: dc.creatorId,
        productId: dc.productId,
        code: dc.code,
        discountType: dc.discountType,
        discountValue: dc.discountValue,
        maxUses: 200,
        currentUses: randomBetween(8, 45),
        validFrom: daysAgo(60),
        validUntil: daysFromNow(90),
      },
    });
  }
  console.log(`   ✅ Seeded ${discountCodes.length} discount codes.\n`);

  // 9. Create Historical Creator Payouts
  console.log("💰 Creating creator payout histories...");
  for (const c of creators) {
    const numPayouts = randomBetween(2, 4);
    for (let i = 0; i < numPayouts; i++) {
      const pDays = 15 + i * 30;
      await prisma.payout.create({
        data: {
          creatorId: c.id,
          amountCents: BigInt(randomBetween(12000, 68000) * 100),
          currency: "inr",
          status: "completed",
          stripeTransferId: `tr_seed_${c.id}_${i}`,
          periodStart: daysAgo(pDays + 30),
          periodEnd: daysAgo(pDays),
          completedAt: daysAgo(pDays - 1),
          createdAt: daysAgo(pDays),
        },
      });
    }
  }
  console.log("   ✅ Seeded creator payout records.\n");

  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("🎉 DATABASE SEED SUCCESSFUL! DEMO CREDENTIALS:");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("🔑 ALL PASSWORDS: Password123!\n");
  console.log("1. DEMO BUYER (has active subscriptions, license keys & orders):");
  console.log("   👉 Email: buyer@example.com");
  console.log("   👉 Other buyers: oliviachen@example.com, noahwilliams@example.com, liam@example.com, sophia@example.com\n");
  console.log("2. CREATORS (has MRR, active subscribers, sales, products):");
  console.log("   👉 Marcus Johnson (Software / SaaS / DevTools): marcusjohnson@example.com");
  console.log("   👉 Alex Chen (Design / UI Kits / Figma Club):   alexchen@example.com");
  console.log("   👉 Yuki Tanaka (3D / Blender Asset Vault):      yukitanaka@example.com");
  console.log("   👉 Sarah Mitchell (Photography Collective):     sarahmitchell@example.com");
  console.log("   👉 David Kim (Music / Producer Syndicate):      davidkim@example.com");
  console.log("   👉 Emma Rodriguez (Fiction / Storytelling):     emmarodriguez@example.com");
  console.log("   👉 James O'Brien (Business & Notion OS):        jamesobrien@example.com");
  console.log("   👉 Priya Sharma (Drawing & Digital Art):        priyasharma@example.com");
  console.log("   👉 Dr. Alan Turing (Education & Algorithms):    alanturing@example.com");
  console.log("   👉 Kai Nakamura (Comics & Manga):               kainakamura@example.com");
  console.log("   👉 Chloé Dubois (Film & Cinema Craft):          chloedubois@example.com");
  console.log("   👉 Samuel Vance (Audio Engineering & Foley):    samuelvance@example.com\n");
  console.log("3. ADMIN (Admin Dashboard oversight):");
  console.log("   👉 Email: admin@example.com\n");
  console.log("═══════════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
