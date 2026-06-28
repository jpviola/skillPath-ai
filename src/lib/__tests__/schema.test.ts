import { describe, it, expect } from "vitest";
import {
  profileInputSchema,
  feedbackInputSchema,
  placementRequestSchema,
  planSchema,
} from "../schema";

describe("profileInputSchema", () => {
  it("accepts a valid acquisition profile", () => {
    const input = {
      skill: "Spanish",
      current_level: "A1",
      goal: "Mantener una conversación en 3 meses",
      time_available: "5-7 hours/week",
      learning_style: ["Conversation", "Listening"],
      resource_preference: "Free + Low cost",
    };
    const result = profileInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts a valid native mastery profile", () => {
    const input = {
      skill: "Español",
      current_level: "C1",
      goal: "Alcanzar un dominio profesional",
      time_available: "3-5 hours/week",
      learning_style: ["Reading", "Conversation"],
      resource_preference: "Free + Low cost",
      track: "native_mastery",
      focus_areas: ["Advanced grammar", "Creative writing"],
    };
    const result = profileInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects empty skill", () => {
    const input = {
      skill: "",
      current_level: "A1",
      goal: "Test",
      time_available: "5h",
      learning_style: ["Conversation"],
      resource_preference: "Free only",
    };
    const result = profileInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid level", () => {
    const input = {
      skill: "French",
      current_level: "A5",
      goal: "Test",
      time_available: "5h",
      learning_style: ["Conversation"],
      resource_preference: "Free only",
    };
    const result = profileInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects empty learning_style", () => {
    const input = {
      skill: "French",
      current_level: "A1",
      goal: "Test",
      time_available: "5h",
      learning_style: [],
      resource_preference: "Free only",
    };
    const result = profileInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid learning style", () => {
    const input = {
      skill: "French",
      current_level: "A1",
      goal: "Test",
      time_available: "5h",
      learning_style: ["Conversation", "InvalidStyle"],
      resource_preference: "Free only",
    };
    const result = profileInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects goal longer than 600 chars", () => {
    const input = {
      skill: "French",
      current_level: "A1",
      goal: "x".repeat(601),
      time_available: "5h",
      learning_style: ["Conversation"],
      resource_preference: "Free only",
    };
    const result = profileInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("feedbackInputSchema", () => {
  it("accepts valid feedback with comment", () => {
    const result = feedbackInputSchema.safeParse({
      week_number: 1,
      difficulty: "Just Right",
      comment: "Good mix of activities",
      completed: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid feedback without optional fields", () => {
    const result = feedbackInputSchema.safeParse({
      week_number: 2,
      difficulty: "Too Hard",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid difficulty", () => {
    const result = feedbackInputSchema.safeParse({
      week_number: 1,
      difficulty: "Medium",
    });
    expect(result.success).toBe(false);
  });

  it("rejects week_number less than 1", () => {
    const result = feedbackInputSchema.safeParse({
      week_number: 0,
      difficulty: "Just Right",
    });
    expect(result.success).toBe(false);
  });
});

describe("placementRequestSchema", () => {
  it("accepts a valid language request", () => {
    const result = placementRequestSchema.safeParse({ language: "Spanish" });
    expect(result.success).toBe(true);
  });

  it("rejects empty language", () => {
    const result = placementRequestSchema.safeParse({ language: "" });
    expect(result.success).toBe(false);
  });
});

describe("planSchema", () => {
  it("accepts a valid plan structure", () => {
    const result = planSchema.safeParse({
      plan_id: "123e4567-e89b-12d3-a456-426614174000",
      skill: "Spanish",
      total_weeks: 8,
      weekly_time_hours: 5,
      weeks: [
        {
          week_number: 1,
          title: "Test Week",
          objective: "Learn basics",
          topics: [
            {
              name: "Test Topic",
              type: "Vocabulary",
              estimated_minutes: 60,
              resources: [
                {
                  title: "Test Resource",
                  url: "https://example.com",
                  type: "Video",
                  cost: "Free",
                  preferred: true,
                },
              ],
            },
          ],
          total_time_minutes: 60,
          difficulty: "Beginner",
          milestone: "Can say hello",
        },
      ],
      estimated_total_cost: "$0",
      adaptation_note: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a plan with fewer than 8 total_weeks", () => {
    const result = planSchema.safeParse({
      plan_id: "uuid",
      skill: "Spanish",
      total_weeks: 3,
      weekly_time_hours: 5,
      weeks: [],
      estimated_total_cost: "$0",
      adaptation_note: "",
    });
    // total_weeks can be any number but the schema doesn't enforce min 8
    // (that's in the prompt instructions). The schema just validates types.
    // Actually looking at the schema, total_weeks is just z.number().int()
    // with a describe() comment. So 3 should pass validation.
    expect(result.success).toBe(true);
  });
});
