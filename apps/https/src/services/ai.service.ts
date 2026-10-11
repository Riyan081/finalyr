import prisma from "@repo/db/client";
import type { GenerateCopyInput, GeneratedCopyOutput } from "@repo/common";

// ─── English Stopwords for NLP Tokenization ─────────────────────────────────
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
  "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
  "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
  "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no",
  "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
  "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
  "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
  "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to",
  "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
  "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
  "your", "yours", "yourself", "yourselves"
]);

// ─── Semantic Synonym & Domain Expansion Lexicon ────────────────────────────
const DOMAIN_SYNONYMS: Record<string, string[]> = {
  deploy: ["devops", "cloud", "docker", "kubernetes", "hosting", "infrastructure"],
  api: ["backend", "http", "rest", "graphql", "microservices", "debugger"],
  saas: ["starter", "boilerplate", "template", "nextjs", "software", "auth"],
  design: ["figma", "ui", "ux", "components", "mockup", "icons", "wireframe"],
  art: ["drawing", "procreate", "illustration", "brush", "painting", "concept"],
  music: ["audio", "beats", "sample", "synth", "mixing", "producer", "stems"],
  photo: ["photography", "lightroom", "presets", "colorist", "editorial", "camera"],
  story: ["fiction", "worldbuilding", "novel", "writing", "scifi", "fantasy"],
  business: ["operating", "notion", "pitch", "startup", "finance", "venture"],
  code: ["programming", "developer", "software", "typescript", "fullstack", "react"],
};

export interface SemanticSearchResult {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  priceCents: number;
  category: string | null;
  thumbnailUrl: string | null;
  creator: {
    name: string;
    username: string | null;
  };
  matchScore: number; // 0 to 100
  matchReason: string;
}

export interface RecommendationResult {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  priceCents: number;
  category: string | null;
  thumbnailUrl: string | null;
  ratingAvg: number;
  creator: {
    name: string;
    username: string | null;
  };
  matchScore: number; // percentage
  recommendationType: "semantic" | "co-purchased" | "category-top";
  badgeText: string;
}

export class AIService {
  // ─── Helper: Tokenize & Compute Weighted Term Frequency ───────────────────
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  }

  private buildTermVector(
    fields: { text: string; weight: number }[],
    expandSynonyms = true
  ): Map<string, number> {
    const vector = new Map<string, number>();

    for (const field of fields) {
      const tokens = this.tokenize(field.text);
      for (const token of tokens) {
        vector.set(token, (vector.get(token) || 0) + field.weight);

        // Optional domain expansion
        if (expandSynonyms && DOMAIN_SYNONYMS[token]) {
          for (const syn of DOMAIN_SYNONYMS[token]) {
            vector.set(syn, (vector.get(syn) || 0) + field.weight * 0.4);
          }
        }
      }
    }

    return vector;
  }

  private cosineSimilarity(v1: Map<string, number>, v2: Map<string, number>): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const [, val] of v1) {
      norm1 += val * val;
    }
    for (const [, val] of v2) {
      norm2 += val * val;
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    for (const [key, val1] of v1) {
      const val2 = v2.get(key);
      if (val2) {
        dotProduct += val1 * val2;
      }
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // ─── 1. AI Semantic Search Engine ─────────────────────────────────────────
  async semanticSearch(query: string, limit = 12, categoryFilter?: string): Promise<SemanticSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // 1. Fetch published candidates
    const products = await prisma.product.findMany({
      where: {
        status: "published",
        isListedOnDiscover: true,
        ...(categoryFilter ? { category: categoryFilter } : {}),
      },
      include: {
        creator: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    if (products.length === 0) return [];

    // 2. Build Query Vector with synonyms
    const queryVector = this.buildTermVector(
      [{ text: query, weight: 1.0 }],
      true // expand synonyms
    );

    // 3. Compute Cosine Similarity against each product
    const scoredProducts = products.map((product) => {
      const productVector = this.buildTermVector(
        [
          { text: product.name, weight: 3.5 },
          { text: product.category || "", weight: 2.5 },
          { text: product.tags.join(" "), weight: 2.0 },
          { text: product.summary || "", weight: 1.5 },
          { text: product.description || "", weight: 0.8 },
        ],
        false
      );

      const cosineSim = this.cosineSimilarity(queryVector, productVector);

      // Percentage normalized (clamp between 0 and 100)
      const matchScore = Math.min(100, Math.round(cosineSim * 100));

      let matchReason = "High Semantic Match";
      if (product.category && query.toLowerCase().includes(product.category.toLowerCase())) {
        matchReason = `Direct Match in ${product.category.toUpperCase()}`;
      } else if (cosineSim > 0.4) {
        matchReason = "Conceptual Relevance";
      } else {
        matchReason = "Contextual Correlation";
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        summary: product.summary,
        priceCents: product.priceCents,
        category: product.category,
        thumbnailUrl: product.thumbnailUrl,
        creator: product.creator,
        matchScore,
        matchReason,
      };
    });

    // 4. Filter threshold and sort descending by score
    return scoredProducts
      .filter((p) => p.matchScore > 10)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  // ─── 2. Hybrid Product Recommendation Engine ──────────────────────────────
  async getRecommendations(targetProductId: string, limit = 4): Promise<RecommendationResult[]> {
    const targetProduct = await prisma.product.findUnique({
      where: { id: targetProductId },
    });

    if (!targetProduct) return [];

    // Target vector
    const targetVector = this.buildTermVector(
      [
        { text: targetProduct.name, weight: 3.0 },
        { text: targetProduct.category || "", weight: 2.5 },
        { text: targetProduct.tags.join(" "), weight: 2.0 },
        { text: targetProduct.summary || "", weight: 1.5 },
      ],
      true
    );

    // Fetch candidate catalog (exclude self, must be published)
    const candidates = await prisma.product.findMany({
      where: {
        id: { not: targetProductId },
        status: "published",
        isListedOnDiscover: true,
      },
      include: {
        creator: { select: { name: true, username: true } },
      },
    });

    if (candidates.length === 0) return [];

    // Collaborative Filtering Signal: Co-purchase analysis from Orders
    // Find customers who bought target product
    const ordersForTarget = await prisma.order.findMany({
      where: { productId: targetProductId, status: "completed" },
      select: { customerId: true, customerEmail: true },
    });

    const buyerEmails = new Set(ordersForTarget.map((o) => o.customerEmail));

    // Co-purchased product counts by those buyers
    const coPurchasedCounts = new Map<string, number>();
    if (buyerEmails.size > 0) {
      const coOrders = await prisma.order.findMany({
        where: {
          customerEmail: { in: Array.from(buyerEmails) },
          productId: { not: targetProductId },
          status: "completed",
        },
        select: { productId: true },
      });

      for (const ord of coOrders) {
        coPurchasedCounts.set(ord.productId, (coPurchasedCounts.get(ord.productId) || 0) + 1);
      }
    }

    const maxCoPurchase = Math.max(1, ...Array.from(coPurchasedCounts.values(), (v) => v));

    // Compute Hybrid Linear Combination
    const scoredCandidates = candidates.map((cand) => {
      const candVector = this.buildTermVector(
        [
          { text: cand.name, weight: 3.0 },
          { text: cand.category || "", weight: 2.5 },
          { text: cand.tags.join(" "), weight: 2.0 },
          { text: cand.summary || "", weight: 1.5 },
        ],
        false
      );

      const contentSim = this.cosineSimilarity(targetVector, candVector); // 0.0 to 1.0
      const coPurchaseScore = (coPurchasedCounts.get(cand.id) || 0) / maxCoPurchase; // 0.0 to 1.0

      let hybridScore: number;
      let recommendationType: "semantic" | "co-purchased" | "category-top";
      let badgeText: string;

      if (coPurchasedCounts.has(cand.id)) {
        // High collaborative signal
        hybridScore = 0.5 * contentSim + 0.5 * coPurchaseScore;
        recommendationType = "co-purchased";
        badgeText = `Frequently Bought Together (${Math.round(hybridScore * 100)}%)`;
      } else if (cand.category === targetProduct.category) {
        // Category affinity
        hybridScore = 0.7 * contentSim + 0.3 * (cand.ratingAvg / 5.0);
        recommendationType = "category-top";
        badgeText = `${(cand.category || "General").toUpperCase()} Match (${Math.round(hybridScore * 100)}%)`;
      } else {
        // Pure semantic / complementary match
        hybridScore = contentSim;
        recommendationType = "semantic";
        badgeText = `AI Suggested (${Math.round(hybridScore * 100)}%)`;
      }

      return {
        id: cand.id,
        name: cand.name,
        slug: cand.slug,
        summary: cand.summary,
        priceCents: cand.priceCents,
        category: cand.category,
        thumbnailUrl: cand.thumbnailUrl,
        ratingAvg: cand.ratingAvg,
        creator: cand.creator,
        matchScore: Math.round(hybridScore * 100),
        recommendationType,
        badgeText,
      };
    });

    return scoredCandidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  // ─── 3. Creator AI Studio Copywriting & SEO Generator ─────────────────────
  async generateCopy(input: GenerateCopyInput): Promise<GeneratedCopyOutput> {
    const { concept, category, tone = "persuasive", targetAudience } = input;

    // Detect likely category if not specified
    let detectedCategory = category || "software";
    const lowerConcept = concept.toLowerCase();

    if (lowerConcept.includes("figma") || lowerConcept.includes("ui") || lowerConcept.includes("icon")) {
      detectedCategory = "design";
    } else if (lowerConcept.includes("blend") || lowerConcept.includes("3d") || lowerConcept.includes("shader")) {
      detectedCategory = "3d";
    } else if (lowerConcept.includes("beat") || lowerConcept.includes("audio") || lowerConcept.includes("sample")) {
      detectedCategory = "music";
    } else if (lowerConcept.includes("preset") || lowerConcept.includes("lightroom") || lowerConcept.includes("photo")) {
      detectedCategory = "photography";
    } else if (lowerConcept.includes("notion") || lowerConcept.includes("startup") || lowerConcept.includes("pitch")) {
      detectedCategory = "business";
    } else if (lowerConcept.includes("novel") || lowerConcept.includes("book") || lowerConcept.includes("story")) {
      detectedCategory = "fiction";
    } else if (lowerConcept.includes("brush") || lowerConcept.includes("draw") || lowerConcept.includes("paint")) {
      detectedCategory = "drawing";
    } else if (lowerConcept.includes("course") || lowerConcept.includes("learn") || lowerConcept.includes("guide")) {
      detectedCategory = "education";
    }

    // Capitalize concept terms for title synthesis
    const cleanConceptWords = concept.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const titleRoot = cleanConceptWords.slice(0, 5).join(" ");

    // Tone modifiers
    const toneHooks: Record<string, { prefix: string; hook: string; cta: string }> = {
      persuasive: {
        prefix: "Pro",
        hook: "Supercharge your workflow and ship 10x faster with production-grade assets.",
        cta: "Get Instant Access",
      },
      technical: {
        prefix: "Engineered",
        hook: "Architected for high-performance and strict engineering standards. Zero bloat.",
        cta: "Download Tool",
      },
      minimal: {
        prefix: "Essential",
        hook: "Clean, distraction-free toolkit refined to perfection.",
        cta: "Buy Now",
      },
      storytelling: {
        prefix: "Mastery",
        hook: "Unlock the exact blueprints distilled from years of real-world mastery.",
        cta: "Start Exploring",
      },
      indie: {
        prefix: "Indie",
        hook: "Built by a bootstrapped creator for builders who value time and craftsmanship.",
        cta: "I want this!",
      },
    };

    const defaultTone = {
      prefix: "Ultimate",
      hook: "Engineered to deliver high performance, immediate utility, and professional polish.",
      cta: "Get Instant Access",
    };

    const activeTone = (tone && toneHooks[tone]) ? toneHooks[tone] : defaultTone;
    const name = `${titleRoot} — ${activeTone.prefix} Edition`;
    const summary = `${activeTone.hook} Ideal for ${targetAudience || "builders, designers, and creators"}.`;

    // Markdown description builder
    const description = `# ${name}

${summary}

### ⚡ What's Inside:
- 🚀 **Production-Tested Assets**: Fully modular, verified, and ready to drop directly into your projects.
- 🛠️ **Comprehensive Guide & Documentation**: Step-by-step setup manual with tips and best practices.
- 🎨 **Source Files & Raw Deliverables**: Lifetime access to high-resolution assets and future patch updates.
- 🔒 **Commercial-Ready Licensing**: Full permission for personal and client-facing commercial endeavors.

### 🎯 Who This Is For:
${targetAudience ? `- Specifically designed for **${targetAudience}** looking for exceptional craftsmanship.` : "- Developers, creators, and indie founders who value high-leverage tools."}
- Anyone tired of spending days reinventing wheels from scratch.

> "A massive time-saver that paid for itself within the first hour of use." — Verified Patron Review`;

    // Category-specific price & tag defaults
    const categoryConfigs: Record<string, { tags: string[]; price: number; features: string[] }> = {
      software: {
        tags: ["software", "devtools", "boilerplate", "typescript", "starter-kit"],
        price: 4900,
        features: ["TypeScript strict mode", "Instant setup guide", "Commercial license"],
      },
      design: {
        tags: ["figma", "ui-kit", "design-system", "components", "responsive"],
        price: 3900,
        features: ["Auto-layout 5.0", "Dark/Light tokens", "Figma component variants"],
      },
      "3d": {
        tags: ["blender", "3d-assets", "game-ready", "textures", "pbr-shaders"],
        price: 5900,
        features: ["PBR material maps", "Sub-D geometry", "Optimized polycount"],
      },
      music: {
        tags: ["samples", "beats", "audio-stems", "analog-synth", "mixing"],
        price: 2900,
        features: ["24-bit 48kHz WAV", "100% Royalty Free", "Key & BPM labeled"],
      },
      photography: {
        tags: ["lightroom", "presets", "colorist", "editorial", "lut"],
        price: 3400,
        features: ["Desktop & Mobile presets", "Natural skin-tone preservation", "XMP & DNG files"],
      },
      fiction: {
        tags: ["novel", "worldbuilding", "writing", "scifi", "templates"],
        price: 2400,
        features: ["Character archetype matrices", "Plot progression outlines", "Scrivener & PDF"],
      },
      business: {
        tags: ["notion", "operating-system", "saas", "pitch-deck", "finance"],
        price: 6900,
        features: ["Financial model template", "Automated dashboards", "Fundraising playbook"],
      },
      drawing: {
        tags: ["procreate", "brushes", "digital-art", "anatomy", "illustration"],
        price: 2200,
        features: ["Custom pressure curve", "Hi-res texture grains", "Brushstroke tutorial"],
      },
      education: {
        tags: ["course", "masterclass", "tutorial", "curriculum", "guide"],
        price: 4500,
        features: ["Step-by-step video breakdown", "Code repositories", "Self-assessment exercises"],
      },
    };

    const defaultConfig = {
      tags: ["software", "devtools", "boilerplate", "typescript", "starter-kit"],
      price: 4900,
      features: ["TypeScript strict mode", "Instant setup guide", "Commercial license"],
    };

    const config = categoryConfigs[detectedCategory] || defaultConfig;

    return {
      name,
      summary,
      description,
      category: detectedCategory,
      tags: config.tags,
      suggestedPriceCents: config.price,
      callToAction: activeTone.cta,
      keyFeatures: config.features,
    };
  }
}

export const aiService = new AIService();
