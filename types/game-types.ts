import type { TeamId } from "@/contexts/futbol-context"

// Tipos de rutas de juego (mecánicas)
export type GameRoute =
  | "rueda_desmadre"
  | "respuesta_incomoda"
  | "caos_colectivo"
  | "karaoke_emocional"
  | "ritual_victoria"

// Modos de juego
export type GameMode = "individual" | "dueto" | "grupo"

// Arquetipos de aficionados
export interface Archetype {
  id: string
  name: string
  team: string
  description: string
  unlockCondition: string
  compatibleRoutes: GameRoute[] // Rutas de juego compatibles con este arquetipo
  challengeModes: GameMode[]
  stickerUrl?: string
  isUnlocked?: boolean
}

// Desafío específico de un arquetipo
export interface ArchetypeChallenge {
  id: string
  archetypeId: string
  routeId: GameRoute
  challengeText: string
  mode: GameMode
  difficulty: number // 1-5
  reward_type: string
}

// Ruta de juego (mecánica)
export interface GameRouteConfig {
  id: GameRoute
  name: string
  description: string
  mechanics: {
    type: "voice_or_text" | "random_wheel" | "quiz" | "video" | "karaoke" | "ritual"
    options?: {
      id: string
      text: string
    }[]
    questions?: {
      text: string
      correctAnswer: string
    }[]
    maxLength?: number
    voteOptions?: string[]
    media?: string
    scoring?: string
  }
}

// Sesión de juego
export interface GameSession {
  id: string
  teamId: TeamId
  players: {
    id: string
    name: string
    team: TeamId
    archetypes: string[] // IDs de arquetipos desbloqueados
  }[]
  currentRoute?: GameRoute
  completedChallenges: string[] // IDs de desafíos completados
  rewards: string[] // IDs de recompensas desbloqueadas
  createdAt: string
}
