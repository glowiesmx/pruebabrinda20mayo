import { supabase } from "@/lib/supabase/client"
import type { FutbolContext } from "@/contexts/futbol-context"

export type ChallengeTemplate = {
  id: number
  title: string
  challenge_text: string
  challenge_type: string
  theme_tag: string
  emotional_tier: string
  social_trigger: string
  reward_type: string
  tone_style: string
  voice_style: string
  team_id: string
}

export type RuntimeChallenge = {
  id: string
  challenge_template_id: number
  challenge_text: string
  challenge_type: string
  theme_tag: string
  emotional_tier: string
  social_trigger: string
  reward_type: string
  reward_details?: {
    type: string
    value?: number
    name?: string
  }
}

export async function fetchChallengeTemplates(teamId: string) {
  const { data, error } = await supabase.from("challenge_templates").select("*").eq("team_id", teamId)

  if (error) {
    console.error("Error fetching challenge templates:", error)
    return []
  }

  return data as ChallengeTemplate[]
}

export async function fetchCampaign(campaignId: string) {
  const { data, error } = await supabase.from("campaigns").select("*").eq("campaign_id", campaignId).single()

  if (error) {
    console.error("Error fetching campaign:", error)
    return null
  }

  return data
}

export async function generateChallenge(
  context: FutbolContext,
  mode: "individual" | "dueto" | "grupo",
  abTestGroup = "A",
): Promise<RuntimeChallenge | null> {
  try {
    // Fetch campaign if available
    const campaign = await fetchCampaign("clasico_regio_2025")

    // Fetch challenge templates for the team
    const templates = await fetchChallengeTemplates(context.brand.id)

    if (templates.length === 0) {
      return null
    }

    // Filter templates based on campaign parameters if available
    let filteredTemplates = templates
    if (campaign) {
      filteredTemplates = templates.filter(
        (template) =>
          campaign.allowed_challenge_types.includes(template.challenge_type) &&
          campaign.allowed_theme_tags.includes(template.theme_tag) &&
          campaign.allowed_emotional_tiers.includes(template.emotional_tier),
      )
    }

    if (filteredTemplates.length === 0) {
      filteredTemplates = templates // Fallback to all templates if filtering results in empty array
    }

    // Select a random template
    const template = filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)]

    // Apply A/B testing variations if enabled
    let challengeText = template.challenge_text
    if (campaign?.ab_testing_enabled && abTestGroup === "B") {
      // Simple A/B test: make the challenge text more intense for group B
      challengeText = challengeText.replace("como si", "como si REALMENTE")
    }

    // Determine reward type based on campaign settings or template default
    const rewardType = template.reward_type

    // Create runtime challenge
    const runtimeChallenge: RuntimeChallenge = {
      id: `challenge_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      challenge_template_id: template.id,
      challenge_text: challengeText,
      challenge_type: template.challenge_type,
      theme_tag: template.theme_tag,
      emotional_tier: template.emotional_tier,
      social_trigger: template.social_trigger,
      reward_type: rewardType,
    }

    // Add reward details if applicable
    if (rewardType === "monetary_giftcard_small") {
      runtimeChallenge.reward_details = {
        type: "giftcard",
        value: 50, // 50 MXN
        name: "Tarjeta de Regalo",
      }
    } else if (rewardType === "individual_shot") {
      runtimeChallenge.reward_details = {
        type: "drink",
        name: context.brand.id === "tigres" ? "Gignac Special" : "Rayado Power",
      }
    }

    return runtimeChallenge
  } catch (error) {
    console.error("Error generating challenge:", error)
    return null
  }
}

// Modificado para permitir usuarios no autenticados en modo de demostración
export async function saveCompletedChallenge(
  userId: string,
  challenge: RuntimeChallenge,
  mode: "individual" | "dueto" | "grupo",
  teamId: string,
  recordingType?: "audio" | "video",
) {
  try {
    // Verificamos si el usuario está autenticado
    const { data: session } = await supabase.auth.getSession()

    // Si no hay usuario autenticado, usamos un ID de demostración
    const actualUserId = session?.session?.user?.id || "demo_user_" + Math.random().toString(36).substring(2, 9)

    // Para propósitos de demostración, simulamos una completación exitosa
    // sin realmente guardar en la base de datos
    console.log("Simulando completación de desafío para usuario:", actualUserId)

    // Retornamos un objeto simulado que representa la completación del desafío
    return [
      {
        id: Math.floor(Math.random() * 10000),
        user_id: actualUserId,
        challenge: challenge.challenge_text,
        mode,
        team: teamId,
        recording_type: recordingType || null,
        created_at: new Date().toISOString(),
      },
    ]
  } catch (error) {
    console.error("Error saving challenge completion:", error)
    // En modo de demostración, no propagamos el error
    // sino que retornamos un objeto simulado
    return [
      {
        id: Math.floor(Math.random() * 10000),
        user_id: "demo_user_fallback",
        challenge: challenge.challenge_text,
        mode,
        team: teamId,
        recording_type: recordingType || null,
        created_at: new Date().toISOString(),
      },
    ]
  }
}
