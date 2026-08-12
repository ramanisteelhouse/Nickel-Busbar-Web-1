import { query } from "./db.js";
import { emailListSentence, phoneListSentence } from "./src/lib/contact.js";

// Offline keyword-matching chatbot: answers are drawn entirely from products/blog_posts
// already in the database plus a handful of static site facts below. No external API call.

type KBEntry = {
  keywords: Set<string>;
  weight: number;
  answer: string;
};

type StaticIntent = {
  patterns: RegExp[];
  answer: string;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { entries: KBEntry[]; docFreq: Map<string, number>; builtAt: number } | null = null;

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "i", "you", "your", "we", "us", "our", "they", "it", "its", "he", "she",
  "do", "does", "did", "can", "could", "would", "should", "will", "shall",
  "of", "for", "to", "in", "on", "at", "by", "with", "from", "about", "as",
  "and", "or", "but", "if", "so", "than", "then", "that", "this", "these",
  "those", "what", "when", "where", "which", "who", "whom", "how", "why",
  "have", "has", "had", "not", "no", "yes", "just", "also", "please",
  "me", "my", "any", "some", "there", "here", "am", "get", "got", "want",
  "tell", "know", "give", "show", "explain", "find", "looking", "look",
  "need", "help", "provide", "more", "much", "many", "let", "like", "kind",
  "details", "detail", "info", "information", "sort",
]);

// Naive singularizer so "strips"/"busbars" match indexed "strip"/"busbar" without a stemming dependency.
function singularize(token: string): string {
  if (token.length > 4 && token.endsWith("ies")) return token.slice(0, -3) + "y";
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

function tokenize(text: string): string[] {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .map(singularize);
}

// Maps common ways customers phrase needs to the domain terms actually used in our
// product/category names, so e.g. "battery tab" also matches "strip" entries.
const QUERY_SYNONYMS: Record<string, string[]> = {
  tab: ["strip"],
  tabs: ["strip"],
  connector: ["busbar", "strip", "interconnect"],
  connectors: ["busbar", "strip", "interconnect"],
  collector: ["busbar"],
  conductive: ["nickel"],
  flexible: ["busbar"],
  interconnect: ["busbar", "strip"],
  weld: ["strip"],
  welding: ["strip"],
};

function expandWithSynonyms(tokens: string[]): Set<string> {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const synonym of QUERY_SYNONYMS[token] || []) expanded.add(synonym);
  }
  return expanded;
}

async function buildKnowledgeBase(): Promise<KBEntry[]> {
  const entries: KBEntry[] = [];

  const [products, posts] = await Promise.all([
    query<{
      name: string;
      slug: string;
      astm_value: string | null;
      uns_value: string | null;
      dimensions: string | null;
      applications: unknown;
      category_name: string | null;
    }>(
      `SELECT p.name, p.slug, p.astm_value, p.uns_value, p.dimensions, p.applications, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ORDER BY p.id`
    ),
    query<{
      title: string;
      slug: string;
      excerpt: string | null;
      faq_items: unknown;
    }>(
      `SELECT title, slug, excerpt, faq_items
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY id`
    ),
  ]);

  for (const p of products) {
    const applications = Array.isArray(p.applications) ? (p.applications as string[]) : [];
    const searchText = [p.name, p.category_name, p.astm_value, p.uns_value, applications.join(" ")]
      .filter(Boolean)
      .join(" ");
    const answerParts = [
      `${p.name} is part of our ${p.category_name || "nickel strip/busbar"} lineup.`,
      p.astm_value ? `Spec: ${p.astm_value}${p.uns_value ? ` (${p.uns_value})` : ""}.` : null,
      p.dimensions ? `Dimensions: ${p.dimensions}.` : null,
      applications.length ? `Typical applications: ${applications.join(", ")}.` : null,
      `Full details: /product/${encodeURIComponent(p.slug)} — for pricing/MOQ, submit an enquiry at /products?enquiry=1.`,
    ].filter(Boolean);
    entries.push({
      keywords: new Set(tokenize(searchText)),
      weight: 1,
      answer: (answerParts as string[]).join(" "),
    });
  }

  for (const post of posts) {
    const faqs = Array.isArray(post.faq_items)
      ? (post.faq_items as Array<{ question?: string; answer?: string }>)
      : [];
    for (const faq of faqs) {
      if (!faq?.question || !faq?.answer) continue;
      entries.push({
        keywords: new Set(tokenize(`${faq.question} ${post.title}`)),
        weight: 2, // curated FAQ pairs are the most reliable match
        answer: `${faq.answer} (From our guide "${post.title}": /blog/${encodeURIComponent(post.slug)})`,
      });
    }
    if (post.excerpt) {
      entries.push({
        keywords: new Set(tokenize(`${post.title} ${post.excerpt}`)),
        weight: 1,
        answer: `${post.excerpt} Read the full guide: /blog/${encodeURIComponent(post.slug)}`,
      });
    }
  }

  return entries;
}

function buildDocFreq(entries: KBEntry[]): Map<string, number> {
  const docFreq = new Map<string, number>();
  for (const entry of entries) {
    for (const token of entry.keywords) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }
  return docFreq;
}

async function getKnowledgeBase(): Promise<{ entries: KBEntry[]; docFreq: Map<string, number> }> {
  if (cache && Date.now() - cache.builtAt < CACHE_TTL_MS) return cache;
  try {
    const entries = await buildKnowledgeBase();
    cache = { entries, docFreq: buildDocFreq(entries), builtAt: Date.now() };
    return cache;
  } catch (error) {
    console.error("Failed to build chatbot knowledge base", error);
    return cache ?? { entries: [], docFreq: new Map() };
  }
}

const CONTACT_LINE =
  `You can reach our team directly at ${emailListSentence()}, call/WhatsApp ${phoneListSentence()}, ` +
  "or submit a product enquiry at /products?enquiry=1.";

const STATIC_INTENTS: StaticIntent[] = [
  {
    patterns: [/\b(hi|hello|hey|good\s?(morning|afternoon|evening))\b/],
    answer:
      "Hi! I'm the NickelBusbar.com assistant. Ask me about our nickel strips, nickel/copper busbars, or battery interconnect products — thickness, grade, applications, and more. What are you looking for?",
  },
  {
    patterns: [/\b(price|pricing|cost|quote|quotation|moq|bulk\s?rate|stock|delivery\s?time)\b/],
    answer:
      `We don't post live pricing here, but our sales team can quote quickly. Share the product, thickness/size, quantity, application, and delivery location via /products?enquiry=1, and they'll follow up. ${CONTACT_LINE}`,
  },
  {
    patterns: [/\b(contact|phone\s?number|email\s?address|whatsapp|call\s?you|reach\s?you|talk\s?to\s?(a\s?)?human|sales\s?team)\b/],
    answer: `Here's how to reach our team directly: ${CONTACT_LINE}`,
  },
  {
    patterns: [/\b(calculator|ampacity|current\s?carrying|current\s?capacity|resistiv|joule\s?heat)\b/],
    answer:
      "For sizing nickel strip or busbar to your current and thermal requirements, try our interconnect sizing calculator at /calculator.",
  },
  {
    patterns: [/\b(who\s?are\s?you|about\s?(you|the\s?company|ramani)|company\s?info|history|since\s?when|established)\b/],
    answer:
      "Ramani Steel House (nickelbusbar.com) is a 100% family-owned Indian manufacturer, established in 1974, of nickel strips, nickel/copper/aluminium busbars, and battery interconnection products for lithium-ion cells and packs. We export across India and internationally. Browse the full catalog at /products.",
  },
  {
    patterns: [/\b(thank|thanks|thank\s?you)\b/],
    answer: "You're welcome! Anything else I can help you find on the site?",
  },
  {
    patterns: [/^\s*(bye|goodbye|see\s?ya)\s*$/],
    answer: `Thanks for stopping by! ${CONTACT_LINE}`,
  },
];

const FALLBACK_ANSWER =
  `I don't have specific information on that from our site content. Browse the full catalog at /products, or ${CONTACT_LINE}`;

// In this catalog "nickel" and "strip" appear in nearly every entry, so raw IDF score is a
// weak relevance signal on its own. Coverage (fraction of the query's own words found in an
// entry) is the more reliable one — a 100% hit means every word the customer typed is
// present, however common those words are here. So: coverage below MIN_COVERAGE excludes an
// entry from ranking entirely (guards against a generic partial overlap outranking a more
// complete one); among survivors, full coverage is accepted outright, otherwise we still
// require a minimum IDF score so a barely-there partial match doesn't win by default.
const MIN_COVERAGE = 0.5;
const MIN_SCORE_PARTIAL = 0.21;

export async function answerFromKnowledgeBase(message: string): Promise<string> {
  const lower = String(message || "").toLowerCase();

  for (const intent of STATIC_INTENTS) {
    if (intent.patterns.some((pattern) => pattern.test(lower))) {
      return intent.answer;
    }
  }

  const queryTokens = tokenize(message);
  if (queryTokens.length === 0) return FALLBACK_ANSWER;

  const { entries, docFreq } = await getKnowledgeBase();
  const distinctQueryTokens = expandWithSynonyms(queryTokens);
  const scored = entries
    .map((entry) => {
      let overlap = 0;
      const matchedTokens: string[] = [];
      for (const token of distinctQueryTokens) {
        if (entry.keywords.has(token)) {
          overlap += 1 / (docFreq.get(token) || 1);
          matchedTokens.push(`${token}(df${docFreq.get(token)})`);
        }
      }
      const coverage = matchedTokens.length / distinctQueryTokens.size;
      return { entry, score: overlap * entry.weight, coverage, matchedTokens };
    })
    .filter((s) => s.coverage >= MIN_COVERAGE);

  if (process.env.CHATBOT_DEBUG) {
    const top = [...scored].sort((a, b) => b.score - a.score).slice(0, 5);
    console.debug("chatbot scores", top.map((s) => ({ score: s.score.toFixed(3), coverage: s.coverage.toFixed(2), matched: s.matchedTokens, answer: s.entry.answer.slice(0, 60) })));
  }

  const best = scored.reduce((max, cur) => (cur.score > max.score ? cur : max), { entry: null as KBEntry | null, score: 0, coverage: 0 });

  if (best.entry && (best.coverage >= 0.999 || best.score >= MIN_SCORE_PARTIAL)) return best.entry.answer;
  return FALLBACK_ANSWER;
}
