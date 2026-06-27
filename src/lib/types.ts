// Layer 1 — Domain types for SkillPath AI

// CEFR / MCER levels
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type ResourcePreference = "Free only" | "Free + Low cost" | "Any";
export type LearningStyle = "Conversation" | "Listening" | "Reading" | "Apps & games";

export interface UserProfile {
  skill: string; // target language to learn, e.g. "Spanish", "Latin"
  current_level: Level;
  goal: string;
  time_available: string; // e.g. "5-7 hours/week"
  learning_style: LearningStyle[];
  resource_preference: ResourcePreference;
}

export type Difficulty = "Too Easy" | "Just Right" | "Too Hard";

export interface Feedback {
  week_number: number;
  difficulty: Difficulty;
  comment: string;
  completed: boolean;
}

export type TopicType =
  | "Vocabulary"
  | "Grammar"
  | "Listening"
  | "Speaking"
  | "Reading"
  | "Writing"
  | "Pronunciation"
  | "Culture"
  | "Review"
  | "Assessment";

export type ResourceType =
  | "Video"
  | "Podcast"
  | "Article"
  | "App"
  | "Interactive"
  | "Flashcards";

export type Cost = "Free" | "Low" | "Premium";

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
  cost: Cost;
  preferred: boolean;
}

export interface Topic {
  name: string;
  type: TopicType;
  estimated_minutes: number;
  resources: Resource[];
}

export type WeekDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Week {
  week_number: number;
  title: string;
  objective: string;
  topics: Topic[];
  total_time_minutes: number;
  difficulty: WeekDifficulty;
  milestone: string;
}

export interface Plan {
  plan_id: string;
  skill: string;
  total_weeks: number;
  weekly_time_hours: number;
  weeks: Week[];
  estimated_total_cost: string;
  adaptation_note: string;
  // client-side metadata (not from LLM)
  profile?: UserProfile;
}

export type WeekStatus = "not_started" | "in_progress" | "completed";
