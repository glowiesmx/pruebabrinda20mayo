import type { FutbolContext } from "@/contexts/futbol-context"
import { CHALLENGE_TEMPLATES } from "@/lib/templates/challenges"
import { REWARD_TEMPLATES } from "@/lib/templates/rewards"
import { resolveVariables } from "@/lib/utils/variable-resolver"

type Challenge = {
  prompt: string
  type: "voice" | "text" | "voice_or_text" | "video"
  reward: {
    digital: string
    fisico: string
    experiencia: string
  }
}

export class ClasicoEngine {
  private currentContext: FutbolContext

  constructor(context: FutbolContext) {
    this.currentContext = context
  }

  generateChallenge(players: number): Challenge {
    const templates = CHALLENGE_TEMPLATES[this.currentContext.brand.id]

    if (players === 1) return this.generateSoloChallenge(templates.solo)
    if (players === 2) return this.generateDuoChallenge(templates.duo)
    return this.generateGroupChallenge(templates.grupo)
  }

  private generateSoloChallenge(template: string): Challenge {
    return {
      prompt: resolveVariables(template, this.currentContext),
      type: "voice_or_text",
      reward: this.getTeamReward(),
    }
  }

  private generateDuoChallenge(template: string): Challenge {
    return {
      prompt: resolveVariables(template, this.currentContext),
      type: "video",
      reward: this.getTeamReward(),
    }
  }

  private generateGroupChallenge(template: string): Challenge {
    return {
      prompt: resolveVariables(template, this.currentContext),
      type: "voice_or_text",
      reward: this.getTeamReward(),
    }
  }

  private getTeamReward(): {
    digital: string
    fisico: string
    experiencia: string
  } {
    const rewards = REWARD_TEMPLATES[this.currentContext.brand.id]

    return {
      digital: resolveVariables(rewards.digital, this.currentContext),
      fisico: resolveVariables(rewards.fisico, this.currentContext),
      experiencia: resolveVariables(rewards.experiencia, this.currentContext),
    }
  }

  private getRivalTeam(): string {
    return this.currentContext.brand.id === "tigres" ? "Rayados" : "Tigres"
  }
}
