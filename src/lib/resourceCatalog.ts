import type { Resource, ResourceType, Cost } from "./types";
import type { LanguageFamily } from "./languageProfiles";
import { isChineseSkill } from "./languageProfiles";

export interface CatalogEntry {
  skill: string;
  family: LanguageFamily;
  resources: Resource[];
}

function resource(title: string, url: string, type: ResourceType, cost: Cost, preferred = false): Resource {
  return { title, url, type, cost, preferred };
}

const commonLiving = [
  resource("Language Transfer", "https://www.languagetransfer.org/", "Podcast", "Free", true),
  resource("Forvo", "https://forvo.com/", "Interactive", "Free", true),
  resource("Anki", "https://apps.ankiweb.net/", "App", "Free", true),
  resource("Wiktionary", "https://www.wiktionary.org/", "Article", "Free", false),
];

// Shared across classical languages. Kept language-neutral — language-specific
// libraries (e.g. The Latin Library) live in their own entry, not here, so they
// don't leak into the wrong language.
const commonClassical = [
  resource("Perseus Digital Library", "https://www.perseus.tufts.edu/", "Interactive", "Free", true),
  resource("Wiktionary", "https://www.wiktionary.org/", "Article", "Free", true),
  resource("Anki", "https://apps.ankiweb.net/", "App", "Free", true),
];

// User-curated Ancient Greek material (URLs, YouTube channels, PDFs supplied by
// the team). Each item is verified before being added here. Grows over time.
const userGreekResources = [
  resource(
    "Introducción al griego clásico (serie en español)",
    "https://www.youtube.com/watch?v=Wkt2izRqOTI",
    "Video",
    "Free",
    true
  ),
];

const CATALOG: CatalogEntry[] = [
  {
    skill: "Spanish",
    family: "living",
    resources: [
      ...commonLiving,
      resource("Dreaming Spanish", "https://www.dreamingspanish.com/", "Video", "Free", true),
      resource("Coffee Break Spanish", "https://coffeebreaklanguages.com/coffeebreakspanish/", "Podcast", "Free", true),
      resource("Easy Spanish", "https://www.easyspanish.org/", "Video", "Free", true),
      resource("SpanishDict", "https://www.spanishdict.com/", "Article", "Free", false),
    ],
  },
  {
    skill: "English",
    family: "living",
    resources: [
      ...commonLiving,
      resource("BBC Learning English", "https://www.bbc.co.uk/learningenglish/", "Video", "Free", true),
      resource("VOA Learning English", "https://learningenglish.voanews.com/", "Video", "Free", true),
      resource("Breaking News English", "https://breakingnewsenglish.com/", "Article", "Free", true),
      resource("Rachel's English", "https://rachelsenglish.com/", "Video", "Free", false),
    ],
  },
  {
    skill: "French",
    family: "living",
    resources: [
      ...commonLiving,
      resource("Coffee Break French", "https://coffeebreaklanguages.com/coffeebreakfrench/", "Podcast", "Free", true),
      resource("InnerFrench", "https://innerfrench.com/", "Podcast", "Free", true),
      resource("TV5MONDE", "https://apprendre.tv5monde.com/", "Interactive", "Free", true),
      resource("Lawless French", "https://www.lawlessfrench.com/", "Article", "Free", false),
    ],
  },
  {
    skill: "Italian",
    family: "living",
    resources: [
      ...commonLiving,
      resource("Coffee Break Italian", "https://coffeebreaklanguages.com/coffeebreakitalian/", "Podcast", "Free", true),
      resource("Easy Italian", "https://www.easyitalian.org/", "Video", "Free", true),
      resource("Italia 1TV / RaiPlay", "https://www.raiplay.it/", "Video", "Free", false),
      resource("One World Italiano", "https://oneworlditaliano.com/", "Article", "Free", false),
    ],
  },
  {
    skill: "German",
    family: "living",
    resources: [
      ...commonLiving,
      resource("DW Learn German", "https://learngerman.dw.com/", "Interactive", "Free", true),
      resource("Easy German", "https://www.easygerman.org/", "Video", "Free", true),
      resource("Deutsch perfekt", "https://www.deutsch-perfekt.com/", "Article", "Low", false),
      resource("Nicos Weg", "https://learngerman.dw.com/en/learn-german/s-9528", "Video", "Free", true),
    ],
  },
  {
    skill: "Portuguese",
    family: "living",
    resources: [
      ...commonLiving,
      resource("Practice Portuguese", "https://www.practiceportuguese.com/", "Podcast", "Low", true),
      resource("Tá Falado", "https://coerll.utexas.edu/brazilpod/tafalado/", "Podcast", "Free", true),
      resource("Portuguese With Carla", "https://www.portuguesewithcarla.com/", "Video", "Free", false),
      resource("Ciberduvidas", "https://ciberduvidas.iscte-iul.pt/", "Article", "Free", false),
    ],
  },
  {
    skill: "Ancient Greek",
    family: "classical",
    resources: [
      ...userGreekResources,
      ...commonClassical,
      resource("The Greek Learner's Dictionary", "https://lsj.gr/", "Article", "Free", true),
      resource("Cambridge Greek Lexicon", "https://www.cambridge.org/core/books/cambridge-greek-lexicon/71E2F1F5D42D6F42E3B7A8C6A0A8F2B9", "Article", "Premium", false),
      resource("Greek Grammar Tutorials", "https://greekgrammar.github.io/", "Interactive", "Free", true),
    ],
  },
  {
    skill: "Latin",
    family: "classical",
    resources: [
      ...commonClassical,
      resource("Latin Library", "https://www.thelatinlibrary.com/", "Article", "Free", true),
      resource("Dickinson College Commentaries", "https://dcc.dickinson.edu/", "Article", "Free", true),
      resource("Whitaker's Words", "https://archives.nd.edu/words.html", "Interactive", "Free", true),
    ],
  },
];

// Mandarin-specific catalog: tone/pinyin drills, hanzi/stroke tools, graded
// input, and a grammar reference. Used whenever isChineseSkill(skill) is true,
// regardless of how the learner spelled the language.
const chineseResources: Resource[] = [
  resource("Pleco (dictionary + flashcards)", "https://www.pleco.com/", "App", "Free", true),
  resource("Hello Chinese", "https://www.hellochinese.cc/", "App", "Free", true),
  resource("Du Chinese (graded reader)", "https://www.duchinese.net/", "App", "Low", true),
  resource("Chinese Grammar Wiki", "https://resources.allsetlearning.com/chinese/grammar/", "Article", "Free", true),
  resource("Pinyin chart with audio", "https://www.yoyochinese.com/chinese-learning-tools/Mandarin-Chinese-pronunciation-lesson/pinyin-chart-table", "Interactive", "Free", true),
  resource("Outlier / Hanzi via radicals", "https://www.outlier-linguistics.com/", "Article", "Low", false),
  resource("HanziGrids (stroke-order practice sheets)", "https://www.hanzigrids.com/", "Interactive", "Free", true),
  resource("Comprehensible Chinese (YouTube)", "https://www.youtube.com/@ComprehensibleChinese", "Video", "Free", true),
  resource("ChinesePod", "https://www.chinesepod.com/", "Podcast", "Low", false),
  resource("Anki (with stroke-order + audio decks)", "https://apps.ankiweb.net/", "App", "Free", true),
  resource("Forvo", "https://forvo.com/", "Interactive", "Free", false),
];

function genericFallback(skill: string): Resource[] {
  return [
    resource(`${skill} Wikipedia`, "https://www.wikipedia.org/", "Article", "Free", true),
    resource("Anki", "https://apps.ankiweb.net/", "App", "Free", true),
    resource("Forvo", "https://forvo.com/", "Interactive", "Free", false),
  ];
}

export function getResourceCatalog(skill: string, family: LanguageFamily): Resource[] {
  if (isChineseSkill(skill)) return chineseResources;
  const entry = CATALOG.find((item) => item.skill === skill && item.family === family);
  return entry ? entry.resources : genericFallback(skill);
}

export function describeResourceCatalog(skill: string, family: LanguageFamily): string {
  const resources = getResourceCatalog(skill, family);
  const titles = resources
    .map((r) => `${r.title} (${r.type}, ${r.cost}${r.preferred ? ", preferred" : ""})`)
    .join("; ");
  return `Curated resources: ${titles}`;
}
