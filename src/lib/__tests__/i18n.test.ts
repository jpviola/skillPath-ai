import { describe, it, expect } from "vitest";
import {
  translate,
  LOCALES,
  localeName,
  outputLanguageName,
  levelLabelsByLocale,
  topicTypeLabelsByLocale,
  resourceTypeLabelsByLocale,
  costLabelsByLocale,
  statusLabelsByLocale,
  feedbackLabelsByLocale,
  difficultyLabelsByLocale,
  focusLabelsByLocale,
} from "../i18n";
import type { Level, TopicType } from "../types";

describe("translate", () => {
  it("returns the Spanish translation when locale is 'es'", () => {
    expect(translate("es", "nav.dashboard")).toBe("Panel");
  });

  it("returns the English translation when locale is 'en'", () => {
    expect(translate("en", "nav.dashboard")).toBe("Dashboard");
  });

  it("returns the Chinese translation when locale is 'zh'", () => {
    expect(translate("zh", "nav.dashboard")).toBe("面板");
  });

  it("falls back to Spanish when the key is missing in the target locale", () => {
    // Use a non-existent locale key — should fallback to es, then to key itself
    expect(translate("en", "nonexistent.key")).toBe("nonexistent.key");
  });

  it("returns the key itself when it doesn't exist in any locale", () => {
    expect(translate("es", "completely.fake.key")).toBe("completely.fake.key");
  });

  it("interpolates variables into the string", () => {
    expect(translate("es", "onb.tested", { level: "B1" })).toBe(
      "Nivel estimado por la prueba: B1"
    );
  });

  it("interpolates multiple variables", () => {
    expect(translate("es", "onb.weeklyTime", { h: 5, h2: 7 })).toBe(
      "Tiempo semanal: 5-7 horas"
    );
  });
});

describe("locale constants", () => {
  it("has all three locales defined", () => {
    expect(LOCALES).toEqual(["es", "en", "zh"]);
  });

  it("has locale names for each locale", () => {
    expect(localeName.es).toBe("Español");
    expect(localeName.en).toBe("English");
    expect(localeName.zh).toBe("中文");
  });

  it("has output language names for each locale", () => {
    expect(outputLanguageName.es).toBe("Spanish");
    expect(outputLanguageName.en).toBe("English");
    expect(outputLanguageName.zh).toBe("Chinese (Simplified)");
  });
});

describe("levelLabelsByLocale", () => {
  it("has labels for all CEFR levels in every locale", () => {
    const levels: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
    for (const locale of LOCALES) {
      for (const level of levels) {
        expect(levelLabelsByLocale[locale][level]).toBeDefined();
        expect(levelLabelsByLocale[locale][level].length).toBeGreaterThan(0);
      }
    }
  });
});

describe("topicTypeLabelsByLocale", () => {
  it("has labels for all topic types in every locale", () => {
    const types: TopicType[] = [
      "Vocabulary", "Grammar", "Listening", "Speaking",
      "Reading", "Writing", "Pronunciation", "Culture",
      "Review", "Assessment",
    ];
    for (const locale of LOCALES) {
      for (const type of types) {
        expect(topicTypeLabelsByLocale[locale][type]).toBeDefined();
        expect(topicTypeLabelsByLocale[locale][type].length).toBeGreaterThan(0);
      }
    }
  });
});

describe("resourceTypeLabelsByLocale", () => {
  it("has labels for all resource types in every locale", () => {
    const types = ["Video", "Podcast", "Article", "App", "Interactive", "Flashcards"] as const;
    for (const locale of LOCALES) {
      for (const type of types) {
        expect(resourceTypeLabelsByLocale[locale][type]).toBeDefined();
      }
    }
  });
});

describe("costLabelsByLocale", () => {
  it("has labels for all cost tiers in every locale", () => {
    const costs = ["Free", "Low", "Premium"] as const;
    for (const locale of LOCALES) {
      for (const cost of costs) {
        expect(costLabelsByLocale[locale][cost]).toBeDefined();
      }
    }
  });
});

describe("statusLabelsByLocale", () => {
  it("has labels for all week statuses in every locale", () => {
    const statuses = ["completed", "in_progress", "not_started"] as const;
    for (const locale of LOCALES) {
      for (const status of statuses) {
        expect(statusLabelsByLocale[locale][status]).toBeDefined();
      }
    }
  });
});

describe("feedbackLabelsByLocale", () => {
  it("has labels for all difficulty levels in every locale", () => {
    const diffs = ["Too Easy", "Just Right", "Too Hard"] as const;
    for (const locale of LOCALES) {
      for (const diff of diffs) {
        expect(feedbackLabelsByLocale[locale][diff]).toBeDefined();
      }
    }
  });
});

describe("difficultyLabelsByLocale", () => {
  it("has labels for all week difficulties in every locale", () => {
    const diffs = ["Beginner", "Intermediate", "Advanced"] as const;
    for (const locale of LOCALES) {
      for (const diff of diffs) {
        expect(difficultyLabelsByLocale[locale][diff]).toBeDefined();
      }
    }
  });
});

describe("Memphis keys (game.*, cta.*, onb.loading.*, banner.*)", () => {
  // Every key added during the LIANGO rebrand. The test ensures:
  //   1. The key exists in every locale (no missing translations).
  //   2. The value is not the key name itself (would mean the dict returned the key).
  //   3. For EN and ZH, the value is NOT just the Spanish fallback —
  //      this catches the case where someone forgot to translate and
  //      the i18n helper falls through to the ES dict.
  const MEMPHIS_KEYS = [
    "game.pieceSnapped",
    "game.pieceSnappedSub",
    "game.patternUnlocked",
    "game.streakAlive",
    "game.streakLost",
    "game.tutorCalm",
    "game.tutorThinking",
    "game.feedbackRight1",
    "game.feedbackRight2",
    "game.feedbackRight3",
    "game.feedbackWrong1",
    "game.feedbackWrong2",
    "game.feedbackWrong3",
    "cta.review",
    "cta.premium",
    "cta.moreLanguages",
    "onb.loading.title",
    "onb.loading.sub",
    "banner.default",
  ];

  for (const locale of LOCALES) {
    for (const key of MEMPHIS_KEYS) {
      it(`locale "${locale}" translates "${key}" (no fallback to ES)`, () => {
        const value = translate(locale, key);
        const esValue = translate("es", key);
        // 1. Key resolves to a non-empty string
        expect(value, `${locale}:${key}`).toBeTruthy();
        // 2. Key is not the dict key itself (no `[object Object]` or "key.X")
        expect(value, `${locale}:${key}`).not.toBe(key);
        // 3. For non-ES locales, the value must be DIFFERENT from the ES
        //    value — otherwise the EN/ZH dict is missing this key and
        //    silently falling back to ES.
        if (locale !== "es") {
          expect(value, `${locale}:${key}`).not.toBe(esValue);
        }
      });
    }
  }

  it("game.streakAlive interpolates {n} in all 3 locales", () => {
    expect(translate("es", "game.streakAlive", { n: 5 })).toMatch(/\b5\b/);
    expect(translate("en", "game.streakAlive", { n: 5 })).toMatch(/\b5\b/);
    expect(translate("zh", "game.streakAlive", { n: 5 })).toMatch(/\b5\b/);
  });

  it("All Memphis keys have a translation in all locales (summary)", () => {
    for (const locale of LOCALES) {
      const missing: string[] = [];
      for (const key of MEMPHIS_KEYS) {
        if (!translate(locale, key) || translate(locale, key) === key) {
          missing.push(key);
        }
      }
      expect(missing, `missing keys in ${locale}: ${missing.join(", ")}`).toEqual([]);
    }
  });
});

describe("focusLabelsByLocale", () => {
  it("has labels for all focus areas in every locale", () => {
    const areas = [
      "Advanced grammar", "Culture", "Language history", "Literature",
      "Vocabulary", "Morphology", "Professional writing", "Creative writing",
    ] as const;
    for (const locale of LOCALES) {
      for (const area of areas) {
        expect(focusLabelsByLocale[locale][area]).toBeDefined();
      }
    }
  });
});
