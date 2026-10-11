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
    // 1. If GEMINI_API_KEY or OPENAI_API_KEY is configured, attempt real LLM generation
    if (process.env.GEMINI_API_KEY) {
      try {
        const llmResult = await this.generateCopyWithGemini(input);
        if (llmResult) return llmResult;
      } catch (err) {
        console.warn("[AIService] Gemini LLM call failed, falling back to Domain Engine:", err);
      }
    }

    // 2. High-Precision Context-Aware Domain Engine (100% offline resilient)
    return this.generateCopyWithDomainEngine(input);
  }

  /**
   * Real LLM Bridge: Calls Google Gemini 1.5 Flash when GEMINI_API_KEY is configured
   */
  private async generateCopyWithGemini(input: GenerateCopyInput): Promise<GeneratedCopyOutput | null> {
    const { concept, category, tone = "persuasive", targetAudience } = input;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are a world-class digital product copywriter. Generate marketing copy for:
Product Concept: "${concept}"
Category: "${category || 'other'}"
Copywriting Tone: "${tone}" (one of: persuasive, technical, minimal, storytelling, indie)
Target Audience: "${targetAudience || 'general customers'}"

Return ONLY a single valid JSON object (no markdown code blocks, no backticks, no explanations) matching this exact format:
{
  "name": "Product title with tone-specific subtitle",
  "summary": "1-2 sentence compelling summary tailored specifically to the subject and target audience",
  "description": "Full formatted Markdown description containing: # Product Title, summary paragraph, ### ⚡ What's Inside (4 highly detailed emoji bullet points strictly relevant to the product subject), ### 🎯 Who This Is For (2 targeted bullet points), and a believable verified customer review quote block.",
  "category": "${category || 'other'}",
  "tags": ["5", "to", "7", "relevant", "lowercase", "tags"],
  "suggestedPriceCents": 1900,
  "callToAction": "Action-oriented button text",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) return null;

      const data = (await res.json()) as any;
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      const parsed = JSON.parse(rawText);
      if (parsed.name && parsed.summary && parsed.description) {
        return {
          name: String(parsed.name),
          summary: String(parsed.summary),
          description: String(parsed.description),
          category: String(parsed.category || category || "other"),
          tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : ["digital", "guide"],
          suggestedPriceCents: typeof parsed.suggestedPriceCents === "number" ? parsed.suggestedPriceCents : 2900,
          callToAction: String(parsed.callToAction || "Get Instant Access"),
          keyFeatures: Array.isArray(parsed.keyFeatures) ? parsed.keyFeatures.map(String) : [],
        };
      }
    } catch {
      clearTimeout(timeoutId);
    }
    return null;
  }

  /**
   * Advanced Context-Aware Domain Engine
   * Detects niche (Fitness/Diet, Software, Design, Business, Education, etc.)
   * and crafts tailored, professional copywriting without tech boilerplate.
   */
  private generateCopyWithDomainEngine(input: GenerateCopyInput): GeneratedCopyOutput {
    const { concept, category, tone = "persuasive", targetAudience } = input;
    const lowerConcept = concept.toLowerCase();
    const cleanAudience = targetAudience?.trim() || "";

    // Capitalize concept terms for clean title synthesis
    const cleanWords = concept
      .replace(/[^\w\s-]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const baseTitle = cleanWords.slice(0, 5).join(" ");

    // ─── Domain Classification ──────────────────────────────────────────
    type DomainType =
      | "fitness"
      | "software"
      | "design"
      | "business"
      | "3d"
      | "music"
      | "photography"
      | "fiction"
      | "education"
      | "general";

    let domain: DomainType = "general";

    if (
      lowerConcept.includes("gym") ||
      lowerConcept.includes("diet") ||
      lowerConcept.includes("fitness") ||
      lowerConcept.includes("workout") ||
      lowerConcept.includes("macro") ||
      lowerConcept.includes("nutrition") ||
      lowerConcept.includes("muscle") ||
      lowerConcept.includes("meal") ||
      lowerConcept.includes("protein") ||
      lowerConcept.includes("calorie") ||
      lowerConcept.includes("fat loss") ||
      lowerConcept.includes("weight") ||
      lowerConcept.includes("exercise") ||
      lowerConcept.includes("shred") ||
      lowerConcept.includes("bulk")
    ) {
      domain = "fitness";
    } else if (
      lowerConcept.includes("code") ||
      lowerConcept.includes("software") ||
      lowerConcept.includes("nextjs") ||
      lowerConcept.includes("react") ||
      lowerConcept.includes("api") ||
      lowerConcept.includes("typescript") ||
      lowerConcept.includes("python") ||
      lowerConcept.includes("saas") ||
      lowerConcept.includes("boilerplate") ||
      lowerConcept.includes("starter") ||
      lowerConcept.includes("developer") ||
      lowerConcept.includes("backend") ||
      lowerConcept.includes("frontend") ||
      lowerConcept.includes("automation") ||
      lowerConcept.includes("bot")
    ) {
      domain = "software";
    } else if (
      lowerConcept.includes("figma") ||
      lowerConcept.includes("ui") ||
      lowerConcept.includes("ux") ||
      lowerConcept.includes("design") ||
      lowerConcept.includes("component") ||
      lowerConcept.includes("wireframe") ||
      lowerConcept.includes("mockup") ||
      lowerConcept.includes("icon") ||
      lowerConcept.includes("typography") ||
      lowerConcept.includes("layout") ||
      lowerConcept.includes("color palette")
    ) {
      domain = "design";
    } else if (
      lowerConcept.includes("3d") ||
      lowerConcept.includes("blender") ||
      lowerConcept.includes("shader") ||
      lowerConcept.includes("render") ||
      lowerConcept.includes("mesh") ||
      lowerConcept.includes("game asset") ||
      lowerConcept.includes("unity") ||
      lowerConcept.includes("unreal")
    ) {
      domain = "3d";
    } else if (
      lowerConcept.includes("notion") ||
      lowerConcept.includes("startup") ||
      lowerConcept.includes("crm") ||
      lowerConcept.includes("operating system") ||
      lowerConcept.includes("finance") ||
      lowerConcept.includes("pitch") ||
      lowerConcept.includes("invest") ||
      lowerConcept.includes("marketing") ||
      lowerConcept.includes("planner") ||
      lowerConcept.includes("tracker") ||
      lowerConcept.includes("budget")
    ) {
      domain = "business";
    } else if (
      lowerConcept.includes("music") ||
      lowerConcept.includes("audio") ||
      lowerConcept.includes("beat") ||
      lowerConcept.includes("sample") ||
      lowerConcept.includes("synth") ||
      lowerConcept.includes("mixing") ||
      lowerConcept.includes("stem") ||
      lowerConcept.includes("vocal")
    ) {
      domain = "music";
    } else if (
      lowerConcept.includes("photo") ||
      lowerConcept.includes("preset") ||
      lowerConcept.includes("lightroom") ||
      lowerConcept.includes("camera") ||
      lowerConcept.includes("lut") ||
      lowerConcept.includes("color grading")
    ) {
      domain = "photography";
    } else if (
      lowerConcept.includes("novel") ||
      lowerConcept.includes("book") ||
      lowerConcept.includes("writing") ||
      lowerConcept.includes("story") ||
      lowerConcept.includes("author") ||
      lowerConcept.includes("manuscript") ||
      lowerConcept.includes("screenplay")
    ) {
      domain = "fiction";
    } else if (
      lowerConcept.includes("course") ||
      lowerConcept.includes("tutorial") ||
      lowerConcept.includes("masterclass") ||
      lowerConcept.includes("curriculum") ||
      lowerConcept.includes("exam") ||
      lowerConcept.includes("student") ||
      lowerConcept.includes("study guide") ||
      lowerConcept.includes("cheat sheet")
    ) {
      domain = "education";
    }

    // ─── Domain Specific Content Profiles ──────────────────────────────
    let name = "";
    let summary = "";
    let insideBullets: string[] = [];
    let whoBullets: string[] = [];
    let testimonial = "";
    let tags: string[] = [];
    let suggestedPriceCents = 2900;
    let callToAction = "Get Instant Access";
    let keyFeatures: string[] = [];
    let assignedCategory = category || "other";

    if (domain === "fitness") {
      assignedCategory = category && category !== "software" ? category : "other";
      suggestedPriceCents = 1900;
      callToAction = "Get The Diet Plan";
      tags = ["fitness", "gym", "diet-plan", "meal-prep", "macros", "nutrition", "healthy-eating"];
      keyFeatures = [
        "Customized Calorie & Macro Calculator",
        "7-Day Whole-Food Meal Prep Framework",
        "Pre & Post-Workout Fueling Matrix",
        "Printable Weekly Grocery Shopping Guide",
      ];

      const toneTitles: Record<string, string> = {
        minimal: `${baseTitle} — Essential Edition`,
        persuasive: `${baseTitle} — Ultimate Body Transformation Protocol`,
        technical: `${baseTitle} — Precision Macro & Nutrient Timing Blueprint`,
        storytelling: `${baseTitle} — The Mind & Muscle Nutrition Journey`,
        indie: `${baseTitle} — The Real Food Field Guide`,
      };
      name = (tone && toneTitles[tone]) ? toneTitles[tone]! : `${baseTitle} — Essential Edition`;

      const defaultSummary = `A clean, distraction-free daily nutrition and meal prep framework designed to fuel intense workouts and simplify healthy eating for ${cleanAudience || "fitness enthusiasts"}.`;
      const toneSummaries: Record<string, string> = {
        minimal: defaultSummary,
        persuasive: `Transform your physique, torch body fat, and build lean muscle with a high-protein nutrition plan engineered specifically for ${cleanAudience || "dedicated gym lifters"}.`,
        technical: `Calculated macronutrient timing, metabolic caloric targets, and science-backed nutritional protocols optimized for ${cleanAudience || "serious athletes and lifters"}.`,
        storytelling: `The sustainable whole-food diet philosophy that helps you break through strength plateaus without extreme starvation. Perfect for ${cleanAudience || "fitness enthusiasts"}.`,
        indie: `No fad diets or sponsored powders—just a realistic, battle-tested meal blueprint built for ${cleanAudience || "everyday gym lifters"}.`,
      };
      summary = (tone && toneSummaries[tone]) ? toneSummaries[tone]! : defaultSummary;

      insideBullets = [
        "🥗 **Targeted Calorie & Macro Protocols**: Customized protein, carb, and healthy fat splits tailored for muscle growth, fat loss, or lean maintenance.",
        "🥩 **7-Day Structured Meal Framework**: Simple, high-protein whole-food meals with exact portion weights, prep times, and grocery lists.",
        "⚡ **Pre & Post-Workout Fueling Matrix**: Strategic nutrient timing rules to fuel heavy lifting sessions and accelerate muscle protein synthesis.",
        "📋 **Printable Weekly Meal Prep & Pantry Checklist**: Printable shopping guide and batch-cooking timetable to eliminate dietary guesswork.",
      ];

      whoBullets = [
        `Specifically designed for **${cleanAudience || "fitness enthusiasts"}** who want a clear, sustainable eating routine without counting every grain of rice.`,
        "Anyone tired of contradictory fitness influencer advice looking for an actionable, proven daily food plan.",
      ];

      testimonial =
        '> "Finally, a diet plan that is actually sustainable. Dropped 4% body fat in 8 weeks while adding 15kg to my deadlift without feeling starved." — Mark R., Verified Lifter';
    } else if (domain === "software") {
      assignedCategory = "software";
      suggestedPriceCents = 4900;
      callToAction = "Download Codebase";
      tags = ["software", "devtools", "boilerplate", "typescript", "starter-kit", "webdev"];
      keyFeatures = [
        "TypeScript Strict Mode & Clean Architecture",
        "Pre-Configured Authentication & Database",
        "Modular REST & WebSocket Route Handlers",
        "Commercial Self-Hosted Deployment License",
      ];

      const toneTitles: Record<string, string> = {
        minimal: `${baseTitle} — Minimal Dev Edition`,
        persuasive: `${baseTitle} — Production-Ready Starter Kit`,
        technical: `${baseTitle} — Architecture & Enterprise Blueprint`,
        storytelling: `${baseTitle} — The Solo Hacker Stack`,
        indie: `${baseTitle} — Ship-In-Days Boilerplate`,
      };
      name = (tone && toneTitles[tone]) ? toneTitles[tone]! : `${baseTitle} — Pro Edition`;

      summary = `Production-grade architecture with zero fluff. Skip 40+ hours of repetitive setup and ship immediately. Tailored for ${cleanAudience || "software developers and indie hackers"}.`;

      insideBullets = [
        "🚀 **Production-Tested Codebase**: Full source code with strict TypeScript, clean architecture, and modular edge-ready routes.",
        "🔐 **Pre-Configured Authentication & Database**: Built-in Better-Auth, Prisma ORM migrations, and session management.",
        "🛠️ **Developer Setup & Architecture Guide**: Step-by-step documentation with CLI scripts, environment templates, and deploy scripts.",
        "📦 **Perpetual Commercial License**: Full rights for personal projects, client deliverables, and commercial endeavors.",
      ];

      whoBullets = [
        `Specifically designed for **${cleanAudience || "developers and tech founders"}** who value time and want to launch fast.`,
        "Engineers tired of wiring up auth, databases, and Docker configurations from scratch on every new project.",
      ];

      testimonial =
        '> "Saved me over 40 hours of setup on my latest SaaS launch. Clean architecture, zero bloat, and worked straight out of the box." — Sarah K., Fullstack Engineer';
    } else if (domain === "design") {
      assignedCategory = "design";
      suggestedPriceCents = 3900;
      callToAction = "Open in Figma";
      tags = ["figma", "ui-kit", "design-system", "components", "responsive", "ui-design"];
      keyFeatures = [
        "500+ Component Variants with Auto-Layout 5.0",
        "Calibrated Dark & Light Mode Color Tokens",
        "WCAG AAA Accessible Typography Scale",
        "Pre-Built Responsive Screen Templates",
      ];

      name = `${baseTitle} — Figma UI System`;
      summary = `Pixel-perfect component library with responsive design tokens and dark/light modes. Crafted for ${cleanAudience || "UI/UX designers and frontend developers"}.`;

      insideBullets = [
        "🎨 **500+ Component Variants**: Inputs, buttons, modals, cards, and navigation bars built with Figma Auto-Layout 5.0.",
        "🌓 **Dual Theme Token Harmonizer**: Seamless dark and light mode color scales mapped directly to Tailwind CSS variables.",
        "📐 **Ready-to-Ship Page Layouts**: High-converting landing pages, dashboard tables, and mobile checkout templates.",
        "🔤 **Typography & Icon Assets**: Complete font hierarchy scales with a curated vector icon collection.",
      ];

      whoBullets = [
        `Specifically designed for **${cleanAudience || "designers and product teams"}** looking to accelerate interface delivery.`,
        "Builders wanting modern aesthetic polish without hiring an expensive design agency.",
      ];

      testimonial =
        '> "The component architecture is immaculate. Cut our redesign sprint in half while dramatically elevating our design consistency." — Alex T., Design Lead';
    } else if (domain === "business") {
      assignedCategory = "business";
      suggestedPriceCents = 3400;
      callToAction = "Duplicate Notion Workspace";
      tags = ["notion", "productivity", "business", "planner", "system", "operations", "startup"];
      keyFeatures = [
        "Centralized KPI & Revenue Dashboard",
        "Connected Projects & Task Relational Databases",
        "Client CRM & Invoice Tracking System",
        "Standard Operating Procedures (SOP) Library",
      ];

      name = `${baseTitle} — Executive Operating System`;
      summary = `The all-in-one productivity workspace to streamline operations, track metrics, and manage projects. Designed for ${cleanAudience || "founders, freelancers, and operators"}.`;

      insideBullets = [
        "📊 **Executive Command Dashboard**: High-level views of active milestones, daily priorities, and financial health.",
        "🔄 **Relational Databases & CRM**: Interlinked tables for clients, contracts, meeting notes, and payment statuses.",
        "📑 **Standard Operating Playbooks (SOPs)**: Pre-formatted templates for client onboarding, quarterly reviews, and team delegation.",
        "📈 **Financial Modeling & Cash Flow Projections**: Automated formulas to track MRR, expenses, and profit margins.",
      ];

      whoBullets = [
        `Specifically designed for **${cleanAudience || "solo founders and entrepreneurs"}** managing multiple client projects.`,
        "Anyone feeling overwhelmed by scattered notes and looking for a cohesive operational cockpit.",
      ];

      testimonial =
        '> "Completely eliminated administrative chaos in my business. Saves me at least 6 hours every single week." — James O., Agency Owner';
    } else if (domain === "education") {
      assignedCategory = "education";
      suggestedPriceCents = 2900;
      callToAction = "Access Study Guide";
      tags = ["education", "course", "study-guide", "tutorial", "masterclass", "learning"];
      keyFeatures = [
        "Step-by-Step Structured Learning Curriculum",
        "High-Yield Concept Cheat Sheets & Summary Cards",
        "Practical Hands-On Exercises & Solution Keys",
        "Lifetime Access to Future Curriculum Revisions",
      ];

      name = `${baseTitle} — Masterclass & Study Guide`;
      summary = `Master fundamental concepts and real-world techniques through structured, high-yield lessons. Ideal for ${cleanAudience || "students and self-directed learners"}.`;

      insideBullets = [
        "📚 **Comprehensive Learning Modules**: Logically sequenced units that break complex topics into digestible steps.",
        "📝 **High-Yield Cheat Sheets**: Quick-reference summary sheets and mental models for rapid recall and exam prep.",
        "🎯 **Practical Application Exercises**: Challenging practice problems with detailed step-by-step solutions.",
        "💡 **Curated Resource Compendium**: Recommended reading lists, software tools, and reference documentation.",
      ];

      whoBullets = [
        `Specifically designed for **${cleanAudience || "students and ambitious learners"}** looking to accelerate mastery.`,
        "Anyone who wants a clear, structured roadmap instead of watching endless disjointed YouTube tutorials.",
      ];

      testimonial =
        '> "Clear, concise, and straight to the point. Concepts that took weeks to grasp in class clicked within two days." — Elena R., Student Review';
    } else {
      // General Product Synthesizer (Any arbitrary niche or concept)
      assignedCategory = category || "other";
      suggestedPriceCents = 2400;
      callToAction = "Get Instant Access";
      tags = [
        cleanWords[0]?.toLowerCase() || "digital",
        cleanWords[1]?.toLowerCase() || "guide",
        "handbook",
        "templates",
        "action-plan",
        "resources",
      ];
      keyFeatures = [
        `Step-by-Step Comprehensive Roadmap for ${baseTitle}`,
        "Actionable Templates, Worksheets & Checklists",
        "Curated Resource Directory & Best Practices",
        "Lifetime Access with Future Revisions Included",
      ];

      const toneTitles: Record<string, string> = {
        minimal: `${baseTitle} — Essential Edition`,
        persuasive: `${baseTitle} — The Complete Master Blueprint`,
        technical: `${baseTitle} — Systematic Field Guide & Standards`,
        storytelling: `${baseTitle} — The Practical Handbook & Journey`,
        indie: `${baseTitle} — The No-BS Action Plan`,
      };
      name = (tone && toneTitles[tone]) ? toneTitles[tone]! : `${baseTitle} — Essential Edition`;

      summary = `A comprehensive, step-by-step digital resource designed to save you hours of trial and error with actionable frameworks and practical templates. Tailored for ${cleanAudience || "creators, enthusiasts, and practitioners"}.`;

      insideBullets = [
        `📘 **Complete Step-by-Step Methodology**: In-depth, organized walkthroughs of core techniques and workflows for ${baseTitle}.`,
        "📋 **Actionable Templates & Printable Checklists**: Real-world worksheets and tools designed to streamline execution and eliminate mistakes.",
        "💡 **Resource Directory & Insider Tips**: Curated reference lists, common pitfalls to avoid, and expert shortcuts.",
        "🔄 **Lifetime Updates & Future Revisions**: Continuous access to updated materials and bonus additions as new techniques emerge.",
      ];

      whoBullets = [
        `Specifically designed for **${cleanAudience || "enthusiasts and practitioners"}** who want a clear, proven framework.`,
        `Anyone tired of trial-and-error searching who wants an actionable, all-in-one resource for ${baseTitle}.`,
      ];

      testimonial =
        '> "An exceptionally organized resource that cut weeks off my learning curve. Everything is practical and ready to use immediately." — Verified Patron Review';
    }

    // ─── Format Final Markdown Description ─────────────────────────────
    const description = `# ${name}

${summary}

### ⚡ What's Inside:
${insideBullets.map((b) => `- ${b}`).join("\n")}

### 🎯 Who This Is For:
${whoBullets.map((b) => `- ${b}`).join("\n")}

${testimonial}
`;

    return {
      name,
      summary,
      description,
      category: assignedCategory,
      tags,
      suggestedPriceCents,
      callToAction,
      keyFeatures,
    };
  }
}

export const aiService = new AIService();

