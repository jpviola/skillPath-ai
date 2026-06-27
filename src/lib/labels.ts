// Spanish display labels for enum values. The underlying enum strings stay in
// English (they are the LLM/schema contract); only what the user sees is Spanish.
import type {
  Level,
  LearningStyle,
  ResourcePreference,
  TopicType,
  ResourceType,
  Cost,
  WeekStatus,
  WeekDifficulty,
  Difficulty,
} from "./types";

export const levelLabels: Record<Level, string> = {
  A1: "A1 · Elemental",
  A2: "A2 · Principiante",
  B1: "B1 · Intermedio",
  B2: "B2 · Intermedio-alto",
  C1: "C1 · Avanzado",
  C2: "C2 · Profesional",
};

export const styleLabels: Record<LearningStyle, string> = {
  Conversation: "Conversación",
  Listening: "Escucha",
  Reading: "Lectura",
  "Apps & games": "Apps y juegos",
};

export const prefLabels: Record<ResourcePreference, string> = {
  "Free only": "Solo gratis",
  "Free + Low cost": "Gratis + bajo costo",
  Any: "Cualquiera",
};

export const topicTypeLabels: Record<TopicType, string> = {
  Vocabulary: "Vocabulario",
  Grammar: "Gramática",
  Listening: "Escucha",
  Speaking: "Habla",
  Reading: "Lectura",
  Writing: "Escritura",
  Pronunciation: "Pronunciación",
  Culture: "Cultura",
  Review: "Repaso",
  Assessment: "Evaluación",
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  Video: "Video",
  Podcast: "Podcast",
  Article: "Artículo",
  App: "App",
  Interactive: "Interactivo",
  Flashcards: "Tarjetas",
};

export const costLabels: Record<Cost, string> = {
  Free: "Gratis",
  Low: "Bajo",
  Premium: "Premium",
};

export const difficultyLabels: Record<WeekDifficulty, string> = {
  Beginner: "Principiante",
  Intermediate: "Intermedio",
  Advanced: "Avanzado",
};

export const statusLabelsEs: Record<WeekStatus, string> = {
  completed: "Completada",
  in_progress: "En curso",
  not_started: "Sin empezar",
};

export const feedbackLabels: Record<Difficulty, string> = {
  "Too Easy": "Muy fácil",
  "Just Right": "Adecuado",
  "Too Hard": "Muy difícil",
};
