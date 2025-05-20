import type { TeamId } from "@/contexts/futbol-context"

type ChallengeTemplates = {
  [key in TeamId]: {
    solo: string
    duo: string
    grupo: string
  }
}

export const CHALLENGE_TEMPLATES: ChallengeTemplates = {
  tigres: {
    solo: "Confiesa tu peor mentira sobre {rival} usando la palabra 'Gignac'",
    duo: "¿Quién imita mejor el festejo de Gignac vs {rival}?",
    grupo: "Canten un himno alternativo contra {rival} en coro",
  },
  rayados: {
    solo: "Confiesa tu peor derrota contra {rival} usando 'Palermo'",
    duo: "¿Quién imita mejor el estilo de Palermo vs {rival}?",
    grupo: "Canten un grito de guerra contra {rival} en equipo",
  },
}
