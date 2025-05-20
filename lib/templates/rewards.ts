import type { TeamId } from "@/contexts/futbol-context"

type RewardTemplates = {
  [key in TeamId]: {
    digital: string
    fisico: string
    experiencia: string
  }
}

export const REWARD_TEMPLATES: RewardTemplates = {
  tigres: {
    digital: "NFT 'Leyenda del Clásico - {date}'",
    fisico: "Shot de 'Gignac Special'",
    experiencia: "Filtro AR 'Tigre Salvaje'",
  },
  rayados: {
    digital: "NFT 'Rey del Norte - {date}'",
    fisico: "Shot de 'Palermo Power'",
    experiencia: "Filtro AR 'Rayo Explosivo'",
  },
}
