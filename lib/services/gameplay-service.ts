import { supabase } from "@/lib/supabase/client"
import type { FutbolContext } from "@/contexts/futbol-context"
import type { Archetype, ArchetypeChallenge, GameRoute, GameRouteConfig, GameMode } from "@/types/game-types"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Obtener todos los arquetipos
export async function fetchArchetypes(teamId?: string): Promise<Archetype[]> {
  try {
    // Check if we're in preview/demo mode
    const isPreviewMode =
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      typeof window !== "undefined"

    // If in preview mode, use local data directly
    if (isPreviewMode) {
      console.log("Using local archetype data in preview mode")
      return getLocalArchetypes(teamId)
    }

    let query = supabase.from("archetypes").select("*")

    if (teamId) {
      query = query.eq("team", teamId)
    }

    const { data, error } = await query

    if (error) {
      // If the table doesn't exist, use local data
      if (error.message.includes("does not exist")) {
        console.log("Archetypes table doesn't exist, using local data")
        return getLocalArchetypes(teamId)
      }
      throw error
    }

    return data as Archetype[]
  } catch (error) {
    console.error("Error fetching archetypes:", error)

    // Fallback a datos locales en caso de error
    return getLocalArchetypes(teamId)
  }
}

// Obtener un arquetipo específico
export async function fetchArchetype(archetypeId: string): Promise<Archetype | null> {
  try {
    // Check if we're in preview/demo mode
    const isPreviewMode =
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      typeof window !== "undefined"

    // If in preview mode, use local data directly
    if (isPreviewMode) {
      console.log("Using local archetype data in preview mode")
      const allArchetypes = getLocalArchetypes()
      return allArchetypes.find((a) => a.id === archetypeId) || null
    }

    const { data, error } = await supabase.from("archetypes").select("*").eq("id", archetypeId).single()

    if (error) {
      // If the table doesn't exist, use local data
      if (error.message.includes("does not exist")) {
        console.log("Archetypes table doesn't exist, using local data")
        const allArchetypes = getLocalArchetypes()
        return allArchetypes.find((a) => a.id === archetypeId) || null
      }
      throw error
    }

    return data as Archetype
  } catch (error) {
    console.error(`Error fetching archetype ${archetypeId}:`, error)

    // Fallback a datos locales
    const allArchetypes = getLocalArchetypes()
    return allArchetypes.find((a) => a.id === archetypeId) || null
  }
}

// Obtener desafíos por arquetipo y ruta
export async function fetchChallengesByArchetypeAndRoute(
  archetypeId: string,
  routeId: GameRoute,
  mode?: GameMode,
): Promise<ArchetypeChallenge[]> {
  try {
    // Check if we're in preview/demo mode
    const isPreviewMode =
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      typeof window !== "undefined"

    // If in preview mode, use local data directly
    if (isPreviewMode) {
      console.log("Using local challenge data in preview mode")
      return getLocalChallenges().filter(
        (c) => c.archetypeId === archetypeId && c.routeId === routeId && (!mode || c.mode === mode),
      )
    }

    let query = supabase.from("archetype_challenges").select("*").eq("archetypeId", archetypeId).eq("routeId", routeId)

    if (mode) {
      query = query.eq("mode", mode)
    }

    const { data, error } = await query

    if (error) {
      // If the table doesn't exist, use local data
      if (error.message.includes("does not exist")) {
        console.log("Archetype challenges table doesn't exist, using local data")
        return getLocalChallenges().filter(
          (c) => c.archetypeId === archetypeId && c.routeId === routeId && (!mode || c.mode === mode),
        )
      }
      throw error
    }

    return data as ArchetypeChallenge[]
  } catch (error) {
    console.error(`Error fetching challenges for archetype ${archetypeId} and route ${routeId}:`, error)

    // Fallback a datos locales
    return getLocalChallenges().filter(
      (c) => c.archetypeId === archetypeId && c.routeId === routeId && (!mode || c.mode === mode),
    )
  }
}

// Obtener configuración de una ruta de juego
export async function fetchGameRoute(routeId: GameRoute): Promise<GameRouteConfig | null> {
  try {
    // Check if we're in preview/demo mode
    const isPreviewMode =
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      typeof window !== "undefined"

    // If in preview mode, use local data directly
    if (isPreviewMode) {
      console.log("Using local game route data in preview mode")
      return getLocalGameRoutes().find((r) => r.id === routeId) || null
    }

    const { data, error } = await supabase.from("game_routes").select("*").eq("id", routeId).single()

    if (error) {
      // If the table doesn't exist, use local data
      if (error.message.includes("does not exist")) {
        console.log("Game routes table doesn't exist, using local data")
        return getLocalGameRoutes().find((r) => r.id === routeId) || null
      }
      throw error
    }

    return data as GameRouteConfig
  } catch (error) {
    console.error(`Error fetching game route ${routeId}:`, error)

    // Fallback a datos locales
    return getLocalGameRoutes().find((r) => r.id === routeId) || null
  }
}

// Generar un desafío dinámico con IA para un arquetipo específico
export async function generateArchetypeChallenge(
  context: FutbolContext,
  archetype: Archetype,
  routeId: GameRoute,
  mode: GameMode,
): Promise<string> {
  // Verificar si hay API key de OpenAI
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.log("OpenAI API key not found, using default challenge")
    return getDefaultChallenge(context, archetype, routeId, mode)
  }

  const teamName = context.brand.id === "tigres" ? "Tigres UANL" : "Rayados de Monterrey"
  const rivalName = context.brand.id === "tigres" ? "Rayados de Monterrey" : "Tigres UANL"
  const routeConfig = getLocalGameRoutes().find((r) => r.id === routeId)
  const routeType = routeConfig?.mechanics.type || "voice_or_text"

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Genera un desafío de ${mode} para un juego de fútbol entre ${teamName} y ${rivalName}.
        
        Contexto:
        - Equipo: ${teamName}
        - Rival: ${rivalName}
        - Arquetipo: "${archetype.name}" - ${archetype.description}
        - Tipo de ruta: ${routeType} (${getRouteDescription(routeId)})
        
        El desafío debe:
        - Tener la voz y tono del arquetipo "${archetype.name}"
        - Ser apropiado para el modo "${mode}" (${
          mode === "individual"
            ? "una sola persona"
            : mode === "dueto"
              ? "dos personas interactuando"
              : "un grupo de personas"
        })
        - Ser compatible con la mecánica de juego "${routeType}"
        - Relacionarse con la rivalidad entre ${teamName} y ${rivalName}
        - Ser divertido, atrevido pero no ofensivo
        - Tener entre 1-2 oraciones máximo
        - NO incluir instrucciones adicionales, solo el desafío
        
        Ejemplo para arquetipo "El Comentarista de Bar" en ruta "rueda_desmadre": 
        "Imita al narrador más famoso relatando el gol más doloroso que le metió ${teamName} a ${rivalName}."
      `,
      temperature: 0.7,
      maxTokens: 100,
    })

    return text.trim().replace(/^["']|["']$/g, "")
  } catch (error) {
    console.error("Error generating AI challenge:", error)
    return getDefaultChallenge(context, archetype, routeId, mode)
  }
}

// Guardar completación de desafío
export async function saveCompletedChallenge(
  userId: string,
  challengeId: string,
  archetypeId: string,
  routeId: GameRoute,
  mode: GameMode,
  teamId: string,
  mediaType?: "audio" | "video" | "text",
  mediaUrl?: string,
): Promise<any> {
  // Check if we're in preview/demo mode
  const isPreviewMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    typeof window !== "undefined"

  // If in preview mode, return simulated data directly
  if (isPreviewMode) {
    console.log("Using simulated challenge completion data in preview mode")
    return simulateCompletedChallenge(userId, challengeId, archetypeId, routeId, mode, teamId, mediaType, mediaUrl)
  }

  try {
    // First, check if the table exists and has the expected schema
    const { count, error: checkError } = await supabase
      .from("challenge_completions")
      .select("*", { count: "exact", head: true })

    // If there was an error checking the table, use simulated data
    if (checkError) {
      console.log("Challenge completions table doesn't exist or has a different schema, using simulated data")
      return simulateCompletedChallenge(userId, challengeId, archetypeId, routeId, mode, teamId, mediaType, mediaUrl)
    }

    // Proceed with the insert operation
    const { data, error } = await supabase
      .from("challenge_completions")
      .insert([
        {
          user_id: userId,
          challenge_id: challengeId,
          archetype_id: archetypeId,
          route_id: routeId,
          mode,
          team: teamId,
          media_type: mediaType,
          media_url: mediaUrl,
        },
      ])
      .select()

    if (error) {
      // If there's an error with the schema, use simulated data
      if (error.message.includes("column") || error.message.includes("schema")) {
        console.log("Schema error in challenge_completions table, using simulated data:", error.message)
        return simulateCompletedChallenge(userId, challengeId, archetypeId, routeId, mode, teamId, mediaType, mediaUrl)
      }
      throw error
    }

    // Desbloquear el arquetipo si corresponde
    const archetype = await fetchArchetype(archetypeId)
    if (archetype && archetype.unlockCondition.includes(`complete_challenge:${routeId}`)) {
      await unlockArchetype(userId, archetypeId)
    }

    return data
  } catch (error) {
    console.error("Error saving challenge completion:", error)
    // Simulación para modo demo o en caso de error
    return simulateCompletedChallenge(userId, challengeId, archetypeId, routeId, mode, teamId, mediaType, mediaUrl)
  }
}

// Desbloquear un arquetipo para un usuario
export async function unlockArchetype(userId: string, archetypeId: string): Promise<boolean> {
  // Check if we're in preview/demo mode
  const isPreviewMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    typeof window !== "undefined"

  // If in preview mode, return success directly
  if (isPreviewMode) {
    console.log("Simulating archetype unlock in preview mode")
    return true
  }

  try {
    // First, check if the table exists
    const { count, error: checkError } = await supabase
      .from("user_archetypes")
      .select("*", { count: "exact", head: true })

    // If there was an error checking the table, simulate success
    if (checkError) {
      console.log("User archetypes table doesn't exist, simulating success")
      return true
    }

    const { error } = await supabase
      .from("user_archetypes")
      .insert([{ user_id: userId, archetype_id: archetypeId, unlocked_at: new Date().toISOString() }])

    if (error) {
      // If there's an error with the schema, simulate success
      if (error.message.includes("column") || error.message.includes("schema")) {
        console.log("Schema error in user_archetypes table, simulating success:", error.message)
        return true
      }
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error unlocking archetype ${archetypeId} for user ${userId}:`, error)
    // In demo mode or in case of error, simulate success
    return true
  }
}

// Obtener arquetipos desbloqueados por un usuario
export async function fetchUserArchetypes(userId: string): Promise<Archetype[]> {
  try {
    const { data, error } = await supabase
      .from("user_archetypes")
      .select(`
        archetype_id,
        unlocked_at,
        archetypes (*)
      `)
      .eq("user_id", userId)

    if (error) throw error

    return data.map((item) => item.archetypes) as Archetype[]
  } catch (error) {
    console.error(`Error fetching archetypes for user ${userId}:`, error)
    return []
  }
}

// Obtener descripción de una ruta
function getRouteDescription(routeId: GameRoute): string {
  switch (routeId) {
    case "rueda_desmadre":
      return "Desafíos aleatorios de una ruleta"
    case "respuesta_incomoda":
      return "Confesiones y respuestas incómodas"
    case "caos_colectivo":
      return "Quiz y preguntas sobre el clásico"
    case "karaoke_emocional":
      return "Cantar o recitar algo relacionado con el equipo"
    case "ritual_victoria":
      return "Realizar un ritual o celebración especial"
    default:
      return "Desafío general"
  }
}

// Datos locales de respaldo
function getLocalArchetypes(teamId?: string): Archetype[] {
  const archetypes: Archetype[] = [
    {
      id: "villamelon",
      name: "El Villamelón",
      team: "tigres",
      description: "Sólo aparece cuando el equipo gana... y presume cada gol.",
      unlockCondition: "complete_challenge:caos_colectivo",
      compatibleRoutes: ["caos_colectivo", "rueda_desmadre"],
      challengeModes: ["individual", "grupo"],
      stickerUrl: "/placeholder.svg?height=200&width=200",
      isUnlocked: true,
    },
    {
      id: "clasico_doloroso",
      name: "El Clásico Doloroso",
      team: "tigres",
      description: "Revive con dolor cada derrota en el clásico.",
      unlockCondition: "complete_challenge:karaoke_emocional",
      compatibleRoutes: ["karaoke_emocional", "respuesta_incomoda"],
      challengeModes: ["individual", "grupo"],
      stickerUrl: "/placeholder.svg?height=200&width=200",
      isUnlocked: true,
    },
    {
      id: "rival_secreto",
      name: "El Rival Secreto",
      team: "rayados",
      description: "Admira al rival pero jamás lo admitirá en público.",
      unlockCondition: "complete_challenge:respuesta_incomoda",
      compatibleRoutes: ["respuesta_incomoda", "caos_colectivo"],
      challengeModes: ["individual", "dueto"],
      stickerUrl: "/placeholder.svg?height=200&width=200",
      isUnlocked: true,
    },
    {
      id: "hater_favorito",
      name: "El Hater Favorito",
      team: "rayados",
      description: "Siempre tiene algo negativo que decir sobre el rival.",
      unlockCondition: "complete_challenge:rueda_desmadre",
      compatibleRoutes: ["rueda_desmadre", "respuesta_incomoda"],
      challengeModes: ["individual", "grupo"],
      stickerUrl: "/placeholder.svg?height=200&width=200",
      isUnlocked: true,
    },
    {
      id: "comentarista_bar",
      name: "El Comentarista de Bar",
      team: "tigres",
      description: "Sabe más que el DT y no duda en decirlo.",
      unlockCondition: "complete_challenge:rueda_desmadre",
      compatibleRoutes: ["rueda_desmadre", "caos_colectivo"],
      challengeModes: ["individual", "dueto"],
      stickerUrl: "/placeholder.svg?height=200&width=200",
      isUnlocked: true,
    },
    {
      id: "supersticion_eterna",
      name: "La Superstición Eterna",
      team: "rayados",
      description: "Tiene rituales específicos para cada partido contra el rival.",
      unlockCondition: "complete_challenge:ritual_victoria",
      compatibleRoutes: ["ritual_victoria", "karaoke_emocional"],
      challengeModes: ["individual", "dueto", "grupo"],
      stickerUrl: "/placeholder.svg?height=200&width=200",
      isUnlocked: true,
    },
  ]

  if (teamId) {
    return archetypes.filter((a) => a.team === teamId)
  }

  return archetypes
}

// Desafíos locales de respaldo
function getLocalChallenges(): ArchetypeChallenge[] {
  return [
    {
      id: "1",
      archetypeId: "rival_secreto",
      routeId: "respuesta_incomoda",
      challengeText: "Confiesa la peor mentira que dijiste para ocultar tu afición al otro equipo.",
      mode: "individual",
      difficulty: 3,
      reward_type: "symbolic_sticker",
    },
    {
      id: "2",
      archetypeId: "comentarista_bar",
      routeId: "rueda_desmadre",
      challengeText: "Imita al narrador más famoso relatando el gol más doloroso que le metió tu equipo al rival.",
      mode: "individual",
      difficulty: 2,
      reward_type: "individual_shot",
    },
    {
      id: "3",
      archetypeId: "villamelon",
      routeId: "caos_colectivo",
      challengeText: "¿Quién dijo: '¡Rayados nunca aprenden!'?",
      mode: "individual",
      difficulty: 1,
      reward_type: "monetary_giftcard_small",
    },
    {
      id: "4",
      archetypeId: "clasico_doloroso",
      routeId: "karaoke_emocional",
      challengeText: "Canta el himno de tu equipo con toda la emoción, como si acabaran de ganar el clásico.",
      mode: "individual",
      difficulty: 3,
      reward_type: "symbolic_sticker",
    },
    {
      id: "5",
      archetypeId: "supersticion_eterna",
      routeId: "ritual_victoria",
      challengeText: "Muestra el ritual que haces antes de cada clásico para que tu equipo gane.",
      mode: "individual",
      difficulty: 2,
      reward_type: "individual_shot",
    },
    {
      id: "6",
      archetypeId: "hater_favorito",
      routeId: "rueda_desmadre",
      challengeText: "Di tres apodos creativos para el equipo rival sin usar palabras ofensivas.",
      mode: "individual",
      difficulty: 2,
      reward_type: "symbolic_sticker",
    },
    // Desafíos para dueto
    {
      id: "7",
      archetypeId: "rival_secreto",
      routeId: "respuesta_incomoda",
      challengeText: "Uno confiesa algo que admira del rival y el otro debe defender por qué está equivocado.",
      mode: "dueto",
      difficulty: 3,
      reward_type: "symbolic_sticker",
    },
    {
      id: "8",
      archetypeId: "comentarista_bar",
      routeId: "rueda_desmadre",
      challengeText: "Uno narra y el otro actúa la jugada más memorable del clásico regio.",
      mode: "dueto",
      difficulty: 3,
      reward_type: "individual_shot",
    },
    // Desafíos para grupo
    {
      id: "9",
      archetypeId: "villamelon",
      routeId: "caos_colectivo",
      challengeText: "Cada uno debe decir un dato sobre el clásico regio. El que repita o no sepa, pierde.",
      mode: "grupo",
      difficulty: 2,
      reward_type: "group_toast",
    },
    {
      id: "10",
      archetypeId: "hater_favorito",
      routeId: "respuesta_incomoda",
      challengeText: "Cada uno debe decir algo positivo del equipo rival. El más convincente gana.",
      mode: "grupo",
      difficulty: 4,
      reward_type: "group_toast",
    },
  ]
}

// Rutas de juego locales
function getLocalGameRoutes(): GameRouteConfig[] {
  return [
    {
      id: "rueda_desmadre",
      name: "Rueda del Desmadre",
      description: "Gira la rueda y acepta el desafío que te toque. ¡La suerte decidirá tu destino!",
      mechanics: {
        type: "random_wheel",
        options: [
          { id: "cantalo", text: "Canta tu grito de gol en karaoke" },
          { id: "imitalo", text: "Imita el festejo de Gignac" },
          { id: "confiesa", text: "Di tu frase más ardida contra el rival" },
          { id: "baila", text: "Baila como si tu equipo hubiera ganado el clásico" },
          { id: "narra", text: "Narra el gol más importante de tu equipo" },
          { id: "insulta", text: "Di el apodo más creativo para el equipo rival" },
        ],
        media: "video",
      },
    },
    {
      id: "respuesta_incomoda",
      name: "Respuesta Incómoda",
      description: "Confiesa algo que nunca le dirías a otro aficionado. ¡La honestidad te liberará!",
      mechanics: {
        type: "voice_or_text",
        maxLength: 280,
        voteOptions: ["😳", "🤣"],
      },
    },
    {
      id: "caos_colectivo",
      name: "Caos Colectivo",
      description: "Pon a prueba tu conocimiento sobre el Clásico Regio. ¿Quién dijo qué? ¿Qué equipo hizo qué?",
      mechanics: {
        type: "quiz",
        questions: [
          {
            text: "¿Quién dijo: '¡Rayados nunca aprenden!'?",
            correctAnswer: "tigres",
          },
          {
            text: "¿Qué equipo tiene más títulos en la última década?",
            correctAnswer: "tigres",
          },
          {
            text: "¿Qué equipo tiene el estadio más grande?",
            correctAnswer: "rayados",
          },
        ],
        scoring: "team_based",
      },
    },
    {
      id: "karaoke_emocional",
      name: "Karaoke Emocional",
      description: "Canta o recita algo relacionado con tu equipo con toda la emoción posible.",
      mechanics: {
        type: "karaoke",
        media: "audio",
        voteOptions: ["👏", "🔥", "😢"],
      },
    },
    {
      id: "ritual_victoria",
      name: "Ritual de Victoria",
      description: "Muestra tu ritual o celebración especial para los partidos de tu equipo.",
      mechanics: {
        type: "ritual",
        media: "video",
        voteOptions: ["🙌", "🤩", "🤪"],
      },
    },
  ]
}

// Desafío predeterminado si falla la IA
function getDefaultChallenge(context: FutbolContext, archetype: Archetype, routeId: GameRoute, mode: GameMode): string {
  // Buscar un desafío local que coincida con el arquetipo, ruta y modo
  const localChallenges = getLocalChallenges().filter(
    (c) => c.archetypeId === archetype.id && c.routeId === routeId && c.mode === mode,
  )

  if (localChallenges.length > 0) {
    // Seleccionar un desafío aleatorio de los disponibles
    const randomIndex = Math.floor(Math.random() * localChallenges.length)
    return localChallenges[randomIndex].challengeText
  }

  // Si no hay desafíos específicos, generar uno genérico
  const rivalName = context.brand.id === "tigres" ? "Rayados" : "Tigres"

  switch (archetype.id) {
    case "villamelon":
      return `Cuenta tu mejor anécdota viendo a tu equipo contra ${rivalName}.`
    case "clasico_doloroso":
      return `Describe la derrota más dolorosa contra ${rivalName} y cómo te sentiste.`
    case "rival_secreto":
      return `Confiesa algo que admiras del ${rivalName} pero nunca dirías en público.`
    case "hater_favorito":
      return `Di tres cosas que no soportas del ${rivalName} sin usar groserías.`
    case "comentarista_bar":
      return `Explica como si fueras DT por qué tu equipo perdió el último clásico.`
    case "supersticion_eterna":
      return `Describe el ritual que haces para que tu equipo gane contra ${rivalName}.`
    default:
      return `Cuenta una anécdota sobre el clásico entre Tigres y Rayados.`
  }
}

// Helper function to simulate a completed challenge
function simulateCompletedChallenge(
  userId: string,
  challengeId: string,
  archetypeId: string,
  routeId: GameRoute,
  mode: GameMode,
  teamId: string,
  mediaType?: "audio" | "video" | "text",
  mediaUrl?: string,
): any[] {
  return [
    {
      id: Math.floor(Math.random() * 10000),
      user_id: userId,
      challenge_id: challengeId,
      archetype_id: archetypeId,
      route_id: routeId,
      mode,
      team: teamId,
      media_type: mediaType,
      media_url: mediaUrl,
      created_at: new Date().toISOString(),
    },
  ]
}
