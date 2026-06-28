import type { LearnTrack } from "./types";

export type LanguageFamily = "living" | "classical" | "advanced_writing";

export interface LanguageProfile {
  family: LanguageFamily;
  priorities: string[];
  avoid: string[];
  resourceHints: string[];
  defaultTopicMix: string;
}

const livingProfile: LanguageProfile = {
  family: "living",
  priorities: [
    "listening and speaking for real communication",
    "high-frequency vocabulary in context",
    "short, reusable dialogues and comprehensible input",
  ],
  avoid: [
    "isolated grammar lectures without usage",
    "overloading the learner with rare forms too early",
  ],
  resourceHints: [
    "graded podcasts",
    "conversation-first courses",
    "news in slow language",
    "flashcards for spaced repetition",
  ],
  defaultTopicMix: "Listening, Speaking, Reading, Vocabulary, Grammar, Review",
};

const classicalProfile: LanguageProfile = {
  family: "classical",
  priorities: [
    "reading primary texts as early as possible",
    "morphology and sentence parsing",
    "translation and close reading",
  ],
  avoid: [
    "conversation-first framing",
    "beginner app stereotypes built for living languages",
  ],
  resourceHints: [
    "parallel texts",
    "corpora and digital libraries",
    "morphology tools",
    "commentaries and grammar references",
  ],
  defaultTopicMix: "Reading, Writing, Grammar, Vocabulary, Review, Assessment",
};

// Mandarin Chinese: a living language, but logographic + tonal, so it gets its
// own profile rather than the generic living one. Script and tones are the
// gating skills, not conversation alone.
const chineseProfile: LanguageProfile = {
  family: "living",
  priorities: [
    "pinyin and the four tones (+ neutral) before anything else",
    "listening and speaking for real communication",
    "hanzi by frequency, taught via radicals and stroke order",
    "high-frequency vocabulary and sentence patterns in context",
  ],
  avoid: [
    "introducing characters before pinyin and tones are stable",
    "romanization-only courses that never build hanzi recognition",
    "isolated grammar lectures without usage",
  ],
  resourceHints: [
    "tone-drill and pinyin tools",
    "graded readers and comprehensible-input video",
    "spaced-repetition decks with stroke order and audio",
    "a pop-up dictionary (Pleco) and a grammar wiki",
  ],
  defaultTopicMix: "Pronunciation, Listening, Speaking, Reading, Vocabulary, Grammar, Review",
};

const advancedWritingProfile: LanguageProfile = {
  family: "advanced_writing",
  priorities: [
    "precision, style and register",
    "analytical and creative writing deliverables",
    "grammar as editing and refinement",
  ],
  avoid: [
    "beginner acquisition framing",
    "speaking/listening as the center of gravity",
  ],
  resourceHints: [
    "style manuals",
    "usage dictionaries",
    "literary anthologies",
    "corpora",
  ],
  defaultTopicMix: "Writing, Reading, Grammar, Vocabulary, Culture, Review",
};

const LANGUAGE_PROFILES: Record<string, LanguageProfile> = {
  Spanish: livingProfile,
  English: livingProfile,
  French: livingProfile,
  Italian: livingProfile,
  German: livingProfile,
  Portuguese: livingProfile,
  "Ancient Greek": classicalProfile,
  Latin: classicalProfile,
};

/** True when the target language is Mandarin Chinese, however the user spelled it. */
export function isChineseSkill(skill: string): boolean {
  const s = skill.trim().toLowerCase();
  if (/[一-鿿]/.test(s)) {
    // 中文 / 汉语 / 漢語 / 普通话 / 國語 / 华语 …
    return /中文|汉语|漢語|普通话|普通話|國語|国语|华语|華語|官话/.test(skill);
  }
  return (
    s.includes("chinese") ||
    s.includes("mandarin") ||
    s === "putonghua" ||
    s === "zhongwen"
  );
}

export function getLanguageProfile(skill: string, track?: LearnTrack): LanguageProfile {
  if (track === "native_mastery") return advancedWritingProfile;
  if (isChineseSkill(skill)) return chineseProfile;
  return LANGUAGE_PROFILES[skill.trim()] ?? livingProfile;
}

export function describeLanguageProfile(skill: string, track?: LearnTrack): string {
  const profile = getLanguageProfile(skill, track);
  return [
    `Family: ${profile.family}`,
    `Priorities: ${profile.priorities.join("; ")}`,
    `Avoid: ${profile.avoid.join("; ")}`,
    `Resource hints: ${profile.resourceHints.join("; ")}`,
    `Default topic mix: ${profile.defaultTopicMix}`,
  ].join("\n");
}
