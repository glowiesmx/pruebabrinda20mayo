import { supabase } from "@/lib/supabase/client"
import type { RuntimeChallenge } from "./challenge-engine"

export type Reward = {
  id: number
  name: string
  description: string
  type: string
  team_id: string
  value?: number
  image_url?: string
}

export async function fetchRewards(teamId: string) {
  const { data, error } = await supabase.from("rewards").select("*").eq("team_id", teamId)

  if (error) {
    console.error("Error fetching rewards:", error)
    return []
  }

  return data as Reward[]
}

export async function fetchUserRewards(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_rewards")
      .select(`
        id,
        claimed,
        claimed_at,
        created_at,
        rewards (
          id,
          name,
          description,
          type,
          team_id,
          value,
          image_url
        )
      `)
      .eq("user_id", userId)

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching user rewards:", error)
    return []
  }
}

// Modificado para funcionar en modo de demostración
export async function issueReward(
  userId: string,
  challenge: RuntimeChallenge,
  challengeCompletionId: number,
  teamId: string,
) {
  try {
    // Verificamos si el usuario está autenticado
    const { data: session } = await supabase.auth.getSession()

    // Si no hay usuario autenticado, usamos un ID de demostración
    const actualUserId = session?.session?.user?.id || "demo_user_" + Math.random().toString(36).substring(2, 9)

    // Para propósitos de demostración, simulamos una recompensa
    console.log("Simulando emisión de recompensa para usuario:", actualUserId)

    // Determinamos el tipo de recompensa basado en el desafío
    let rewardName, rewardDescription, rewardType, rewardValue, rewardImageUrl

    switch (challenge.reward_type) {
      case "monetary_giftcard_small":
        rewardName = "Tarjeta de Regalo"
        rewardDescription = "Una tarjeta de regalo de $50 MXN"
        rewardType = "digital"
        rewardValue = 50
        rewardImageUrl = "/placeholder.svg?height=200&width=200"
        break
      case "individual_shot":
        rewardName = teamId === "tigres" ? "Gignac Special" : "Rayado Power"
        rewardDescription = `Un shot especial de ${rewardName}`
        rewardType = "fisico"
        rewardValue = null
        rewardImageUrl = "/placeholder.svg?height=200&width=200"
        break
      case "symbolic_sticker":
        rewardName = teamId === "tigres" ? "Sticker Tigre Salvaje" : "Sticker Rayo Explosivo"
        rewardDescription = "Un sticker digital exclusivo"
        rewardType = "digital"
        rewardValue = null
        rewardImageUrl = "/placeholder.svg?height=200&width=200"
        break
      case "group_toast":
        rewardName = "Brindis Grupal"
        rewardDescription = "Un brindis especial con todo el grupo"
        rewardType = "experiencia"
        rewardValue = null
        rewardImageUrl = "/placeholder.svg?height=200&width=200"
        break
      default:
        rewardName = "Recompensa Misteriosa"
        rewardDescription = "Una recompensa especial"
        rewardType = "digital"
        rewardValue = null
        rewardImageUrl = "/placeholder.svg?height=200&width=200"
    }

    // Retornamos un objeto simulado que representa la recompensa
    return {
      id: Math.floor(Math.random() * 10000),
      user_id: actualUserId,
      challenge_completion_id: challengeCompletionId,
      claimed: false,
      created_at: new Date().toISOString(),
      reward: {
        id: Math.floor(Math.random() * 10000),
        name: rewardName,
        description: rewardDescription,
        type: rewardType,
        team_id: teamId,
        value: rewardValue,
        image_url: rewardImageUrl,
      },
    }
  } catch (error) {
    console.error("Error issuing reward:", error)
    // En modo de demostración, no propagamos el error
    // sino que retornamos un objeto simulado
    return {
      id: Math.floor(Math.random() * 10000),
      user_id: "demo_user_fallback",
      challenge_completion_id: challengeCompletionId,
      claimed: false,
      created_at: new Date().toISOString(),
      reward: {
        id: Math.floor(Math.random() * 10000),
        name: "Recompensa de Respaldo",
        description: "Una recompensa de respaldo",
        type: "digital",
        team_id: teamId,
        value: null,
        image_url: "/placeholder.svg?height=200&width=200",
      },
    }
  }
}

export async function claimReward(userRewardId: number) {
  try {
    const { data, error } = await supabase
      .from("user_rewards")
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", userRewardId)
      .select()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error claiming reward:", error)
    return null
  }
}
