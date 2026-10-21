/**
 * Search Query Normalization & Variation Generator
 *
 * Provides bidirectional query expansion so that hyphenated, non-hyphenated,
 * space-separated, and dot-separated terms are treated as exact matches.
 *
 * Examples:
 * - "lowpoly"   <-> "low-poly"  <-> "low poly"
 * - "nextjs"    <-> "next.js"   <-> "next-js"   <-> "next js"
 * - "fullstack" <-> "full-stack" <-> "full stack"
 * - "sci-fi"    <-> "scifi"     <-> "sci fi"
 */

// ─── Known Compound Terms & Domain Vocabulary ─────────────────────────────────
const COMPOUND_DICTIONARY: Record<string, string[]> = {
  // 3D & Gaming
  lowpoly: ["low-poly", "low poly"],
  highpoly: ["high-poly", "high poly"],
  gamedev: ["game-dev", "game dev"],
  hardsurface: ["hard-surface", "hard surface"],
  pixelart: ["pixel-art", "pixel art"],
  kitbash: ["kit-bash", "kit bash"],
  archviz: ["arch-viz", "arch viz"],

  // Tech & Software
  nextjs: ["next.js", "next-js", "next js"],
  reactnative: ["react-native", "react native"],
  fullstack: ["full-stack", "full stack"],
  frontend: ["front-end", "front end"],
  backend: ["back-end", "back end"],
  devops: ["dev-ops", "dev ops"],
  devtools: ["dev-tools", "dev tools"],
  microsaas: ["micro-saas", "micro saas"],
  uikit: ["ui-kit", "ui kit"],
  starterkit: ["starter-kit", "starter kit"],
  offlinefirst: ["offline-first", "offline first"],
  multitenant: ["multi-tenant", "multi tenant"],
  multiagent: ["multi-agent", "multi agent"],
  crossplatform: ["cross-platform", "cross platform"],
  opensource: ["open-source", "open source"],
  realtime: ["real-time", "real time"],
  deeplearning: ["deep-learning", "deep learning"],
  machinelearning: ["machine-learning", "machine learning"],
  systemdesign: ["system-design", "system design"],
  sqlx: ["sql-x", "sql x"],
  tokio: ["tokio"],
  actix: ["actix-web", "actix web"],

  // Design & Media
  neobrutalism: ["neo-brutalism", "neo brutalism"],
  neobrutalist: ["neo-brutalist", "neo brutalist"],
  framermotion: ["framer-motion", "framer motion"],
  bentogrid: ["bento-grid", "bento grid"],
  autolayout: ["auto-layout", "auto layout"],
  mockup: ["mock-up", "mock up"],
  pitchdeck: ["pitch-deck", "pitch deck"],
  slidebar: ["slide-bar", "slide bar"],

  // Audio & Music
  lofi: ["lo-fi", "lo fi"],
  chillhop: ["chill-hop", "chill hop"],
  synthwave: ["synth-wave", "synth wave"],
  retrowave: ["retro-wave", "retro wave"],
  subzero: ["sub-zero", "sub zero"],
  soundeffects: ["sound-effects", "sound effects", "sound fx", "sfx"],
  sfx: ["sound-effects", "sound effects", "sound fx"],
  vocalchain: ["vocal-chain", "vocal chain"],
  soundtrack: ["sound-track", "sound track"],
  soundscape: ["sound-scape", "sound scape"],

  // Photography & Film
  lightroom: ["light-room", "light room"],
  photoshop: ["photo-shop", "photo shop"],
  colorgrading: ["color-grading", "color grading"],
  filmgrain: ["film-grain", "film grain"],
  goldenhour: ["golden-hour", "golden hour"],
  dlog: ["d-log", "d log"],
  slog: ["s-log", "s log"],
  logc: ["log-c", "log c"],
  davinci: ["da-vinci", "da vinci"],
  mographics: ["mo-graphics", "motion graphics"],

  // Books & Writing
  worldbuilding: ["world-building", "world building"],
  screenplay: ["screen-play", "screen play"],
  scifi: ["sci-fi", "sci fi"],
  grimdark: ["grim-dark", "grim dark"],
  webtoon: ["web-toon", "web toon"],
  speechbubbles: ["speech-bubbles", "speech bubbles"],
  cheatsheet: ["cheat-sheet", "cheat sheet"],
  storyboard: ["story-board", "story board"],
  queryletter: ["query-letter", "query letter"],

  // Business, Productivity & Other
  coldemail: ["cold-email", "cold email"],
  b2b: ["b-to-b", "b to b"],
  clientportal: ["client-portal", "client portal"],
  secondbrain: ["second-brain", "second brain"],
  hybridathlete: ["hybrid-athlete", "hybrid athlete"],
  ecommerce: ["e-commerce", "e commerce"],
  photorealistic: ["photo-realistic", "photo realistic"],
  interviewprep: ["interview-prep", "interview prep"],
};

// Build reverse dictionary mapping every variation back to collapsed key and siblings
const REVERSE_LOOKUP = new Map<string, string[]>();

for (const [collapsed, variations] of Object.entries(COMPOUND_DICTIONARY)) {
  const all = Array.from(new Set([collapsed, ...variations]));
  REVERSE_LOOKUP.set(collapsed, all);
  for (const v of variations) {
    const vNorm = v.toLowerCase().replace(/[-_.\s]+/g, "");
    REVERSE_LOOKUP.set(v.toLowerCase(), all);
    if (!REVERSE_LOOKUP.has(vNorm)) {
      REVERSE_LOOKUP.set(vNorm, all);
    }
  }
}

// Common compound prefixes for dynamic word splitting
const COMMON_PREFIXES = [
  "low", "high", "micro", "macro", "multi", "cross", "super", "sub",
  "ultra", "hyper", "full", "half", "real", "deep", "hard", "soft",
  "fast", "slow", "open", "free", "auto", "self", "post", "pre",
  "anti", "non", "over", "under", "out", "off", "on", "all", "neo",
  "retro", "cyber", "sound", "voice", "film", "game", "cloud", "zero",
  "single", "double", "mini", "mid", "top", "meta", "tech", "data",
  "code", "web", "app", "light", "photo", "screen", "wire"
];

// Common compound suffixes for dynamic word splitting
const COMMON_SUFFIXES = [
  "poly", "stack", "kit", "pack", "box", "set", "hub", "lab", "base",
  "line", "room", "shop", "book", "card", "flow", "craft", "wave",
  "drop", "cast", "track", "print", "shot", "step", "tone", "ware",
  "deck", "board", "builder", "sheet", "engine", "native", "trust",
  "service", "services", "scale", "grade", "level", "mode", "point",
  "space", "time", "art", "dev", "ops", "saas", "tool", "tools",
  "work", "works", "view", "pass", "code", "brain", "bubbles",
  "grading", "grain", "building", "prep", "effects"
];

/**
 * Normalizes a single term by lowercasing and stripping all hyphens, underscores, dots, and whitespace.
 */
export function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().replace(/[-_.\s]+/g, "");
}

/**
 * Generates search variations for a single token word.
 * Treats hyphenated, non-hyphenated, and space-separated forms as exact matches.
 */
export function getSingleWordVariations(word: string): string[] {
  const trimmed = word.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();
  const collapsed = normalizeSearchTerm(lower);
  const resultSet = new Set<string>();

  // Always include the exact word and collapsed form
  resultSet.add(trimmed);
  resultSet.add(lower);
  resultSet.add(collapsed);

  // 1. Check if word contains hyphens, dots, underscores, or spaces
  if (/[-_.\s]/.test(lower)) {
    resultSet.add(lower.replace(/[-_.]+/g, " ")); // spaced
    resultSet.add(lower.replace(/[\s_.]+/g, "-")); // hyphenated
    resultSet.add(lower.replace(/[-\s.]+/g, "_")); // underscored
  }

  // 2. Check dictionary lookup
  const dictMatches = REVERSE_LOOKUP.get(lower) || REVERSE_LOOKUP.get(collapsed);
  if (dictMatches) {
    for (const m of dictMatches) {
      resultSet.add(m);
    }
  }

  // 3. Dynamic Prefix Splitting (e.g., "lowpoly" -> "low-poly", "low poly")
  for (const prefix of COMMON_PREFIXES) {
    if (collapsed.startsWith(prefix) && collapsed.length > prefix.length + 1) {
      const remainder = collapsed.slice(prefix.length);
      resultSet.add(`${prefix}-${remainder}`);
      resultSet.add(`${prefix} ${remainder}`);
    }
  }

  // 4. Dynamic Suffix Splitting (e.g., "starterkit" -> "starter-kit", "starter kit")
  for (const suffix of COMMON_SUFFIXES) {
    if (collapsed.endsWith(suffix) && collapsed.length > suffix.length + 1) {
      const leading = collapsed.slice(0, collapsed.length - suffix.length);
      resultSet.add(`${leading}-${suffix}`);
      resultSet.add(`${leading} ${suffix}`);
    }
  }

  return Array.from(resultSet).filter(Boolean);
}

/**
 * Generates all search variations for a full query string (single or multi-word).
 *
 * For example:
 * - "lowpoly" -> ["lowpoly", "low-poly", "low poly", "low_poly"]
 * - "low-poly" -> ["low-poly", "lowpoly", "low poly", "low_poly"]
 * - "3d lowpoly" -> ["3d lowpoly", "3d low-poly", "3d low poly", ...]
 */
export function getSearchVariations(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const resultSet = new Set<string>();
  resultSet.add(trimmed);

  // Split into tokens by whitespace
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  if (tokens.length === 1) {
    // Single word / token
    const wordVars = getSingleWordVariations(tokens[0]!);
    for (const v of wordVars) {
      resultSet.add(v);
    }
  } else {
    // Multi-word query:
    // Generate variations for each individual token and construct phrase permutations
    const tokenVariations = tokens.map((t) => getSingleWordVariations(t));

    // Limit cartesian product size to avoid explosive combinations
    let phrases = [""];
    for (const vars of tokenVariations) {
      const nextPhrases: string[] = [];
      const topVars = vars.slice(0, 4); // Take top variations per token
      for (const p of phrases) {
        for (const v of topVars) {
          nextPhrases.push(p ? `${p} ${v}` : v);
        }
      }
      phrases = nextPhrases;
    }

    for (const p of phrases) {
      resultSet.add(p);
      resultSet.add(p.replace(/\s+/g, "-"));
      resultSet.add(normalizeSearchTerm(p));
    }
  }

  // Also include the collapsed form of the whole query
  resultSet.add(normalizeSearchTerm(trimmed));

  return Array.from(resultSet).filter((v) => v.length > 0);
}

/**
 * Builds a Prisma `where` clause filter for matching products against a search query
 * with full hyphenated / non-hyphenated / spaced variation support.
 *
 * Checks:
 * - `name` (contains variation, insensitive)
 * - `summary` (contains variation, insensitive)
 * - `slug` (contains variation, insensitive)
 * - `tags` (hasSome with all variation candidates)
 */
export function buildProductSearchFilter(query: string): any {
  const trimmed = query.trim();
  if (!trimmed) return {};

  const variations = getSearchVariations(trimmed);
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  // 1. Direct phrase-level variation conditions
  const phraseConditions: any[] = [];
  const tagCandidates: string[] = [];

  for (const v of variations) {
    const vLower = v.toLowerCase();
    phraseConditions.push({ name: { contains: v, mode: "insensitive" } });
    phraseConditions.push({ summary: { contains: v, mode: "insensitive" } });
    phraseConditions.push({ slug: { contains: v, mode: "insensitive" } });
    tagCandidates.push(vLower);
    tagCandidates.push(normalizeSearchTerm(vLower));
  }

  const uniqueTags = Array.from(new Set(tagCandidates)).filter((t) => t.length > 1);
  if (uniqueTags.length > 0) {
    phraseConditions.push({ tags: { hasSome: uniqueTags } });
  }

  // 2. If multi-token query (e.g. "3d lowpoly"), also add token-level AND matching
  // so products containing "3d" AND ("lowpoly" / "low-poly" / "low poly") match even if separated
  if (tokens.length > 1) {
    const tokenAndClauses = tokens.map((token) => {
      const tokenVars = getSingleWordVariations(token);
      const tokenOrs: any[] = [];
      const tokenTagCandidates: string[] = [];

      for (const tv of tokenVars) {
        tokenOrs.push({ name: { contains: tv, mode: "insensitive" } });
        tokenOrs.push({ summary: { contains: tv, mode: "insensitive" } });
        tokenOrs.push({ slug: { contains: tv, mode: "insensitive" } });
        tokenTagCandidates.push(tv.toLowerCase());
      }

      const uniqueTokenTags = Array.from(new Set(tokenTagCandidates)).filter((t) => t.length > 1);
      if (uniqueTokenTags.length > 0) {
        tokenOrs.push({ tags: { hasSome: uniqueTokenTags } });
      }

      return { OR: tokenOrs };
    });

    return {
      OR: [
        ...phraseConditions,
        { AND: tokenAndClauses },
      ],
    };
  }

  return {
    OR: phraseConditions,
  };
}

/**
 * Expands tokens for AI semantic search vectorization so that hyphenated,
 * non-hyphenated, and component words share vector weights.
 */
export function expandTokensForSemanticSearch(tokens: string[]): string[] {
  const expanded = new Set<string>();

  for (const token of tokens) {
    expanded.add(token);

    // If token has hyphens, add collapsed and component words
    if (token.includes("-")) {
      expanded.add(token.replace(/-/g, ""));
      const parts = token.split("-").filter((p) => p.length > 1);
      for (const p of parts) {
        expanded.add(p);
      }
    } else {
      // If unhyphenated, check if it matches a known compound term
      const variations = getSingleWordVariations(token);
      for (const v of variations) {
        expanded.add(v);
        if (v.includes("-")) {
          const parts = v.split("-").filter((p) => p.length > 1);
          for (const p of parts) {
            expanded.add(p);
          }
        }
      }
    }
  }

  return Array.from(expanded);
}
