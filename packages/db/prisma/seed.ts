// ═══════════════════════════════════════════════════════════════════
// Gumroad Clone — Comprehensive Seed Script
// ═══════════════════════════════════════════════════════════════════
// Run:  cd packages/db && bunx prisma db seed
// All accounts use password: Password123!
// ═══════════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";
import { scryptSync, randomUUID } from "node:crypto";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = "seedsaltvalue123"; // Fixed 16-char [a-z0-9] salt for reproducibility
  const key = scryptSync(password, salt, 64);
  return `${key.toString("hex")}:${salt}`;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const HASHED_PASSWORD = hashPassword("Password123!");

// ─── User Data ──────────────────────────────────────────────────────

interface UserSeed {
  id: string;
  name: string;
  email: string;
  role: string;
  username: string | null;
  bio: string | null;
  accentColor: string;
  socialTwitter: string | null;
  socialWebsite: string | null;
  image: string | null;
}

const users: UserSeed[] = [
  {
    id: "usr_alexchen",
    name: "Alex Chen",
    email: "alexchen@example.com",
    role: "creator",
    username: "alexchen",
    bio: "UI/UX designer crafting pixel-perfect interfaces. Previously at Figma & Stripe. Sharing design resources to help you build beautiful products.",
    accentColor: "#6366F1",
    socialTwitter: "https://twitter.com/alexchen",
    socialWebsite: "https://alexchen.design",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=alexchen",
  },
  {
    id: "usr_sarahmitchell",
    name: "Sarah Mitchell",
    email: "sarahmitchell@example.com",
    role: "creator",
    username: "sarahmitchell",
    bio: "Professional photographer & educator. 10+ years capturing moments. My presets and courses have helped 50,000+ photographers level up.",
    accentColor: "#F59E0B",
    socialTwitter: "https://twitter.com/sarahmitchell",
    socialWebsite: "https://sarahmitchell.photo",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=sarahmitchell",
  },
  {
    id: "usr_marcusjohnson",
    name: "Marcus Johnson",
    email: "marcusjohnson@example.com",
    role: "creator",
    username: "marcusjohnson",
    bio: "Full-stack engineer & open-source contributor. Building tools that save developers hundreds of hours. TypeScript enthusiast.",
    accentColor: "#10B981",
    socialTwitter: "https://twitter.com/marcusjohnson",
    socialWebsite: "https://marcusjohnson.dev",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=marcusjohnson",
  },
  {
    id: "usr_priyasharma",
    name: "Priya Sharma",
    email: "priyasharma@example.com",
    role: "creator",
    username: "priyasharma",
    bio: "Digital artist & illustrator. Creating brushes, textures, and tutorials for Procreate & Photoshop. Art is for everyone. 🎨",
    accentColor: "#EC4899",
    socialTwitter: "https://twitter.com/priyasharma",
    socialWebsite: "https://priyasharma.art",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=priyasharma",
  },
  {
    id: "usr_davidkim",
    name: "David Kim",
    email: "davidkim@example.com",
    role: "creator",
    username: "davidkim",
    bio: "Music producer & sound designer. Grammy-nominated. Creating sample packs, drum kits, and production courses for beatmakers worldwide.",
    accentColor: "#8B5CF6",
    socialTwitter: "https://twitter.com/davidkim",
    socialWebsite: "https://davidkim.music",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=davidkim",
  },
  {
    id: "usr_emmarodriguez",
    name: "Emma Rodriguez",
    email: "emmarodriguez@example.com",
    role: "creator",
    username: "emmarodriguez",
    bio: "Published author & writing coach. NYT contributor. Helping writers find their voice with templates, prompts, and actionable guides.",
    accentColor: "#EF4444",
    socialTwitter: "https://twitter.com/emmarodriguez",
    socialWebsite: "https://emmarodriguez.com",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=emmarodriguez",
  },
  {
    id: "usr_jamesobrien",
    name: "James O'Brien",
    email: "jamesobrien@example.com",
    role: "creator",
    username: "jamesobrien",
    bio: "Serial entrepreneur & marketing strategist. Built 3 companies to $1M+ ARR. Sharing proven frameworks for growth and productivity.",
    accentColor: "#F97316",
    socialTwitter: "https://twitter.com/jamesobrien",
    socialWebsite: "https://jamesobrien.biz",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=jamesobrien",
  },
  {
    id: "usr_yukitanaka",
    name: "Yuki Tanaka",
    email: "yukitanaka@example.com",
    role: "creator",
    username: "yukitanaka",
    bio: "3D artist & motion designer. Blender & After Effects wizard. Creating assets and tutorials that bring imagination to life. ✨",
    accentColor: "#14B8A6",
    socialTwitter: "https://twitter.com/yukitanaka",
    socialWebsite: "https://yukitanaka.art",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=yukitanaka",
  },
  // ─── Buyers ───
  {
    id: "usr_oliviachen",
    name: "Olivia Chen",
    email: "oliviachen@example.com",
    role: "user",
    username: null,
    bio: null,
    accentColor: "#FF90E8",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=oliviachen",
  },
  {
    id: "usr_noahwilliams",
    name: "Noah Williams",
    email: "noahwilliams@example.com",
    role: "user",
    username: null,
    bio: null,
    accentColor: "#FF90E8",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=noahwilliams",
  },
  {
    id: "usr_avapatel",
    name: "Ava Patel",
    email: "avapatel@example.com",
    role: "user",
    username: null,
    bio: null,
    accentColor: "#FF90E8",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=avapatel",
  },
  // ─── Admin ───
  {
    id: "usr_admin",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    username: "admin",
    bio: "Platform administrator.",
    accentColor: "#FF90E8",
    socialTwitter: null,
    socialWebsite: null,
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=admin",
  },
];

// ─── Product Data ───────────────────────────────────────────────────

interface ProductSeed {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  priceCents: number;
  productType: string;
  thumbnailUrl: string;
  coverUrl: string;
  category: string;
  tags: string[];
  status: string;
  callToAction: string;
  publishedAt: Date;
  isPayWhatYouWant: boolean;
  minPriceCents: number;
  suggestedPriceCents: number | null;
}

const products: ProductSeed[] = [
  // ════════════════════════════════════════════
  // Alex Chen — UI/UX Design
  // ════════════════════════════════════════════
  {
    id: "prd_aurora_ui_kit",
    creatorId: "usr_alexchen",
    name: "Aurora UI Kit — Premium Figma Components",
    slug: "aurora-ui-kit",
    summary: "500+ meticulously crafted Figma components with dark/light modes, auto-layout, and responsive variants.",
    description: `# Aurora UI Kit — Premium Figma Components

The most comprehensive UI kit you'll ever need. **500+ components** built with Figma best practices.

## What's Included
- 🎨 **500+ Components** — Buttons, inputs, cards, modals, navigation, data tables, charts, and more
- 🌓 **Dark & Light Modes** — Every component with both theme variants
- 📐 **Auto-layout Everything** — Fully responsive, pixel-perfect spacing
- 🔤 **Type Scale System** — 8 heading sizes + body text with Inter font family
- 📱 **Mobile-First** — Responsive breakpoints for desktop, tablet, and mobile

## Who Is This For?
- Product designers building SaaS dashboards
- Startup founders prototyping MVPs
- Design teams needing a consistent component library

## File Format
- Figma file (.fig)
- PDF style guide
- Changelog & roadmap

> "The best UI kit I've bought. Saved me weeks of work." — @designerdave`,
    priceCents: 4900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Design",
    tags: ["figma", "ui-kit", "components", "design-system", "dashboard"],
    status: "published",
    callToAction: "Get the UI Kit",
    publishedAt: daysAgo(180),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_landing_templates",
    creatorId: "usr_alexchen",
    name: "Minimal Landing Page Templates — 20 Designs",
    slug: "minimal-landing-pages",
    summary: "20 conversion-optimized landing page templates in Figma. Clean, modern, and ready to customize.",
    description: `# Minimal Landing Page Templates

**20 beautifully designed landing pages** optimized for conversion. Each template is fully customizable in Figma.

## Templates Included
- SaaS product pages (4 variants)
- Mobile app showcase (3 variants)
- Portfolio / personal brand (3 variants)
- E-commerce product launch (3 variants)
- Newsletter / waitlist (3 variants)
- Agency / studio (2 variants)
- Event / conference (2 variants)

## Features
- ✅ Auto-layout & responsive
- ✅ Real copywriting examples
- ✅ Component-based structure
- ✅ Free Google Fonts only
- ✅ Organized layers & pages`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Design",
    tags: ["landing-page", "templates", "figma", "web-design", "conversion"],
    status: "published",
    callToAction: "Download Templates",
    publishedAt: daysAgo(150),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_icon_pack",
    creatorId: "usr_alexchen",
    name: "Phosphor Extended — 3000+ Custom Icons",
    slug: "phosphor-extended-icons",
    summary: "3000+ pixel-perfect icons in 6 weights. SVG, PNG, React & Vue components included.",
    description: `# Phosphor Extended Icon Pack

A massive collection of **3,000+ icons** across 25 categories, each available in 6 weights.

## What's Included
- 3,000+ unique icons
- 6 weights: Thin, Light, Regular, Bold, Fill, Duotone
- Formats: SVG, PNG (24/32/48/64px), React components, Vue components
- Figma component library
- Icon search tool (HTML file)

## Categories
Design, Development, Commerce, Social, Media, Navigation, Weather, Finance, Health, Education, and 15 more.

## License
Use in unlimited personal and commercial projects. No attribution required.`,
    priceCents: 1900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Design",
    tags: ["icons", "svg", "react", "figma", "design-assets"],
    status: "published",
    callToAction: "Get All Icons",
    publishedAt: daysAgo(120),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_design_system",
    creatorId: "usr_alexchen",
    name: "Design System Blueprint — Complete Framework",
    slug: "design-system-blueprint",
    summary: "Everything you need to build a production-ready design system. Tokens, components, documentation templates.",
    description: `# Design System Blueprint

Stop reinventing the wheel. **Build your design system in days, not months.**

## What You Get
- 🎨 **Design Tokens** — Colors, typography, spacing, shadows, borders (JSON + CSS variables)
- 🧩 **50 Core Components** — Fully documented with usage guidelines
- 📖 **Documentation Templates** — Notion + Markdown templates for your team wiki
- 🔄 **Figma ↔ Code Sync Guide** — Bridge the gap between design and engineering
- 📏 **Audit Checklist** — Evaluate and improve your existing system

## Perfect For
Teams of 5-50 building B2B SaaS products who need consistency at scale.`,
    priceCents: 7900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Design",
    tags: ["design-system", "figma", "tokens", "documentation", "enterprise"],
    status: "published",
    callToAction: "Get the Blueprint",
    publishedAt: daysAgo(90),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_ux_research",
    creatorId: "usr_alexchen",
    name: "UX Research Toolkit — Templates & Frameworks",
    slug: "ux-research-toolkit",
    summary: "40+ research templates: user interviews, surveys, usability tests, journey maps, and personas.",
    description: `# UX Research Toolkit

**40+ ready-to-use templates** for every stage of user research.

## Templates Included
- 📋 **User Interview Scripts** (8 templates for different research goals)
- 📊 **Survey Templates** (6 templates with proven question frameworks)
- 🧪 **Usability Test Plans** (5 templates with task scenarios)
- 🗺️ **Journey Maps** (4 Figma templates)
- 👤 **Persona Templates** (3 data-driven persona formats)
- 📈 **Research Reports** (4 stakeholder presentation templates)
- 🎯 **Affinity Diagrams** (FigJam + Miro templates)

All templates in Notion, Google Docs, and Figma formats.`,
    priceCents: 3900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Design",
    tags: ["ux-research", "templates", "user-interviews", "personas", "figma"],
    status: "published",
    callToAction: "Get the Toolkit",
    publishedAt: daysAgo(60),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },

  // ════════════════════════════════════════════
  // Sarah Mitchell — Photography
  // ════════════════════════════════════════════
  {
    id: "prd_golden_hour_presets",
    creatorId: "usr_sarahmitchell",
    name: "Golden Hour Presets — 50 Lightroom Presets",
    slug: "golden-hour-presets",
    summary: "50 warm, cinematic Lightroom presets inspired by golden hour magic. Desktop + Mobile.",
    description: `# Golden Hour Presets

**50 professional Lightroom presets** that give your photos that warm, dreamy golden hour look — even if they were shot at noon.

## What's Inside
- 🌅 10 Warm Sunset presets
- 🍂 10 Autumn Glow presets
- 🌾 10 Film Grain presets
- 💫 10 Soft Haze presets
- 🎞️ 10 Vintage Film presets

## Compatibility
- Adobe Lightroom Classic (Desktop)
- Adobe Lightroom CC (Mobile + Desktop)
- .xmp and .lrtemplate formats included

## Before/After Examples
Each preset includes 3 before/after comparison images so you can preview the exact look.`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Photography",
    tags: ["lightroom", "presets", "photography", "editing", "golden-hour"],
    status: "published",
    callToAction: "Get the Presets",
    publishedAt: daysAgo(200),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_street_photo_masterclass",
    creatorId: "usr_sarahmitchell",
    name: "Street Photography Masterclass",
    slug: "street-photography-masterclass",
    summary: "Learn the art of street photography. 6 hours of video, shooting exercises, and editing walkthroughs.",
    description: `# Street Photography Masterclass

A comprehensive **6-hour video course** teaching you everything about street photography.

## Course Modules
1. **The Street Photographer's Eye** — Finding stories in everyday moments
2. **Camera Settings & Gear** — Optimal settings for different conditions
3. **Composition Techniques** — Leading lines, layers, frames, and juxtaposition
4. **Working with Light** — Shadows, reflections, silhouettes, and neon
5. **Approaching Strangers** — Ethics, confidence, and legal considerations
6. **Post-Processing** — My complete editing workflow in Lightroom & Photoshop

## What You Get
- 6+ hours of HD video lessons
- 20 shooting assignments with feedback framework
- Lightroom preset pack (10 presets)
- Gear recommendation guide
- Private community access`,
    priceCents: 5900,
    productType: "course",
    thumbnailUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Photography",
    tags: ["photography", "course", "street-photography", "masterclass", "video"],
    status: "published",
    callToAction: "Enroll Now",
    publishedAt: daysAgo(160),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_moody_film_presets",
    creatorId: "usr_sarahmitchell",
    name: "Moody Film Emulation — 30 Presets",
    slug: "moody-film-emulation",
    summary: "30 film emulation presets capturing the look of Portra, Kodak Gold, Fuji, and Cinestill.",
    description: `# Moody Film Emulation Pack

**30 presets** that recreate the timeless look of classic film stocks.

## Film Stocks Emulated
- Kodak Portra 400 & 800 (6 presets)
- Kodak Gold 200 (4 presets)
- Fuji Pro 400H (4 presets)
- Fuji Superia (4 presets)
- CineStill 800T (4 presets)
- Ilford HP5 B&W (4 presets)
- Kodak Tri-X B&W (4 presets)

Each preset has been calibrated with real film scans for authentic color science.`,
    priceCents: 2400,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Photography",
    tags: ["lightroom", "film", "presets", "kodak", "fuji"],
    status: "published",
    callToAction: "Get Film Presets",
    publishedAt: daysAgo(130),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_stock_photo_bundle",
    creatorId: "usr_sarahmitchell",
    name: "Lifestyle Stock Photo Bundle — 500 Images",
    slug: "lifestyle-stock-photos",
    summary: "500 high-resolution lifestyle stock photos. Perfect for blogs, social media, and marketing materials.",
    description: `# Lifestyle Stock Photo Bundle

**500 high-resolution photos** shot specifically for digital creators and marketers.

## Categories
- 🏠 Home & Workspace (80 photos)
- ☕ Food & Coffee Culture (70 photos)
- 🌿 Nature & Outdoors (80 photos)
- 💼 Business & Productivity (70 photos)
- 🏃 Health & Fitness (60 photos)
- 🎨 Creative & Artistic (60 photos)
- 🌆 Urban & Architecture (80 photos)

## Specs
- Resolution: 6000x4000px minimum
- Format: JPEG (high quality) + RAW available for premium tier
- License: Royalty-free, commercial use included
- No watermarks, no attribution required`,
    priceCents: 4900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Photography",
    tags: ["stock-photos", "lifestyle", "commercial", "high-res", "bundle"],
    status: "published",
    callToAction: "Download Bundle",
    publishedAt: daysAgo(80),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_editing_workflow",
    creatorId: "usr_sarahmitchell",
    name: "Photo Editing Workflow Guide",
    slug: "photo-editing-workflow",
    summary: "My complete photo editing workflow from import to export. 40-page PDF with video walkthroughs.",
    description: `# Photo Editing Workflow Guide

Learn my **exact editing workflow** that I use for every client shoot and personal project.

## What's Covered
1. File organization & backup strategy
2. Culling with Photo Mechanic
3. Lightroom develop module deep-dive
4. Photoshop retouching techniques
5. Color grading theory & practice
6. Export settings for web, print & social
7. Batch processing tips

## Format
- 40-page illustrated PDF guide
- 5 video walkthroughs (45 min total)
- Sample RAW files to practice with`,
    priceCents: 1500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Photography",
    tags: ["photography", "editing", "workflow", "lightroom", "tutorial"],
    status: "published",
    callToAction: "Get the Guide",
    publishedAt: daysAgo(45),
    isPayWhatYouWant: true,
    minPriceCents: 0,
    suggestedPriceCents: 1500,
  },

  // ════════════════════════════════════════════
  // Marcus Johnson — Software Development
  // ════════════════════════════════════════════
  {
    id: "prd_saas_starter",
    creatorId: "usr_marcusjohnson",
    name: "ShipFast — SaaS Starter Kit (Next.js)",
    slug: "shipfast-saas-starter",
    summary: "Production-ready SaaS boilerplate with Next.js 14, Stripe billing, auth, emails, and more. Ship in days, not months.",
    description: `# ShipFast — SaaS Starter Kit

Stop building the same SaaS boilerplate. **Ship your product in days, not months.**

## Tech Stack
- ⚡ **Next.js 14** — App Router, Server Actions, RSC
- 💳 **Stripe** — Subscriptions, one-time payments, customer portal
- 🔐 **Auth** — Email/password, Google, GitHub OAuth
- 📧 **Emails** — Resend + React Email templates
- 🗄️ **Database** — Prisma + PostgreSQL
- 🎨 **UI** — Tailwind CSS + shadcn/ui
- 📊 **Analytics** — PostHog integration

## Features
- Multi-tenant organization support
- Role-based access control
- Webhook handling (Stripe events)
- SEO optimization
- API rate limiting
- Admin dashboard
- Landing page with 5 sections

## Getting Started
\`npm install\` → Set env vars → \`npm run dev\` → Done.`,
    priceCents: 9900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Software Development",
    tags: ["nextjs", "saas", "starter-kit", "stripe", "typescript"],
    status: "published",
    callToAction: "Get ShipFast",
    publishedAt: daysAgo(170),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_vscode_theme",
    creatorId: "usr_marcusjohnson",
    name: "Midnight Pro — VS Code Theme",
    slug: "midnight-pro-vscode",
    summary: "A beautiful dark VS Code theme with carefully tuned contrast and vibrant syntax colors. Easy on the eyes.",
    description: `# Midnight Pro — VS Code Theme

A **premium dark theme** designed for long coding sessions.

## Features
- 🌙 Carefully balanced contrast — no eye strain
- 🎨 Vibrant syntax highlighting for 30+ languages
- 📝 Optimized for TypeScript, React, Python, Rust, Go
- 🖥️ Terminal theme included
- 📊 Matching colors for Git diffs, brackets, and diagnostics

## Variants
- **Midnight Pro** — Deep navy with vibrant accents
- **Midnight Pro Soft** — Lower contrast variant
- **Midnight Pro Light** — For those bright-office days

## Install
Search "Midnight Pro" in VS Code extensions, or download the .vsix file.`,
    priceCents: 900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Software Development",
    tags: ["vscode", "theme", "developer-tools", "dark-theme", "coding"],
    status: "published",
    callToAction: "Get the Theme",
    publishedAt: daysAgo(140),
    isPayWhatYouWant: true,
    minPriceCents: 0,
    suggestedPriceCents: 900,
  },
  {
    id: "prd_api_design_ebook",
    creatorId: "usr_marcusjohnson",
    name: "REST API Design Patterns — eBook",
    slug: "rest-api-design-patterns",
    summary: "The definitive guide to designing robust, scalable REST APIs. 200+ pages of patterns, examples, and anti-patterns.",
    description: `# REST API Design Patterns

**200+ pages** of battle-tested patterns for designing APIs that developers love.

## Chapters
1. URL Structure & Resource Naming
2. HTTP Methods & Status Codes Done Right
3. Pagination, Filtering & Sorting
4. Authentication & Authorization Patterns
5. Versioning Strategies
6. Error Handling & Validation
7. Rate Limiting & Throttling
8. Caching Strategies
9. Webhooks & Event-Driven Patterns
10. API Documentation (OpenAPI/Swagger)
11. Testing & Monitoring
12. Real-World Case Studies

## Format
- PDF (200+ pages, beautifully typeset)
- EPUB for e-readers
- Code examples in TypeScript, Python, Go`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Software Development",
    tags: ["api", "rest", "ebook", "backend", "architecture"],
    status: "published",
    callToAction: "Get the eBook",
    publishedAt: daysAgo(100),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_cli_toolkit",
    creatorId: "usr_marcusjohnson",
    name: "DevOps CLI Toolkit — 10 Utilities",
    slug: "devops-cli-toolkit",
    summary: "10 powerful CLI utilities for developers: port scanner, env validator, log parser, DB migrator, and more.",
    description: `# DevOps CLI Toolkit

**10 CLI utilities** that save developers hours every week.

## Tools Included
1. **portcheck** — Scan and manage ports in use
2. **envvalidate** — Validate .env files against schemas
3. **logparse** — Parse and search through log files with regex
4. **dbmigrate** — Database migration helper for Postgres/MySQL
5. **certcheck** — SSL certificate expiry checker
6. **apibench** — Quick API benchmarking tool
7. **dockerclean** — Clean unused Docker images/volumes
8. **gitstat** — Git repository statistics dashboard
9. **depaudit** — Dependency vulnerability scanner
10. **cronmon** — Cron job monitoring and alerting

Cross-platform: macOS, Linux, Windows (WSL). Written in Rust.`,
    priceCents: 1900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Software Development",
    tags: ["cli", "devops", "developer-tools", "rust", "utilities"],
    status: "published",
    callToAction: "Download Toolkit",
    publishedAt: daysAgo(70),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_fullstack_ts_course",
    creatorId: "usr_marcusjohnson",
    name: "Full-Stack TypeScript — Complete Course",
    slug: "fullstack-typescript-course",
    summary: "From zero to production: build a full-stack app with TypeScript, Node.js, React, PostgreSQL, and deploy to AWS.",
    description: `# Full-Stack TypeScript — Complete Course

**40+ hours of video** taking you from TypeScript basics to deploying a production application.

## Curriculum
### Module 1: TypeScript Foundations (6 hours)
Advanced types, generics, utility types, declaration files

### Module 2: Backend with Node.js & Express (8 hours)
REST APIs, middleware, authentication, database integration

### Module 3: Database Design with Prisma (5 hours)
Schema design, migrations, queries, relations, seeding

### Module 4: React & Next.js Frontend (10 hours)
App Router, Server Components, state management, forms

### Module 5: Testing (5 hours)
Unit tests, integration tests, E2E with Playwright

### Module 6: Deployment & DevOps (6 hours)
Docker, CI/CD, AWS deployment, monitoring

## Includes
- 40+ hours of video content
- Source code for each module
- Certificate of completion`,
    priceCents: 7900,
    productType: "course",
    thumbnailUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Software Development",
    tags: ["typescript", "course", "fullstack", "nodejs", "react"],
    status: "published",
    callToAction: "Start Learning",
    publishedAt: daysAgo(30),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },

  // ════════════════════════════════════════════
  // Priya Sharma — Illustration & Art
  // ════════════════════════════════════════════
  {
    id: "prd_watercolor_brushes",
    creatorId: "usr_priyasharma",
    name: "Procreate Watercolor Brush Pack — 75 Brushes",
    slug: "procreate-watercolor-brushes",
    summary: "75 realistic watercolor brushes for Procreate. Wet edges, bleeds, splatter, and texture brushes.",
    description: `# Procreate Watercolor Brush Pack

**75 handcrafted brushes** that bring realistic watercolor painting to your iPad.

## Brush Categories
- 🎨 **Wet Brushes** (15) — Realistic wet-on-wet blending
- 💧 **Bleed Brushes** (10) — Beautiful edge bleeding effects
- 🌊 **Wash Brushes** (10) — Smooth gradient washes
- 💦 **Splatter Brushes** (10) — Natural paint splatter
- 🖌️ **Detail Brushes** (10) — Fine lines and lettering
- 📄 **Paper Textures** (10) — Cold press, hot press, rough
- ⭐ **Bonus Stamps** (10) — Floral and leaf stamps

## Requirements
- Procreate 5.0 or later
- iPad with Apple Pencil

Includes a 20-minute video tutorial on installation and brush techniques.`,
    priceCents: 1500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Drawing & Painting",
    tags: ["procreate", "brushes", "watercolor", "digital-art", "ipad"],
    status: "published",
    callToAction: "Get Brushes",
    publishedAt: daysAgo(190),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_character_design",
    creatorId: "usr_priyasharma",
    name: "Character Design Fundamentals — Course",
    slug: "character-design-fundamentals",
    summary: "Learn to design memorable characters from scratch. Shape language, expressions, color theory, and turnarounds.",
    description: `# Character Design Fundamentals

A complete **video course** on designing original, memorable characters.

## What You'll Learn
1. **Shape Language** — Using circles, squares, and triangles to communicate personality
2. **Proportions & Anatomy** — Stylized vs. realistic approaches
3. **Facial Expressions** — The 21 core expressions and how to simplify them
4. **Color Theory for Characters** — Palettes that tell stories
5. **Costume & Prop Design** — Visual storytelling through clothing
6. **Character Turnarounds** — Front, side, 3/4, back views
7. **Character Sheets** — Professional presentation for studios

## Includes
- 8 hours of video lessons
- 50 reference sheets
- Practice exercises with critiques
- 3 Procreate brushes designed for character work`,
    priceCents: 4900,
    productType: "course",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Drawing & Painting",
    tags: ["character-design", "course", "illustration", "art", "procreate"],
    status: "published",
    callToAction: "Start Learning",
    publishedAt: daysAgo(145),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_texture_library",
    creatorId: "usr_priyasharma",
    name: "Seamless Texture Library — 200 Textures",
    slug: "seamless-texture-library",
    summary: "200 hand-painted seamless textures. Perfect for game art, illustrations, and graphic design.",
    description: `# Seamless Texture Library

**200 hand-painted textures** that tile perfectly. Use them in illustrations, game art, web backgrounds, and print.

## Categories
- 🧱 Stone & Brick (30)
- 🌲 Wood & Bark (25)
- 🌿 Organic & Foliage (30)
- ⚙️ Metal & Rust (25)
- 📜 Paper & Fabric (25)
- 🎨 Abstract & Painterly (25)
- ✨ Fantasy & Magical (20)
- 🌊 Water & Ice (20)

## Specs
- 2048x2048px seamless tiles
- PNG format (transparent where applicable)
- Procreate & Photoshop compatible
- Commercial license included`,
    priceCents: 2500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Drawing & Painting",
    tags: ["textures", "seamless", "game-art", "digital-art", "patterns"],
    status: "published",
    callToAction: "Get Textures",
    publishedAt: daysAgo(110),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_digital_art_workflow",
    creatorId: "usr_priyasharma",
    name: "Digital Art Workflow — From Sketch to Final",
    slug: "digital-art-workflow",
    summary: "My complete digital art process: thumbnails, line art, color, rendering, and final touches. PDF + Video.",
    description: `# Digital Art Workflow Guide

Learn my **complete process** for creating polished digital illustrations.

## Workflow Steps Covered
1. 🖊️ **Thumbnail Sketches** — Quick ideation techniques
2. ✏️ **Line Art** — Clean linework methods
3. 🎨 **Flat Colors** — Efficient base coloring
4. 🌈 **Rendering** — Light, shadow, and material painting
5. ✨ **Final Touches** — Effects, color grading, and polish

## What's Included
- 60-page PDF guide with annotated screenshots
- 3 full-process timelapse videos (2 hours)
- Custom Procreate color palette
- Layer structure template`,
    priceCents: 1200,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Drawing & Painting",
    tags: ["digital-art", "workflow", "tutorial", "procreate", "illustration"],
    status: "published",
    callToAction: "Get the Guide",
    publishedAt: daysAgo(75),
    isPayWhatYouWant: true,
    minPriceCents: 0,
    suggestedPriceCents: 1200,
  },
  {
    id: "prd_fantasy_environments",
    creatorId: "usr_priyasharma",
    name: "Fantasy Environment Concept Art Pack",
    slug: "fantasy-environment-concepts",
    summary: "30 high-resolution fantasy environment concept art pieces. Use as reference, inspiration, or in your projects.",
    description: `# Fantasy Environment Concept Art Pack

**30 stunning environment paintings** spanning enchanted forests, floating castles, underwater cities, and alien landscapes.

## Contents
- 10 Forest & Nature environments
- 8 Castle & Architecture environments
- 6 Underwater & Ocean environments
- 6 Sci-Fi & Alien environments

## Specs
- 4K resolution (3840x2160)
- PNG format
- Includes PSD files with layers for 5 selected pieces
- Royalty-free license for personal and commercial use`,
    priceCents: 3500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Drawing & Painting",
    tags: ["concept-art", "fantasy", "environments", "digital-art", "reference"],
    status: "published",
    callToAction: "Get the Art Pack",
    publishedAt: daysAgo(40),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },

  // ════════════════════════════════════════════
  // David Kim — Music Production
  // ════════════════════════════════════════════
  {
    id: "prd_lofi_sample_pack",
    creatorId: "usr_davidkim",
    name: "Lo-Fi Hip Hop Sample Pack — 500 Samples",
    slug: "lofi-hiphop-samples",
    summary: "500 warm, dusty lo-fi samples: vinyl crackle, jazzy chords, mellow drums, and ambient textures.",
    description: `# Lo-Fi Hip Hop Sample Pack

**500 royalty-free samples** for creating chill, nostalgic lo-fi beats.

## What's Inside
- 🥁 **Drums** (120) — Dusty kicks, snappy snares, lo-fi hats, vinyl percussion
- 🎹 **Chords & Keys** (80) — Jazzy Rhodes, warm pads, mellow piano loops
- 🎸 **Melodic Loops** (60) — Guitar, flute, saxophone phrases
- 🎵 **Bass Loops** (50) — Sub bass, upright bass, synth bass
- 🌧️ **Ambient Textures** (60) — Rain, vinyl crackle, tape hiss, café sounds
- 📻 **Full Loops** (80) — Ready-to-use beat loops at 70-90 BPM
- 🎛️ **FX & Transitions** (50) — Risers, sweeps, impacts, vinyl stops

## Format
WAV 24-bit / 44.1kHz — Works with any DAW
100% royalty-free for commercial use`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Audio",
    tags: ["lo-fi", "sample-pack", "hip-hop", "beats", "royalty-free"],
    status: "published",
    callToAction: "Download Samples",
    publishedAt: daysAgo(185),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_drum_kit",
    creatorId: "usr_davidkim",
    name: "Analog Drum Kit Collection — 300 One-Shots",
    slug: "analog-drum-kit",
    summary: "300 meticulously sampled analog drum sounds from vintage machines: 808, 909, SP-1200, MPC, and more.",
    description: `# Analog Drum Kit Collection

**300 one-shot drum samples** captured from legendary hardware drum machines and samplers.

## Machines Sampled
- 🔴 Roland TR-808 (50 samples)
- 🟡 Roland TR-909 (50 samples)
- 🔵 E-mu SP-1200 (40 samples)
- 🟢 Akai MPC 3000 (40 samples)
- 🟣 Linn LM-1 (30 samples)
- ⚫ Oberheim DMX (30 samples)
- 🟠 Roland CR-78 (30 samples)
- ⚪ Custom processed variants (30 samples)

Each sample was recorded through a Neve 1073 preamp for maximum warmth and presence.`,
    priceCents: 1900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Audio",
    tags: ["drums", "samples", "808", "909", "analog"],
    status: "published",
    callToAction: "Get the Kit",
    publishedAt: daysAgo(155),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_mixing_template",
    creatorId: "usr_davidkim",
    name: "Mixing & Mastering Template — Ableton & Logic",
    slug: "mixing-mastering-template",
    summary: "Professional mixing and mastering session templates with pre-configured buses, sends, and reference chains.",
    description: `# Mixing & Mastering Template

**Production-ready session templates** that give you a professional mixing setup from the start.

## What's Included
### Mixing Template
- Pre-configured bus routing (drums, bass, synths, vocals, FX)
- Send effects (reverb, delay, chorus)
- Reference track setup with A/B comparison
- Metering chain (LUFS, RMS, stereo width)

### Mastering Template
- Multi-band processing chain
- Stereo imaging setup
- Limiting and dithering
- Format export presets (Spotify, Apple Music, CD, Vinyl)

## Formats
- Ableton Live 11+ (.als)
- Logic Pro X (.logicx)
- PDF guide explaining each channel and plugin`,
    priceCents: 2500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Audio",
    tags: ["mixing", "mastering", "ableton", "logic", "template"],
    status: "published",
    callToAction: "Get Templates",
    publishedAt: daysAgo(115),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_ambient_soundscapes",
    creatorId: "usr_davidkim",
    name: "Ambient Soundscapes Vol. 1 — 100 Samples",
    slug: "ambient-soundscapes-v1",
    summary: "100 atmospheric ambient samples: pads, drones, textures, and evolving soundscapes for film, games, and music.",
    description: `# Ambient Soundscapes Vol. 1

**100 atmospheric samples** perfect for ambient music, film scoring, game audio, and meditation content.

## Categories
- 🌌 **Space Drones** (20) — Vast, evolving pad textures
- 🌊 **Nature Processed** (20) — Organic sounds transformed into ethereal textures
- 🔔 **Metallic Resonance** (15) — Singing bowls, processed metals, harmonic overtones
- 🎹 **Granular Pads** (15) — Granular synthesis textures from acoustic sources
- 🌫️ **Fog & Mist** (15) — Subtle, barely-there background textures
- ⚡ **Glitch & Digital** (15) — Processed digital artifacts and micro-textures

All samples range from 10 seconds to 2 minutes. 24-bit WAV.`,
    priceCents: 1500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Audio",
    tags: ["ambient", "soundscapes", "samples", "film-scoring", "textures"],
    status: "published",
    callToAction: "Download Sounds",
    publishedAt: daysAgo(85),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_production_course",
    creatorId: "usr_davidkim",
    name: "Music Production Essentials — Complete Course",
    slug: "music-production-essentials",
    summary: "From beginner to pro: learn music theory, sound design, arrangement, mixing, and mastering in Ableton Live.",
    description: `# Music Production Essentials

**30+ hours of video** covering everything you need to produce professional music.

## Course Structure
1. **Music Theory for Producers** (4 hours) — Scales, chords, progressions, rhythm
2. **Sound Design** (6 hours) — Synthesis, sampling, layering, processing
3. **Beat Making** (5 hours) — Drum programming, groove, swing, fills
4. **Arrangement** (4 hours) — Song structure, transitions, energy flow
5. **Mixing** (6 hours) — EQ, compression, reverb, delay, stereo imaging
6. **Mastering** (3 hours) — Loudness, dynamics, format preparation
7. **Business of Music** (2 hours) — Distribution, royalties, building an audience

## Bonus
- 200 samples exclusive to students
- Ableton project files for each lesson
- Private Discord community`,
    priceCents: 6900,
    productType: "course",
    thumbnailUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Audio",
    tags: ["music-production", "course", "ableton", "mixing", "sound-design"],
    status: "published",
    callToAction: "Start Learning",
    publishedAt: daysAgo(50),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },

  // ════════════════════════════════════════════
  // Emma Rodriguez — Writing & Publishing
  // ════════════════════════════════════════════
  {
    id: "prd_novel_blueprint",
    creatorId: "usr_emmarodriguez",
    name: "The Novel Writer's Blueprint — Complete Template",
    slug: "novel-writers-blueprint",
    summary: "Everything you need to write your novel: plot structure templates, character worksheets, world-building guides, and more.",
    description: `# The Novel Writer's Blueprint

The **complete toolkit** for planning, drafting, and finishing your novel.

## What's Included
- 📖 **Plot Structure Templates** — 3-act, Hero's Journey, Save the Cat, Fichtean Curve
- 👤 **Character Worksheets** (12 templates) — Deep personality, motivation, arc planning
- 🌍 **World-Building Guide** — Geography, culture, politics, magic systems, technology
- 📅 **Writing Schedule Planner** — Daily word count tracker, milestone goals
- ✅ **Revision Checklist** — 50-point checklist for self-editing
- 📝 **Query Letter Templates** — 3 proven formats for literary agents

## Formats
- Notion template (duplicate to your workspace)
- Google Docs (editable copies)
- PDF (printable worksheets)`,
    priceCents: 1900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Writing & Publishing",
    tags: ["writing", "novel", "templates", "plotting", "creative-writing"],
    status: "published",
    callToAction: "Get the Blueprint",
    publishedAt: daysAgo(175),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_copywriting_swipefile",
    creatorId: "usr_emmarodriguez",
    name: "Copywriting Swipe File — 500 Headlines & CTAs",
    slug: "copywriting-swipe-file",
    summary: "500 proven headlines, subject lines, and CTAs organized by industry and emotion. Never stare at a blank page again.",
    description: `# Copywriting Swipe File

**500 battle-tested copywriting formulas** organized for instant inspiration.

## What's Inside
- 📰 **Headlines** (150) — Blog posts, landing pages, ads
- 📧 **Email Subject Lines** (100) — Open-rate optimized formulas
- 🔘 **CTAs & Buttons** (80) — Action-driving copy
- 📱 **Social Media Hooks** (70) — Scroll-stopping openers
- 💰 **Sales Page Copy** (50) — Frameworks for high-converting pages
- 📝 **Product Descriptions** (50) — E-commerce copy formulas

## Organized By
- Industry (SaaS, E-commerce, Health, Finance, Education)
- Emotion (Curiosity, Urgency, Fear, Joy, Trust)
- Format (Short, Long, Question, Command, Story)

Searchable Notion database + PDF export.`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Writing & Publishing",
    tags: ["copywriting", "swipe-file", "headlines", "marketing", "cta"],
    status: "published",
    callToAction: "Get the Swipe File",
    publishedAt: daysAgo(140),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_self_publishing",
    creatorId: "usr_emmarodriguez",
    name: "Self-Publishing Masterclass",
    slug: "self-publishing-masterclass",
    summary: "Learn to self-publish your book on Amazon KDP: formatting, covers, marketing, and building a reader base.",
    description: `# Self-Publishing Masterclass

Everything you need to **self-publish your book** and build a sustainable author business.

## Modules
1. **Preparing Your Manuscript** — Formatting for KDP, IngramSpark, and other platforms
2. **Cover Design** — Working with designers, Canva templates, genre conventions
3. **Amazon KDP Deep-Dive** — Categories, keywords, pricing strategy
4. **Launch Strategy** — Pre-orders, ARC readers, launch week tactics
5. **Marketing & Promotion** — Amazon ads, BookBub, social media for authors
6. **Building Your Reader Base** — Newsletter setup, reader magnets, series strategy
7. **Going Wide** — Distribution beyond Amazon (Kobo, Apple Books, B&N)

## Includes
- 10 hours of video
- KDP formatting templates (Word + Vellum)
- Amazon ad campaign templates
- Book launch checklist`,
    priceCents: 4900,
    productType: "course",
    thumbnailUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Writing & Publishing",
    tags: ["self-publishing", "course", "amazon-kdp", "book", "marketing"],
    status: "published",
    callToAction: "Enroll Now",
    publishedAt: daysAgo(100),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_journaling_prompts",
    creatorId: "usr_emmarodriguez",
    name: "Daily Journaling Prompt Kit — 365 Prompts",
    slug: "daily-journaling-prompts",
    summary: "365 thought-provoking journaling prompts organized by theme. One for every day of the year.",
    description: `# Daily Journaling Prompt Kit

**365 carefully crafted prompts** to deepen self-reflection, boost creativity, and build a daily writing habit.

## Monthly Themes
- January: New Beginnings & Goals
- February: Love & Relationships
- March: Growth & Learning
- April: Creativity & Expression
- May: Gratitude & Joy
- June: Adventure & Exploration
- July: Strength & Resilience
- August: Dreams & Aspirations
- September: Reflection & Wisdom
- October: Change & Transformation
- November: Community & Connection
- December: Review & Renewal

## Formats
- Beautifully designed PDF (printable, A5 size)
- Notion template with daily reminders
- Plain text for import into any journaling app`,
    priceCents: 1200,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Writing & Publishing",
    tags: ["journaling", "prompts", "self-care", "writing", "mindfulness"],
    status: "published",
    callToAction: "Start Journaling",
    publishedAt: daysAgo(65),
    isPayWhatYouWant: true,
    minPriceCents: 0,
    suggestedPriceCents: 1200,
  },
  {
    id: "prd_blog_templates",
    creatorId: "usr_emmarodriguez",
    name: "Blog Post Templates — 30 Proven Frameworks",
    slug: "blog-post-templates",
    summary: "30 fill-in-the-blank blog post templates that drive traffic: how-to guides, listicles, case studies, and more.",
    description: `# Blog Post Templates — 30 Proven Frameworks

**Never stare at a blank page again.** 30 fill-in-the-blank templates for blog posts that get traffic and engagement.

## Template Types
- 📋 **How-To Guides** (6 templates)
- 📊 **Listicles** (5 templates)
- 📖 **Case Studies** (4 templates)
- 🆚 **Comparison Posts** (3 templates)
- 💡 **Thought Leadership** (3 templates)
- 🎯 **Roundup Posts** (3 templates)
- 📰 **News/Trend Analysis** (3 templates)
- 🔍 **Ultimate Guides** (3 templates)

Each template includes SEO checklist, word count guidance, and example headlines.

Available in Google Docs, Notion, and Markdown.`,
    priceCents: 1500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Writing & Publishing",
    tags: ["blogging", "templates", "content-marketing", "seo", "writing"],
    status: "published",
    callToAction: "Get Templates",
    publishedAt: daysAgo(25),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },

  // ════════════════════════════════════════════
  // James O'Brien — Business & Marketing
  // ════════════════════════════════════════════
  {
    id: "prd_notion_dashboard",
    creatorId: "usr_jamesobrien",
    name: "Notion Business Dashboard — All-in-One Workspace",
    slug: "notion-business-dashboard",
    summary: "The ultimate Notion workspace for solopreneurs: CRM, project management, finances, content calendar, and goal tracking.",
    description: `# Notion Business Dashboard

**Run your entire business from one Notion workspace.** Designed for solopreneurs and small teams.

## Databases Included
- 📊 **CRM** — Track leads, deals, and customers with pipeline view
- 📋 **Project Manager** — Kanban boards, timelines, task dependencies
- 💰 **Finance Tracker** — Income, expenses, invoices, tax prep
- 📅 **Content Calendar** — Blog, social media, email scheduling
- 🎯 **Goal Tracker** — OKRs, quarterly reviews, habit tracking
- 📚 **Knowledge Base** — SOPs, templates, meeting notes

## Features
- ✅ 15 interconnected databases
- ✅ Dashboard with key metrics
- ✅ Weekly review template
- ✅ Mobile-optimized views
- ✅ Video setup tutorial (20 min)`,
    priceCents: 3500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Business & Finance",
    tags: ["notion", "dashboard", "productivity", "business", "crm"],
    status: "published",
    callToAction: "Get the Dashboard",
    publishedAt: daysAgo(195),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_pitch_deck",
    creatorId: "usr_jamesobrien",
    name: "Startup Pitch Deck — Investor Ready",
    slug: "startup-pitch-deck",
    summary: "A proven 12-slide pitch deck template used to raise $10M+. Includes speaker notes, data visualization, and examples.",
    description: `# Startup Pitch Deck Template

The **exact template** used to raise $10M+ across my companies. Adapted for any industry.

## 12 Slides
1. **Title & Hook** — One-sentence pitch
2. **Problem** — Pain point visualization
3. **Solution** — Your product in action
4. **Market Size** — TAM, SAM, SOM framework
5. **Business Model** — Revenue streams and pricing
6. **Traction** — Metrics that matter
7. **Competition** — Competitive landscape matrix
8. **Product Demo** — Screenshots or live demo flow
9. **Go-to-Market** — Growth strategy
10. **Team** — Founders and key hires
11. **Financials** — Projections and unit economics
12. **The Ask** — Funding amount and use of funds

## Formats
- Google Slides (editable)
- PowerPoint (.pptx)
- Keynote (.key)
- PDF (print-ready)

Includes 10-page guide on presentation delivery and common investor questions.`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Business & Finance",
    tags: ["pitch-deck", "startup", "investor", "fundraising", "template"],
    status: "published",
    callToAction: "Get the Deck",
    publishedAt: daysAgo(165),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_email_marketing",
    creatorId: "usr_jamesobrien",
    name: "Email Marketing Playbook — Complete System",
    slug: "email-marketing-playbook",
    summary: "Build a $100K email marketing system: list building, automation sequences, copywriting formulas, and analytics.",
    description: `# Email Marketing Playbook

The **complete email marketing system** I used to generate $100K+ in revenue from a 15,000-person list.

## What You'll Learn
1. **List Building** — 12 proven strategies to grow your list fast
2. **Welcome Sequence** — 7-email sequence that converts subscribers to buyers
3. **Newsletter Strategy** — Content frameworks that get 40%+ open rates
4. **Sales Sequences** — Launch emails, cart abandonment, win-back campaigns
5. **Automation Flows** — Set-and-forget sequences for passive revenue
6. **Copywriting Formulas** — AIDA, PAS, Before-After-Bridge, and 10 more
7. **Analytics & Optimization** — A/B testing, deliverability, list hygiene

## Includes
- 150-page playbook (PDF)
- 50 email templates (copy-paste ready)
- Spreadsheet: email calendar + tracking
- Video walkthroughs (3 hours)`,
    priceCents: 4900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Business & Finance",
    tags: ["email-marketing", "playbook", "automation", "copywriting", "growth"],
    status: "published",
    callToAction: "Get the Playbook",
    publishedAt: daysAgo(120),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_content_calendar",
    creatorId: "usr_jamesobrien",
    name: "Social Media Content Calendar 2026",
    slug: "social-media-calendar-2026",
    summary: "365 days of social media content ideas, posting schedules, hashtag strategies, and Canva templates.",
    description: `# Social Media Content Calendar 2026

**365 days of content ideas** so you never run out of things to post.

## What's Inside
- 📅 **Daily Content Prompts** — Platform-specific ideas for Twitter/X, Instagram, LinkedIn, TikTok
- 🗓️ **Awareness Days** — Every relevant holiday and awareness day mapped out
- 📊 **Posting Schedule** — Optimal times for each platform
- #️⃣ **Hashtag Library** — 500+ hashtags organized by niche
- 🎨 **Canva Templates** (50) — Stories, carousels, quote cards, infographics
- 📈 **Analytics Tracker** — Weekly metrics spreadsheet

## Formats
- Notion calendar (interactive)
- Google Sheets (filterable)
- PDF (printable monthly view)
- Canva template links`,
    priceCents: 1900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Business & Finance",
    tags: ["social-media", "content-calendar", "marketing", "canva", "templates"],
    status: "published",
    callToAction: "Get the Calendar",
    publishedAt: daysAgo(55),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_side_hustle",
    creatorId: "usr_jamesobrien",
    name: "Side Hustle Launch Checklist",
    slug: "side-hustle-launch-checklist",
    summary: "A step-by-step checklist to validate, build, and launch your side hustle in 30 days. Actionable and no-fluff.",
    description: `# Side Hustle Launch Checklist

Go from idea to first dollar in **30 days** with this no-fluff, actionable checklist.

## The 30-Day Plan
### Week 1: Validate (Days 1-7)
- Market research framework
- Competitor analysis template
- Customer interview script
- Minimum viable offer design

### Week 2: Build (Days 8-14)
- Landing page setup (no-code)
- Payment processing
- Email capture and automation
- Social proof strategy

### Week 3: Launch (Days 15-21)
- Launch announcement templates
- Social media blitz plan
- Email outreach scripts
- Community engagement tactics

### Week 4: Optimize (Days 22-30)
- Analytics setup and review
- Customer feedback loop
- Pricing optimization
- Growth experiments

Includes Notion template, printable PDF, and 3 video walkthroughs.`,
    priceCents: 900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "Business & Finance",
    tags: ["side-hustle", "checklist", "entrepreneurship", "launch", "startup"],
    status: "published",
    callToAction: "Get the Checklist",
    publishedAt: daysAgo(15),
    isPayWhatYouWant: true,
    minPriceCents: 0,
    suggestedPriceCents: 900,
  },

  // ════════════════════════════════════════════
  // Yuki Tanaka — 3D & Motion Design
  // ════════════════════════════════════════════
  {
    id: "prd_blender_materials",
    creatorId: "usr_yukitanaka",
    name: "Blender Material Library — 100 PBR Materials",
    slug: "blender-material-library",
    summary: "100 production-ready PBR materials for Blender: metals, wood, fabric, stone, glass, and more.",
    description: `# Blender Material Library

**100 production-ready PBR materials** for Blender's Cycles and EEVEE render engines.

## Material Categories
- 🔩 **Metals** (15) — Steel, copper, gold, aluminum, rust
- 🪵 **Wood** (15) — Oak, walnut, pine, bamboo, plywood
- 🧵 **Fabric** (12) — Cotton, denim, leather, silk, velvet
- 🪨 **Stone** (12) — Marble, granite, concrete, brick, slate
- 🔮 **Glass** (10) — Clear, frosted, stained, crystal
- 🌿 **Organic** (10) — Skin, bark, moss, coral
- ✨ **Stylized** (10) — Toon, cel-shaded, painterly
- 🎯 **Specialty** (8) — Car paint, holographic, iridescent, emissive
- 🌐 **Sci-Fi** (8) — Cyber, neon, hex grid, force field

## Features
- 4K texture resolution
- Fully procedural (no external textures needed)
- One-click append to any project
- Blender 3.6+ compatible`,
    priceCents: 3900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3D",
    tags: ["blender", "materials", "pbr", "3d", "textures"],
    status: "published",
    callToAction: "Get Materials",
    publishedAt: daysAgo(188),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_motion_graphics",
    creatorId: "usr_yukitanaka",
    name: "Motion Graphics Essentials — After Effects Pack",
    slug: "motion-graphics-essentials",
    summary: "50 customizable After Effects templates: lower thirds, transitions, title cards, logo reveals, and infographics.",
    description: `# Motion Graphics Essentials Pack

**50 ready-to-use After Effects templates** for professional video content.

## Templates Included
- 🏷️ **Lower Thirds** (10) — Minimal, corporate, creative, bold styles
- 🔄 **Transitions** (10) — Smooth wipes, glitch, zoom, geometric
- 📝 **Title Cards** (8) — Chapter titles, intro sequences, end cards
- 💫 **Logo Reveals** (6) — Elegant, particle, 3D, minimal
- 📊 **Infographics** (6) — Charts, counters, maps, timelines
- 🎬 **Social Media** (5) — Instagram story, YouTube end screen, TikTok
- ⚡ **Call-to-Actions** (5) — Subscribe, like, follow overlays

## Features
- After Effects CC 2022+
- 4K resolution
- Easy color customization
- No plugins required
- Video tutorial included`,
    priceCents: 4900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3D",
    tags: ["after-effects", "motion-graphics", "templates", "video", "animation"],
    status: "published",
    callToAction: "Get the Pack",
    publishedAt: daysAgo(152),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_hdri_collection",
    creatorId: "usr_yukitanaka",
    name: "HDRI Environment Collection — 50 Skies",
    slug: "hdri-environment-collection",
    summary: "50 high-quality HDRI environment maps for 3D rendering. Studios, outdoors, urban, and fantasy environments.",
    description: `# HDRI Environment Collection

**50 premium HDRI environment maps** for photorealistic 3D rendering.

## Categories
- ☀️ **Outdoor Daylight** (12) — Blue sky, overcast, golden hour, sunset
- 🌃 **Urban & City** (10) — Streets, rooftops, neon, parking garages
- 🏢 **Studio Setups** (10) — Soft, dramatic, rim light, product photography
- 🌲 **Nature** (8) — Forest, beach, desert, mountain
- 🌌 **Night & Space** (5) — Starry sky, moonlit, nebula
- ✨ **Fantasy** (5) — Ethereal glow, alien skies, underwater caustics

## Specs
- 8K resolution (8192x4096)
- HDR format (.hdr and .exr)
- Compatible with Blender, Cinema 4D, Maya, Unreal Engine
- Commercial license included`,
    priceCents: 2500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3D",
    tags: ["hdri", "3d-rendering", "environment", "blender", "lighting"],
    status: "published",
    callToAction: "Get HDRIs",
    publishedAt: daysAgo(105),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_shader_toolkit",
    creatorId: "usr_yukitanaka",
    name: "Procedural Shader Toolkit — Blender Nodes",
    slug: "procedural-shader-toolkit",
    summary: "40 advanced procedural shader setups for Blender. Node groups for realistic and stylized materials.",
    description: `# Procedural Shader Toolkit

**40 advanced node setups** that push Blender's shader capabilities to the limit.

## Node Groups
- 🌊 **Realistic Water** — Ocean, river, puddles, rain drops
- 🔥 **Fire & Energy** — Flames, plasma, electricity, magic effects
- 🌈 **Iridescence** — Oil slick, soap bubble, pearl, beetle shell
- ❄️ **Ice & Frost** — Frozen surfaces, icicles, snow accumulation
- 🔮 **Crystal & Gem** — Diamond, ruby, emerald with proper refraction
- 🌐 **Sci-Fi Panels** — Techy surfaces with animated emissives
- 🎨 **Toon Shaders** — Cel-shading with custom ramp control
- 🌿 **Growth & Decay** — Moss spread, rust progression, erosion

All node groups are fully documented with a companion PDF explaining each parameter.`,
    priceCents: 2900,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3D",
    tags: ["blender", "shaders", "procedural", "nodes", "3d-art"],
    status: "published",
    callToAction: "Get the Toolkit",
    publishedAt: daysAgo(68),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
  {
    id: "prd_3d_typography",
    creatorId: "usr_yukitanaka",
    name: "3D Typography Pack — 25 Animated Titles",
    slug: "3d-typography-pack",
    summary: "25 stunning 3D animated title designs for videos, presentations, and social media. Blender + AE files.",
    description: `# 3D Typography Pack

**25 jaw-dropping animated title designs** ready to customize for your projects.

## Styles Included
- 💎 **Luxury** (5) — Gold foil, chrome, diamond-encrusted
- 🌊 **Liquid** (4) — Melting, dripping, water, mercury
- 🔥 **Energetic** (4) — Neon, fire, electric, glitch
- 🌿 **Organic** (4) — Floral, vine-wrapped, wooden, stone
- 🎯 **Minimal** (4) — Clean, geometric, wireframe, kinetic
- 🌌 **Sci-Fi** (4) — Holographic, cyber, space, matrix

## Files Included
- Blender project files (.blend)
- After Effects compositions (.aep)
- Pre-rendered video loops (4K ProRes)
- Font files used in each design

Each title is 5-10 seconds with seamless looping capability.`,
    priceCents: 3500,
    productType: "digital",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop&auto=format&q=80",
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop&auto=format&q=80",
    category: "3D",
    tags: ["3d-typography", "animation", "blender", "after-effects", "titles"],
    status: "published",
    callToAction: "Get the Pack",
    publishedAt: daysAgo(35),
    isPayWhatYouWant: false,
    minPriceCents: 0,
    suggestedPriceCents: null,
  },
];

// ─── Review Comments Pool ───────────────────────────────────────────

const reviewComments = {
  5: [
    "Absolutely incredible quality. Worth every penny and more!",
    "This exceeded my expectations. The attention to detail is amazing.",
    "Best purchase I've made this year. Already recommended it to my entire team.",
    "Stunning work! The quality is on par with products 3x the price.",
    "I've been looking for something like this for months. Finally found perfection.",
    "The creator clearly put a ton of effort into this. Highly recommend!",
    "Game changer for my workflow. Saved me hours on my first project.",
    "Professional quality, beautifully organized, and easy to use. 10/10.",
    "Exactly what was described and then some. The bonus materials are great too.",
    "This is now an essential part of my toolkit. Can't imagine working without it.",
    "Wow, just wow. The depth and breadth of content here is remarkable.",
    "Downloaded, tried it, and immediately started using it in client work. Superb.",
    "I've bought similar products before but nothing comes close to this quality.",
    "The documentation alone is worth the price. Everything is so well explained.",
    "Purchased for my team of 5 and everyone loves it. Great value.",
  ],
  4: [
    "Really solid product. A couple of minor things could be improved but overall great.",
    "Very good quality. Would love to see more content added in future updates.",
    "Great value for the price. Does exactly what it promises.",
    "Well organized and thoughtfully designed. Minor UI quirk but nothing major.",
    "Impressed with the quality. Just wish there were a few more examples included.",
    "Solid purchase. The core content is excellent, bonus materials are decent.",
    "Good work! Some sections are outstanding, others are just good. Still worth it.",
    "Delivers on its promises. A few areas could use more depth but overall recommended.",
    "Happy with my purchase. Clean, professional, and mostly intuitive.",
    "Very useful! Lost one star because the documentation could be a bit clearer.",
  ],
  3: [
    "Decent product but missing some features I expected at this price point.",
    "It's okay. Does the basics well but nothing that really wowed me.",
    "Average quality. Some nice touches but also some rough edges.",
    "Not bad, but I've seen better options for similar prices.",
    "Functional and does what it says, but the presentation could be better.",
  ],
  2: [
    "Below expectations. The preview looked better than the actual product.",
    "Some useful elements but overall feels incomplete and rushed.",
  ],
  1: [
    "Not what I expected based on the description. Requesting a refund.",
  ],
};

// ─── Main Seed Function ─────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ═══════════════════════════════════════════
  // Step 1: Clear existing data (in FK order)
  // ═══════════════════════════════════════════
  console.log("🗑️  Clearing existing data...");
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
  console.log("   ✅ All tables cleared.\n");

  // ═══════════════════════════════════════════
  // Step 2: Create Users & Accounts
  // ═══════════════════════════════════════════
  console.log("👤 Creating users & accounts...");
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

    // Create credential account (Better Auth format)
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
  console.log(`   ✅ Created ${users.length} users with accounts.\n`);

  // ═══════════════════════════════════════════
  // Step 3: Create Products
  // ═══════════════════════════════════════════
  console.log("📦 Creating products...");
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
        productType: p.productType,
        thumbnailUrl: p.thumbnailUrl,
        coverUrl: p.coverUrl,
        category: p.category,
        tags: p.tags,
        status: p.status,
        callToAction: p.callToAction,
        publishedAt: p.publishedAt,
        isPayWhatYouWant: p.isPayWhatYouWant,
        minPriceCents: p.minPriceCents,
        suggestedPriceCents: p.suggestedPriceCents,
        isListedOnDiscover: true,
      },
    });
  }
  console.log(`   ✅ Created ${products.length} products.\n`);

  // ═══════════════════════════════════════════
  // Step 4: Create Product Variants (for select products)
  // ═══════════════════════════════════════════
  console.log("🏷️  Creating product variants...");
  const variantProducts = [
    {
      productId: "prd_aurora_ui_kit",
      variants: [
        { name: "Personal License", priceCents: 4900, description: "For individual use on personal projects", sortOrder: 0 },
        { name: "Team License (up to 5)", priceCents: 14900, description: "For teams of up to 5 designers", sortOrder: 1 },
        { name: "Enterprise License", priceCents: 29900, description: "Unlimited seats, priority support, custom components", sortOrder: 2 },
      ],
    },
    {
      productId: "prd_saas_starter",
      variants: [
        { name: "Starter", priceCents: 9900, description: "Full source code, personal projects only", sortOrder: 0 },
        { name: "Pro", priceCents: 19900, description: "Unlimited projects + 6 months of updates", sortOrder: 1 },
        { name: "Lifetime", priceCents: 29900, description: "Unlimited projects + lifetime updates + priority support", sortOrder: 2 },
      ],
    },
    {
      productId: "prd_design_system",
      variants: [
        { name: "Individual", priceCents: 7900, description: "For solo designers and freelancers", sortOrder: 0 },
        { name: "Team", priceCents: 19900, description: "For teams up to 10 people", sortOrder: 1 },
      ],
    },
    {
      productId: "prd_stock_photo_bundle",
      variants: [
        { name: "Standard (JPEG only)", priceCents: 4900, description: "500 images in high-quality JPEG", sortOrder: 0 },
        { name: "Premium (JPEG + RAW)", priceCents: 9900, description: "500 images in JPEG + RAW format", sortOrder: 1 },
      ],
    },
  ];

  let variantCount = 0;
  for (const vp of variantProducts) {
    for (const v of vp.variants) {
      await prisma.productVariant.create({
        data: {
          productId: vp.productId,
          name: v.name,
          priceCents: v.priceCents,
          description: v.description,
          sortOrder: v.sortOrder,
        },
      });
      variantCount++;
    }
  }
  console.log(`   ✅ Created ${variantCount} product variants.\n`);

  // ═══════════════════════════════════════════
  // Step 5: Create Orders
  // ═══════════════════════════════════════════
  console.log("🛒 Creating orders...");
  const buyerIds = ["usr_oliviachen", "usr_noahwilliams", "usr_avapatel"];
  const buyerEmails: Record<string, string> = {
    usr_oliviachen: "oliviachen@example.com",
    usr_noahwilliams: "noahwilliams@example.com",
    usr_avapatel: "avapatel@example.com",
  };
  const buyerNames: Record<string, string> = {
    usr_oliviachen: "Olivia Chen",
    usr_noahwilliams: "Noah Williams",
    usr_avapatel: "Ava Patel",
  };
  const countries = ["US", "US", "US", "CA", "GB", "DE", "AU", "IN", "FR", "JP"];

  // Track per-product stats
  const productStats: Record<string, { salesCount: number; revenueCents: number; ratings: number[]; viewCount: number }> = {};
  for (const p of products) {
    productStats[p.id] = {
      salesCount: 0,
      revenueCents: 0,
      ratings: [],
      viewCount: randomBetween(200, 8000),
    };
  }

  // Each buyer purchases ~35 of the 40 products (some overlap, some unique)
  const orderRecords: Array<{
    id: string;
    customerId: string;
    productId: string;
    creatorId: string;
    amountCents: number;
    createdAt: Date;
  }> = [];

  let orderIndex = 0;
  for (const buyerId of buyerIds) {
    // Each buyer purchases a random selection of products
    const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
    const purchaseCount = randomBetween(28, 38); // Each buyer buys most products
    const selectedProducts = shuffledProducts.slice(0, Math.min(purchaseCount, products.length));

    for (const product of selectedProducts) {
      orderIndex++;
      const orderId = `ord_${String(orderIndex).padStart(3, "0")}`;
      const amountCents = product.priceCents;
      const platformFee = Math.round(amountCents * 0.1);
      const processingFee = Math.round(amountCents * 0.029) + 30;
      const creatorRevenue = amountCents - platformFee - processingFee;

      // Random date after product was published
      const daysSincePublish = Math.floor((Date.now() - product.publishedAt.getTime()) / (1000 * 60 * 60 * 24));
      const orderDaysAgo = randomBetween(1, Math.max(1, daysSincePublish));
      const orderDate = daysAgo(orderDaysAgo);

      await prisma.order.create({
        data: {
          id: orderId,
          customerId: buyerId,
          customerEmail: buyerEmails[buyerId]!,
          customerName: buyerNames[buyerId],
          productId: product.id,
          creatorId: product.creatorId,
          amountCents,
          currency: "usd",
          platformFeeCents: platformFee,
          processingFeeCents: processingFee,
          creatorRevenueCents: Math.max(0, creatorRevenue),
          status: "completed",
          paymentProvider: "polar",
          polarOrderId: `pol_seed_${orderId}`,
          polarCheckoutId: `chk_seed_${orderId}`,
          country: countries[randomBetween(0, countries.length - 1)],
          createdAt: orderDate,
        },
      });

      orderRecords.push({
        id: orderId,
        customerId: buyerId,
        productId: product.id,
        creatorId: product.creatorId,
        amountCents,
        createdAt: orderDate,
      });

      // Update product stats
      productStats[product.id]!.salesCount++;
      productStats[product.id]!.revenueCents += amountCents;
    }
  }
  console.log(`   ✅ Created ${orderRecords.length} orders.\n`);

  // ═══════════════════════════════════════════
  // Step 6: Create Reviews (~65% of orders)
  // ═══════════════════════════════════════════
  console.log("⭐ Creating reviews...");
  // Track which product+customer combos already have reviews (one review per order)
  const reviewedOrders = new Set<string>();
  let reviewCount = 0;

  // Shuffle orders so reviews are randomly distributed
  const shuffledOrders = [...orderRecords].sort(() => Math.random() - 0.5);

  for (const order of shuffledOrders) {
    // ~65% chance of leaving a review
    if (Math.random() > 0.65) continue;

    // Skip if we already have too many reviews
    if (reviewCount >= 75) break;

    const reviewKey = `${order.productId}_${order.customerId}`;
    if (reviewedOrders.has(reviewKey)) continue;
    reviewedOrders.add(reviewKey);

    // Weighted rating distribution: mostly 4-5 stars
    const ratingRoll = Math.random();
    let rating: number;
    if (ratingRoll < 0.45) rating = 5;
    else if (ratingRoll < 0.80) rating = 4;
    else if (ratingRoll < 0.92) rating = 3;
    else if (ratingRoll < 0.97) rating = 2;
    else rating = 1;

    const commentsForRating = reviewComments[rating as keyof typeof reviewComments] ?? reviewComments[3];
    const comment = commentsForRating[randomBetween(0, commentsForRating.length - 1)]!;

    await prisma.review.create({
      data: {
        productId: order.productId,
        customerId: order.customerId,
        orderId: order.id,
        rating,
        content: comment,
        isVerified: true,
        createdAt: new Date(order.createdAt.getTime() + randomBetween(1, 14) * 24 * 60 * 60 * 1000),
      },
    });

    productStats[order.productId]!.ratings.push(rating);
    reviewCount++;
  }
  console.log(`   ✅ Created ${reviewCount} reviews.\n`);

  // ═══════════════════════════════════════════
  // Step 7: Update Product Stats
  // ═══════════════════════════════════════════
  console.log("📊 Updating product statistics...");
  for (const [productId, stats] of Object.entries(productStats)) {
    const ratingAvg = stats.ratings.length > 0
      ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
      : 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        salesCount: stats.salesCount,
        revenueCents: BigInt(stats.revenueCents),
        ratingAvg: Math.round(ratingAvg * 10) / 10,
        ratingCount: stats.ratings.length,
        viewCount: stats.viewCount,
      },
    });
  }
  console.log("   ✅ Product stats updated.\n");

  // ═══════════════════════════════════════════
  // Step 8: Create Followers
  // ═══════════════════════════════════════════
  console.log("👥 Creating followers...");
  const creatorIds = users.filter((u) => u.role === "creator").map((u) => u.id);
  let followerCount = 0;

  for (const buyerId of buyerIds) {
    for (const creatorId of creatorIds) {
      // Each buyer follows 5-8 creators
      if (Math.random() > 0.8) continue;

      await prisma.follower.create({
        data: {
          creatorId,
          followerEmail: buyerEmails[buyerId]!,
          followerId: buyerId,
          source: "checkout",
          isSubscribed: true,
        },
      });
      followerCount++;
    }
  }
  console.log(`   ✅ Created ${followerCount} followers.\n`);

  // ═══════════════════════════════════════════
  // Step 9: Create Discount Codes
  // ═══════════════════════════════════════════
  console.log("🏷️  Creating discount codes...");
  const discountCodes = [
    { creatorId: "usr_alexchen", productId: "prd_aurora_ui_kit", code: "DESIGN20", discountType: "percentage", discountValue: 20 },
    { creatorId: "usr_sarahmitchell", productId: "prd_golden_hour_presets", code: "GOLDEN15", discountType: "percentage", discountValue: 15 },
    { creatorId: "usr_marcusjohnson", productId: "prd_saas_starter", code: "SHIPFAST30", discountType: "percentage", discountValue: 30 },
    { creatorId: "usr_priyasharma", productId: "prd_watercolor_brushes", code: "ART25", discountType: "percentage", discountValue: 25 },
    { creatorId: "usr_davidkim", productId: "prd_lofi_sample_pack", code: "BEATS20", discountType: "percentage", discountValue: 20 },
    { creatorId: "usr_emmarodriguez", productId: "prd_novel_blueprint", code: "WRITE10", discountType: "percentage", discountValue: 10 },
    { creatorId: "usr_jamesobrien", productId: "prd_notion_dashboard", code: "LAUNCH25", discountType: "percentage", discountValue: 25 },
    { creatorId: "usr_yukitanaka", productId: "prd_blender_materials", code: "3DART20", discountType: "percentage", discountValue: 20 },
    // Fixed amount discounts
    { creatorId: "usr_alexchen", productId: "prd_design_system", code: "SAVE10", discountType: "fixed", discountValue: 1000 },
    { creatorId: "usr_marcusjohnson", productId: "prd_fullstack_ts_course", code: "LEARN20", discountType: "fixed", discountValue: 2000 },
  ];

  for (const dc of discountCodes) {
    await prisma.discountCode.create({
      data: {
        productId: dc.productId,
        creatorId: dc.creatorId,
        code: dc.code,
        discountType: dc.discountType,
        discountValue: dc.discountValue,
        maxUses: 100,
        currentUses: randomBetween(5, 30),
        validFrom: daysAgo(90),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
    });
  }
  console.log(`   ✅ Created ${discountCodes.length} discount codes.\n`);

  // ═══════════════════════════════════════════
  // Step 10: Create Payouts
  // ═══════════════════════════════════════════
  console.log("💰 Creating payouts...");
  let payoutCount = 0;
  for (const creatorId of creatorIds) {
    // Each creator has 2-4 past payouts
    const numPayouts = randomBetween(2, 4);
    for (let i = 0; i < numPayouts; i++) {
      const payoutDaysAgo = randomBetween(14 + i * 30, 30 + i * 30);
      await prisma.payout.create({
        data: {
          creatorId,
          amountCents: BigInt(randomBetween(5000, 50000)),
          currency: "usd",
          status: "completed",
          stripeTransferId: `tr_seed_${creatorId}_${i}`,
          periodStart: daysAgo(payoutDaysAgo + 30),
          periodEnd: daysAgo(payoutDaysAgo),
          completedAt: daysAgo(payoutDaysAgo - 2),
          createdAt: daysAgo(payoutDaysAgo),
        },
      });
      payoutCount++;
    }
  }
  console.log(`   ✅ Created ${payoutCount} payouts.\n`);

  // ═══════════════════════════════════════════
  // Step 11: Create Sample Workflows
  // ═══════════════════════════════════════════
  console.log("⚙️  Creating email workflows...");
  const workflows = [
    {
      creatorId: "usr_alexchen",
      name: "New Customer Welcome",
      triggerType: "purchase",
      steps: [
        { stepOrder: 1, delayHours: 0, subject: "Welcome! Here's your download 🎉", body: "Thanks for purchasing {product_name}! Here's everything you need to get started..." },
        { stepOrder: 2, delayHours: 72, subject: "How's it going with {product_name}?", body: "Hey {customer_name}, just checking in! Have you had a chance to explore everything in the kit?" },
        { stepOrder: 3, delayHours: 168, subject: "Quick tip for getting more out of your purchase", body: "Here's a pro tip that most customers miss..." },
      ],
    },
    {
      creatorId: "usr_marcusjohnson",
      name: "Course Onboarding",
      triggerType: "purchase",
      triggerProductId: "prd_fullstack_ts_course",
      steps: [
        { stepOrder: 1, delayHours: 0, subject: "Your TypeScript course is ready! 🚀", body: "Welcome to Full-Stack TypeScript! Here's how to access your course materials..." },
        { stepOrder: 2, delayHours: 48, subject: "Module 1 check-in", body: "Have you started Module 1 yet? Here are some tips to get the most out of it..." },
        { stepOrder: 3, delayHours: 168, subject: "Halfway point 🎯", body: "You should be through the first few modules by now. Keep going!" },
        { stepOrder: 4, delayHours: 336, subject: "How to get help if you're stuck", body: "Remember, you have access to the private Discord community..." },
      ],
    },
  ];

  for (const wf of workflows) {
    const workflow = await prisma.workflow.create({
      data: {
        creatorId: wf.creatorId,
        name: wf.name,
        triggerType: wf.triggerType,
        triggerProductId: wf.triggerProductId ?? null,
        isActive: true,
      },
    });

    for (const step of wf.steps) {
      await prisma.workflowStep.create({
        data: {
          workflowId: workflow.id,
          stepOrder: step.stepOrder,
          delayHours: step.delayHours,
          subject: step.subject,
          body: step.body,
        },
      });
    }
  }
  console.log(`   ✅ Created ${workflows.length} workflows with steps.\n`);

  // ═══════════════════════════════════════════
  // Done!
  // ═══════════════════════════════════════════
  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ Seed complete! Summary:");
  console.log(`   • ${users.length} users (8 creators, 3 buyers, 1 admin)`);
  console.log(`   • ${products.length} products`);
  console.log(`   • ${variantCount} product variants`);
  console.log(`   • ${orderRecords.length} orders`);
  console.log(`   • ${reviewCount} reviews`);
  console.log(`   • ${followerCount} followers`);
  console.log(`   • ${discountCodes.length} discount codes`);
  console.log(`   • ${payoutCount} payouts`);
  console.log(`   • ${workflows.length} email workflows`);
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n🔑 All accounts use password: Password123!");
  console.log("   Example login: alexchen@example.com / Password123!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
