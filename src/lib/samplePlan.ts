// Demo mode — a realistic, fully-formed sample plan so users can explore the
// product instantly without spending an LLM call. Profile + plan are consistent.
import type { Plan, UserProfile } from "./types";

export const sampleProfile: UserProfile = {
  skill: "Spanish",
  current_level: "Beginner",
  goal: "Mantener una conversación básica en 3 meses",
  time_available: "6-7 horas/semana",
  learning_style: ["Conversation", "Listening"],
  resource_preference: "Free + Low cost",
};

const video = (title: string, url = "") =>
  ({ title, url, type: "Video", cost: "Free", preferred: true }) as const;
const app = (title: string) =>
  ({ title, url: "", type: "App", cost: "Free", preferred: false }) as const;
const cards = (title: string) =>
  ({ title, url: "", type: "Flashcards", cost: "Free", preferred: false }) as const;

export const samplePlan: Plan = {
  plan_id: "demo-spanish-0001",
  skill: "Spanish",
  total_weeks: 8,
  weekly_time_hours: 6.5,
  estimated_total_cost: "$0 (todos los recursos gratuitos)",
  adaptation_note: "",
  profile: sampleProfile,
  weeks: [
    {
      week_number: 1,
      title: "Sonidos, saludos y cómo estudiar",
      objective: "Pronunciar con claridad las vocales del español y saludar con confianza.",
      difficulty: "Beginner",
      total_time_minutes: 390,
      milestone: "Puedes presentarte e intercambiar saludos en voz alta.",
      topics: [
        {
          name: "Las 5 vocales del español y el alfabeto",
          type: "Pronunciation",
          estimated_minutes: 90,
          resources: [video("Pronunciación del español para principiantes"), app("Forvo — escucha pronunciación nativa")],
        },
        {
          name: "Saludos y presentaciones (hola, ¿cómo estás?, me llamo…)",
          type: "Speaking",
          estimated_minutes: 120,
          resources: [video("Language Transfer — Complete Spanish (pista 1)")],
        },
        {
          name: "Tus primeras 50 palabras más frecuentes",
          type: "Vocabulary",
          estimated_minutes: 90,
          resources: [cards("Anki — mazo de las 1000 palabras más comunes")],
        },
        {
          name: "Escucha: español lento para principiantes absolutos",
          type: "Listening",
          estimated_minutes: 90,
          resources: [video("Dreaming Spanish — Superprincipiante")],
        },
      ],
    },
    {
      week_number: 2,
      title: "Ser, estar y hablar de ti",
      objective: "Describir quién eres y cómo te sientes usando ser y estar.",
      difficulty: "Beginner",
      total_time_minutes: 400,
      milestone: "Puedes decir de dónde eres y cómo te sientes.",
      topics: [
        {
          name: "Ser vs estar en contexto",
          type: "Grammar",
          estimated_minutes: 90,
          resources: [video("Ser vs estar explicado de forma sencilla")],
        },
        {
          name: "Práctica oral: descríbete a ti mismo",
          type: "Speaking",
          estimated_minutes: 130,
          resources: [app("Pimsleur o un tutor en iTalki (bajo costo)")],
        },
        {
          name: "Números 0–100 y decir tu edad",
          type: "Vocabulary",
          estimated_minutes: 90,
          resources: [cards("Anki — mazo de números")],
        },
        {
          name: "Escucha y repite: presentaciones breves",
          type: "Listening",
          estimated_minutes: 90,
          resources: [video("Coffee Break Spanish — Temporada 1")],
        },
      ],
    },
    {
      week_number: 3,
      title: "Presente y rutinas diarias",
      objective: "Hablar de lo que haces cada día con verbos regulares -ar/-er/-ir.",
      difficulty: "Beginner",
      total_time_minutes: 405,
      milestone: "Puedes describir tu rutina diaria en presente.",
      topics: [
        {
          name: "Conjugación del presente regular",
          type: "Grammar",
          estimated_minutes: 100,
          resources: [video("Presente de verbos regulares")],
        },
        {
          name: "Escribe: un párrafo corto sobre tu día",
          type: "Writing",
          estimated_minutes: 110,
          resources: [app("LanguageTool — corrector gramatical gratis")],
        },
        {
          name: "Vocabulario de la vida diaria (casa, trabajo, comida)",
          type: "Vocabulary",
          estimated_minutes: 95,
          resources: [cards("Anki — mazo de vida diaria")],
        },
        {
          name: "Repaso de semanas 1–2 + reciclaje de vocabulario",
          type: "Review",
          estimated_minutes: 100,
          resources: [],
        },
      ],
    },
    {
      week_number: 4,
      title: "Hacer preguntas y desenvolverte",
      objective: "Preguntar y responder cosas prácticas en tiendas y en la calle.",
      difficulty: "Beginner",
      total_time_minutes: 410,
      milestone: "Puedes pedir direcciones, precios y ordenar comida.",
      topics: [
        {
          name: "Palabras interrogativas (qué, dónde, cuánto, cómo)",
          type: "Grammar",
          estimated_minutes: 90,
          resources: [video("Palabras interrogativas en español")],
        },
        {
          name: "Juego de roles: pedir en una cafetería",
          type: "Speaking",
          estimated_minutes: 140,
          resources: [app("Conversación en iTalki (bajo costo)")],
        },
        {
          name: "Lee: un menú sencillo y señales",
          type: "Reading",
          estimated_minutes: 90,
          resources: [],
        },
        {
          name: "Escucha: diálogos cortos de mercado",
          type: "Listening",
          estimated_minutes: 90,
          resources: [video("Dreaming Spanish — Principiante")],
        },
      ],
    },
    {
      week_number: 5,
      title: "El pasado: hablar de ayer",
      objective: "Contar historias simples sobre lo que pasó usando el pretérito.",
      difficulty: "Intermediate",
      total_time_minutes: 415,
      milestone: "Puedes contar qué hiciste el fin de semana.",
      topics: [
        {
          name: "Pretérito de verbos regulares e irregulares comunes",
          type: "Grammar",
          estimated_minutes: 110,
          resources: [video("El pretérito explicado fácil")],
        },
        {
          name: "Habla: cuenta una historia de 1 minuto sobre tu fin de semana",
          type: "Speaking",
          estimated_minutes: 130,
          resources: [],
        },
        {
          name: "Conectores y expresiones de tiempo (ayer, luego, después)",
          type: "Vocabulary",
          estimated_minutes: 85,
          resources: [cards("Anki — mazo de conectores")],
        },
        {
          name: "Escucha: una anécdota personal corta",
          type: "Listening",
          estimated_minutes: 90,
          resources: [video("Coffee Break Spanish")],
        },
      ],
    },
    {
      week_number: 6,
      title: "Cultura y conversaciones reales",
      objective: "Entender el contexto cultural y sostener un intercambio más largo.",
      difficulty: "Intermediate",
      total_time_minutes: 405,
      milestone: "Puedes mantener una conversación de 5 minutos sobre temas familiares.",
      topics: [
        {
          name: "Culturas hispanohablantes y cortesía (tú vs usted)",
          type: "Culture",
          estimated_minutes: 80,
          resources: [video("Tú vs usted explicado")],
        },
        {
          name: "Práctica de conversación con una pareja o tutor",
          type: "Speaking",
          estimated_minutes: 150,
          resources: [app("iTalki / Tandem intercambio de idiomas")],
        },
        {
          name: "Lee: una entrada de blog o un cómic corto",
          type: "Reading",
          estimated_minutes: 90,
          resources: [],
        },
        {
          name: "Repaso de semanas 3–5",
          type: "Review",
          estimated_minutes: 85,
          resources: [],
        },
      ],
    },
    {
      week_number: 7,
      title: "Planes futuros y opiniones",
      objective: "Expresar planes y opiniones con naturalidad.",
      difficulty: "Intermediate",
      total_time_minutes: 410,
      milestone: "Puedes hablar de tus planes y decir lo que piensas.",
      topics: [
        {
          name: "Futuro próximo (ir a + infinitivo) y dar opiniones",
          type: "Grammar",
          estimated_minutes: 100,
          resources: [video("Ir a + infinitivo")],
        },
        {
          name: "Escribe: un mensaje planeando un fin de semana con un amigo",
          type: "Writing",
          estimated_minutes: 110,
          resources: [app("LanguageTool")],
        },
        {
          name: "Vocabulario de opinión y sentimientos",
          type: "Vocabulary",
          estimated_minutes: 90,
          resources: [cards("Anki — mazo de opiniones")],
        },
        {
          name: "Escucha: un pódcast corto para estudiantes",
          type: "Listening",
          estimated_minutes: 90,
          resources: [video("Pódcast Españolistos")],
        },
      ],
    },
    {
      week_number: 8,
      title: "Proyecto final: una conversación real",
      objective: "Combinar todo en una conversación espontánea y autoevaluarte.",
      difficulty: "Intermediate",
      total_time_minutes: 420,
      milestone: "Puedes presentarte, hacer preguntas y charlar durante 10 minutos.",
      topics: [
        {
          name: "Preparación: repasa frases y preguntas clave",
          type: "Review",
          estimated_minutes: 90,
          resources: [],
        },
        {
          name: "Conversación en vivo de 10 minutos con un tutor o pareja",
          type: "Speaking",
          estimated_minutes: 180,
          resources: [app("Clase en iTalki (bajo costo)")],
        },
        {
          name: "Autoevaluación y lista de próximos pasos",
          type: "Assessment",
          estimated_minutes: 80,
          resources: [],
        },
        {
          name: "Mira un video nativo corto con subtítulos",
          type: "Listening",
          estimated_minutes: 70,
          resources: [video("Easy Spanish — entrevistas en la calle")],
        },
      ],
    },
  ],
};
