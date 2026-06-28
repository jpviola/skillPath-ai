import { describe, it, expect } from "vitest";
import { validatePlanQuality } from "../planValidator";
import type { Plan, UserProfile } from "../types";

function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    plan_id: "test",
    skill: "Spanish",
    total_weeks: 8,
    weekly_time_hours: 5,
    estimated_total_cost: "$0",
    adaptation_note: "",
    weeks: Array.from({ length: 8 }, (_, i) => ({
      week_number: i + 1,
      title: `Week ${i + 1}`,
      objective: "Learn",
      total_time_minutes: 300,
      difficulty: "Beginner" as const,
      milestone: "Milestone",
      topics: [
        {
          name: "Topic 1",
          type: "Listening" as const,
          estimated_minutes: 100,
          resources: [
            {
              title: "Resource",
              url: "https://example.com",
              type: "Video" as const,
              cost: "Free" as const,
              preferred: true,
            },
          ],
        },
        {
          name: "Topic 2",
          type: "Reading" as const,
          estimated_minutes: 100,
          resources: [
            {
              title: "Resource 2",
              url: "https://example.com",
              type: "Article" as const,
              cost: "Free" as const,
              preferred: false,
            },
          ],
        },
        {
          name: "Topic 3",
          type: "Grammar" as const,
          estimated_minutes: 100,
          resources: [
            {
              title: "Resource 3",
              url: "https://example.com",
              type: "Article" as const,
              cost: "Free" as const,
              preferred: false,
            },
          ],
        },
      ],
    })),
    ...overrides,
  };
}

const livingProfile: UserProfile = {
  skill: "Spanish",
  current_level: "A1",
  goal: "Talk",
  time_available: "5-7 hours/week",
  learning_style: ["Conversation", "Listening"],
  resource_preference: "Free + Low cost",
};

const classicalProfile: UserProfile = {
  skill: "Latin",
  current_level: "A1",
  goal: "Read texts",
  time_available: "5-7 hours/week",
  learning_style: ["Reading", "Apps & games"],
  resource_preference: "Free only",
};

describe("validatePlanQuality", () => {
  it("accepts a balanced living-language plan", () => {
    const result = validatePlanQuality(makePlan(), livingProfile);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects plans with missing topics or resources", () => {
    const broken = makePlan({
      weeks: [
        {
          week_number: 1,
          title: "Broken",
          objective: "Broken",
          total_time_minutes: 60,
          difficulty: "Beginner",
          milestone: "M",
          topics: [
            {
              name: "No resources",
              type: "Grammar",
              estimated_minutes: 60,
              resources: [],
            },
          ],
        },
      ],
    });

    const result = validatePlanQuality(broken, livingProfile);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.severity === "error")).toBe(true);
  });

  it("warns when a classical-language plan leans too much into speaking/listening", () => {
    const noisy = makePlan({
      skill: "Latin",
      weeks: Array.from({ length: 8 }, (_, i) => ({
        week_number: i + 1,
        title: `Week ${i + 1}`,
        objective: "Learn",
        total_time_minutes: 300,
        difficulty: "Beginner" as const,
        milestone: "M",
        topics: [
          {
            name: "Speak",
            type: "Speaking" as const,
            estimated_minutes: 100,
            resources: [
              {
                title: "Resource",
                url: "https://example.com",
                type: "Video" as const,
                cost: "Free" as const,
                preferred: true,
              },
            ],
          },
          {
            name: "Listen",
            type: "Listening" as const,
            estimated_minutes: 100,
            resources: [
              {
                title: "Resource 2",
                url: "https://example.com",
                type: "Video" as const,
                cost: "Free" as const,
                preferred: false,
              },
            ],
          },
          {
            name: "Read",
            type: "Reading" as const,
            estimated_minutes: 100,
            resources: [
              {
                title: "Resource 3",
                url: "https://example.com",
                type: "Article" as const,
                cost: "Free" as const,
                preferred: false,
              },
            ],
          },
        ],
      })),
    });

    const result = validatePlanQuality(noisy, classicalProfile);
    expect(result.issues.some((issue) => issue.severity === "warning")).toBe(true);
  });
});
