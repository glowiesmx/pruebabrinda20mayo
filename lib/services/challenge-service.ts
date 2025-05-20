import { supabase } from "@/lib/supabase/client"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { FutbolContext } from "@/contexts/futbol-context"
import type { Archetype } from "@/types/archetype"

export type Challenge = {
  id: string
  routeId: string
  name: string
  description: string
  challenge_text: string
  arquetipoId: string
  team: string
  mechanics: {
    type: "voice_or_text" | "random_wheel" | "quiz" | "video"
    maxLength?: number
    voteOptions?: string[]
    options?: {
      id: string
      text: string
    }[]
    questions?: {
      text: string
      correctAnswer: string
    }[]
    scoring?: string
    media?: string
  }
  reward_type: string
}

// Obtener desafíos por ruta
export async function fetchChallengesByRoute(routeId: string): Promise<Challenge[]> {
  try {
    const { data, error } = await supabase.from("challenges").select("*").eq("routeId", routeId)

    if (error) throw error

    return data as Challenge[]
  } catch (error) {
    console.error(`Error fetching challenges for route ${routeId}:`, error)

    // Fallback a datos locales
    return getLocalChallenges().filter((c) => c.routeId === routeId)
  }
}

// Obtener desafíos por arquetipo
export async function fetchChallengesByArchetype(arquetipoId: string): Promise<Challenge[]> {
  try {
    const { data, error } = await supabase.from("challenges").select("*").eq("arquetipoId", arquetipoId)

    if (error) throw error

    return data as Challenge[]
  } catch (error) {
    console.error(`Error fetching challenges for archetype ${arquetipoId}:`, error)

    // Fallback a datos locales
    return getLocalChallenges().filter((c) => c.arquetipoId === arquetipoId)
  }
}

// Generar un desafío dinámico con IA
export async function generateAIChallenge(
  context: FutbolContext,
  archetype: Archetype,
  mode: "individual" | "dueto" | "grupo",
): Promise<string> {
  // Verificar si hay API key de OpenAI
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.log("OpenAI API key not found, using default challenge")
    return getDefaultChallenge(context, archetype, mode)
  }

  const teamName = context.brand.id === "tigres" ? "Tigres UANL" : "Rayados de Monterrey"
  const rivalName = context.brand.id === "tigres" ? "Rayados de Monterrey" : "Tigres UANL"

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Genera un desafío de ${mode} para un juego de fútbol entre ${teamName} y ${rivalName}.
        
        Contexto:
        - Equipo: ${teamName}
        - Rival: ${rivalName}
        - Arquetipo: "${archetype.name}" - ${archetype.description}
        
        El desafío debe:
        - Tener la voz y tono del arquetipo "${archetype.name}"
        - Ser apropiado para el modo "${mode}" (${
          mode === "individual"
            ? "una sola persona"
            : mode === "dueto"
              ? "dos personas interactuando"
              : "un grupo de personas"
        })
        - Relacionarse con la rivalidad entre ${teamName} y ${rivalName}
        - Ser divertido, atrevido pero no ofensivo
        - Tener entre 1-2 oraciones máximo
        - NO incluir instrucciones adicionales, solo el desafío
        
        Ejemplo: "Imita el festejo más icónico de tu jugador favorito cuando anotó contra ${rivalName}."
      `,
      temperature: 0.7,
      maxTokens: 100,
    })

    return text.trim().replace(/^["']|["']$/g, "")
  } catch (error) {
    console.error("Error generating AI challenge:", error)
    return getDefaultChallenge(context, archetype, mode)
  }
}

// Guardar completación de desafío
export async function saveCompletedChallenge(
  userId: string,
  challengeId: string,
  mode: "individual" | "dueto" | "grupo",
  teamId: string,
  mediaType?: "audio" | "video" | "text",
  mediaUrl?: string,
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("challenge_completions")
      .insert([
        {
          user_id: userId,
          challenge_id: challengeId,
          mode,
          team: teamId,
          media_type: mediaType,
          media_url: mediaUrl,
        },
      ])
      .select()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error saving challenge completion:", error)

    // Simulación para modo demo
    return [
      {
        id: Math.floor(Math.random() * 10000),
        user_id: userId,
        challenge_id: challengeId,
        mode,
        team: teamId,
        media_type: mediaType,
        media_url: mediaUrl,
        created_at: new Date().toISOString(),
      },
    ]
  }
}

// Desafíos locales de respaldo
function getLocalChallenges(): Challenge[] {
  return [
    {
      id: "1",
      routeId: "respuesta_incomoda",
      name: "Confiesa tu pecado futbolero",
      description: "Confiesa la peor mentira que dijiste para ocultar tu afición al otro equipo.",
      challenge_text: "Confiesa la peor mentira que dijiste para ocultar tu afición al otro equipo.",
      arquetipoId: "rival_secreto",
      team: "rayados",
      mechanics: {
        type: "voice_or_text",
        maxLength: 30,
        voteOptions: ["😳", "🤣"],
      },
      reward_type: "symbolic_sticker",
    },
    {
      id: "2",
      routeId: "rueda_desmadre",
      name: "Gira y actúa",
      description: "La ruleta decidirá tu destino",
      challenge_text: "La ruleta decidirá tu destino",
      arquetipoId: "comentarista_bar",
      team: "tigres",
      mechanics: {
        type: "random_wheel",
        options: [
          { id: "cantalo", text: "Canta tu grito de gol en karaoke" },
          { id: "imitalo", text: "Imita el festejo de Gignac" },
          { id: "confiesa", text: "Di tu frase más ardida contra el rival" },
        ],
        media: "video",
      },
      reward_type: "individual_shot",
    },
    {
      id: "3",
      routeId: "caos_colectivo",
      name: "¿Quién lo dijo?",
      description: "Adivina quién dijo esta frase polémica",
      challenge_text: "Adivina quién dijo esta frase polémica",
      arquetipoId: "villamelon",
      team: "tigres",
      mechanics: {
        type: "quiz",
        questions: [
          {
            text: "¡Rayados nunca aprenden!",
            correctAnswer: "tigres",
          },
        ],
        scoring: "team_based",
      },
      reward_type: "monetary_giftcard_small",
    },
  ]
}

// Desafío predeterminado si falla la IA
function getDefaultChallenge(
  context: FutbolContext,
  archetype: Archetype,
  mode: "individual" | "dueto" | "grupo",
): string {
  const rivalName = context.brand.id === "tigres" ? "Rayados" : "Tigres"

  const defaultChallenges = {
    individual: {
      tigres: [
        `Confiesa tu peor mentira sobre ${rivalName} usando la palabra 'Gignac'.`,
        `Imita el festejo más icónico de Gignac contra ${rivalName}.`,
        `Cuenta tu mejor anécdota viendo a Tigres contra ${rivalName}.`,
      ],
      rayados: [
        `Confiesa tu peor derrota contra ${rivalName} usando 'Palermo'.`,
        `Imita el estilo de Palermo cuando jugaba contra ${rivalName}.`,
        `Cuenta tu mejor anécdota viendo a Rayados contra ${rivalName}.`,
      ],
      neutral: [
        `Como neutral, cuenta qué equipo te parece que tiene mejor afición y por qué.`,
        `Imita a un comentarista narrando un gol en el clásico regio.`,
        `¿Qué equipo crees que ganará el próximo clásico y por qué?`,
      ],
    },
    dueto: {
      tigres: [
        `¿Quién imita mejor el festejo de Gignac vs ${rivalName}?`,
        `Uno narra y otro actúa la jugada más memorable de Tigres contra ${rivalName}.`,
        `Debatan quién es el mejor jugador de Tigres contra ${rivalName} en la historia.`,
      ],
      rayados: [
        `¿Quién imita mejor el estilo de Palermo vs ${rivalName}?`,
        `Uno narra y otro actúa la jugada más memorable de Rayados contra ${rivalName}.`,
        `Debatan quién es el mejor jugador de Rayados contra ${rivalName} en la historia.`,
      ],
      neutral: [
        `Uno defiende a Tigres y otro a Rayados: ¿Quién tiene mejores argumentos?`,
        `Imiten a dos comentaristas con opiniones opuestas sobre el clásico regio.`,
        `Uno narra y otro actúa el gol más polémico de la historia del clásico.`,
      ],
    },
    grupo: {
      tigres: [
        `Canten un himno alternativo contra ${rivalName} en coro.`,
        `Recreen la celebración más icónica de Tigres contra ${rivalName}.`,
        `Hagan una porra improvisada para Tigres mencionando a ${rivalName}.`,
      ],
      rayados: [
        `Canten un grito de guerra contra ${rivalName} en equipo.`,
        `Recreen la celebración más icónica de Rayados contra ${rivalName}.`,
        `Hagan una porra improvisada para Rayados mencionando a ${rivalName}.`,
      ],
      neutral: [
        `Como grupo neutral, voten y expliquen qué equipo tiene mejor estadio.`,
        `Improvisen una narración grupal del mejor clásico regio de la historia.`,
        `Cada uno mencione un dato curioso sobre la rivalidad Tigres-Rayados.`,
      ],
    },
  }

  const teamChallenges = defaultChallenges[mode][archetype.team as keyof (typeof defaultChallenges)[typeof mode]]
  const randomIndex = Math.floor(Math.random() * teamChallenges.length)
  return teamChallenges[randomIndex]
}
