import { supabase } from "@/lib/supabase/client"
import type { Archetype } from "@/types/archetype"

// Obtener todos los arquetipos
export async function fetchArchetypes(teamId?: string): Promise<Archetype[]> {
  try {
    let query = supabase.from("archetypes").select("*")

    if (teamId) {
      query = query.eq("team", teamId)
    }

    const { data, error } = await query

    if (error) throw error

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
    const { data, error } = await supabase.from("archetypes").select("*").eq("id", archetypeId).single()

    if (error) throw error

    return data as Archetype
  } catch (error) {
    console.error(`Error fetching archetype ${archetypeId}:`, error)

    // Fallback a datos locales
    const allArchetypes = getLocalArchetypes()
    return allArchetypes.find((a) => a.id === archetypeId) || null
  }
}

// Desbloquear un arquetipo para un usuario
export async function unlockArchetype(userId: string, archetypeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_archetypes")
      .insert([{ user_id: userId, archetype_id: archetypeId, unlocked_at: new Date().toISOString() }])

    if (error) throw error

    return true
  } catch (error) {
    console.error(`Error unlocking archetype ${archetypeId} for user ${userId}:`, error)
    return false
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

// Datos locales de respaldo
function getLocalArchetypes(teamId?: string): Archetype[] {
  const archetypes: Archetype[] = [
    {
      id: "villamelon",
      name: "El Villamelón",
      team: "tigres",
      description: "Sólo aparece cuando el equipo gana... y presume cada gol.",
      unlockCondition: "complete_challenge:rueda_desmadre",
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
      challengeModes: ["individual", "dueto"],
      stickerUrl: "/placeholder.svg?height=200&width=200",
      isUnlocked: true,
    },
    {
      id: "hater_favorito",
      name: "El Hater Favorito",
      team: "rayados",
      description: "Siempre tiene algo negativo que decir sobre el rival.",
      unlockCondition: "complete_challenge:opinion_polemica",
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
      challengeModes: ["individual", "dueto"],
      stickerUrl: "/placeholder.svg?height=200&width=200",
      isUnlocked: true,
    },
    {
      id: "neutral_curioso",
      name: "El Neutral Curioso",
      team: "neutral",
      description: "Participa sin ser de ningún equipo, por pura curiosidad.",
      unlockCondition: "participate_without_team",
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
