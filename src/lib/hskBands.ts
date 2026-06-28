import type { Level } from "./types";

/**
 * HSK band data (old HSK 1-6 scale — still the most widely used). Each band
 * carries the concrete targets a plan should hit at that level: cumulative
 * vocabulary, rough character count, the grammar centre of gravity, a can-do
 * statement, and an exam note. These are sub-blocks selected by the learner's
 * CEFR current_level, mirroring how CEFR variants are layered elsewhere.
 */
export interface HskBand {
  hsk: number; // old-HSK band 1-6
  newHsk: string; // closest new HSK 3.0 band(s)
  cumulativeVocab: number; // approx. words known by the END of this band
  characterTarget: string; // rough hanzi recognition target
  focus: string; // grammar / skill centre of gravity
  canDo: string; // CEFR-style can-do statement
  examNote: string; // what an HSK test at this band looks like
}

// CEFR current_level → target HSK band the plan should drive the learner toward.
const LEVEL_TO_HSK: Record<Level, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

const HSK_BANDS: Record<number, HskBand> = {
  1: {
    hsk: 1,
    newHsk: "HSK 1",
    cumulativeVocab: 150,
    characterTarget: "~150 characters recognised",
    focus:
      "pinyin + tones, basic word order (S-V-O), 是/有, simple questions (吗/什么/谁), numbers, dates, basic measure words (个)",
    canDo: "introduce yourself, greet, ask and answer simple personal questions, handle numbers and time",
    examNote: "HSK 1 is pinyin-supported listening + reading; no writing of characters required",
  },
  2: {
    hsk: 2,
    newHsk: "HSK 2",
    cumulativeVocab: 300,
    characterTarget: "~300 characters",
    focus:
      "了 (completed action), 在 (location/progressive), comparatives (比), more measure words, directional/time expressions, basic resultative hints",
    canDo: "handle simple everyday exchanges — shopping, ordering food, daily routines, simple past events",
    examNote: "HSK 2 still pinyin-supported; broader everyday topics, short dialogues",
  },
  3: {
    hsk: 3,
    newHsk: "HSK 3",
    cumulativeVocab: 600,
    characterTarget: "~600 characters",
    focus:
      "把 sentences, 被 (passive), complements (resultative/directional/potential), 的/得/地 distinction, 着 (durative), connectors (因为…所以, 虽然…但是)",
    canDo: "manage most situations while travelling, describe experiences, give simple opinions and reasons",
    examNote: "HSK 3 drops pinyin support — character recognition becomes essential; first true intermediate gate",
  },
  4: {
    hsk: 4,
    newHsk: "HSK 4",
    cumulativeVocab: 1200,
    characterTarget: "~1200 characters",
    focus:
      "richer connectors and discourse markers, 不但…而且, 既然, idioms in context, abstract topics, nuanced 了/过/着 contrasts, longer compound sentences",
    canDo: "discuss a fairly wide range of topics, express and defend opinions, follow standard-speed speech on familiar matters",
    examNote: "HSK 4 expects fluent reading of unvowelled text and paragraph-length writing",
  },
  5: {
    hsk: 5,
    newHsk: "HSK 5",
    cumulativeVocab: 2500,
    characterTarget: "~1700+ characters",
    focus:
      "formal/written register, chengyu (成语), newspaper and essay structures, advanced complements, rhetorical and discourse cohesion, register-switching",
    canDo: "read newspapers and magazines, watch films, give a full talk, write structured opinion pieces",
    examNote: "HSK 5 involves authentic-style texts, inference, and longer composition",
  },
  6: {
    hsk: 6,
    newHsk: "HSK 6 (≈ new HSK 7-9 for true mastery)",
    cumulativeVocab: 5000,
    characterTarget: "~2600+ characters",
    focus:
      "near-native nuance, extensive chengyu and literary/idiomatic usage, subtle register and tone, academic and professional genres, classical residue in modern Chinese",
    canDo: "understand virtually everything heard or read, express finely with idiomatic precision across registers",
    examNote: "HSK 6 (and new HSK 7-9) targets near-native comprehension, summarising, and sophisticated writing",
  },
};

/** Resolve the target HSK band for a learner's CEFR level. */
export function getHskBand(level: Level): HskBand {
  return HSK_BANDS[LEVEL_TO_HSK[level]];
}

/**
 * A level-specific HSK sub-block. Gives the model the concrete vocabulary,
 * character, grammar, and exam targets to pace this learner's plan against —
 * plus a one-line note on the band just below, so early weeks can ramp from it.
 */
export function describeHskBand(level: Level): string {
  const band = getHskBand(level);
  const prev = band.hsk > 1 ? HSK_BANDS[band.hsk - 1] : null;
  const rampFrom = prev
    ? `\n- Ramp UP from roughly HSK ${prev.hsk} (~${prev.cumulativeVocab} words): the first weeks should consolidate that base before pushing into new HSK ${band.hsk} material.`
    : `\n- This is the entry band: assume no prior characters; the first weeks build pinyin, tones, and the very first high-frequency words.`;
  return `\n\nTARGET HSK BAND — HSK ${band.hsk} (${band.newHsk}), mapped from CEFR ${level}:
- Vocabulary target by plan's end: ~${band.cumulativeVocab} words cumulative (${band.characterTarget}).
- Grammar / skill centre of gravity: ${band.focus}.
- Can-do goal: ${band.canDo}.
- Exam shape: ${band.examNote}.${rampFrom}
- Pace new vocabulary and characters so the plan plausibly reaches this band; if the goal is exam-oriented, add HSK ${band.hsk}-aligned practice and a periodic Assessment.`;
}
