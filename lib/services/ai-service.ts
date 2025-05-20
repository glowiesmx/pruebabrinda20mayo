import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import type { FutbolContext } from "@/contexts/futbol-context"
import type { Archetype } from "@/types/archetype"

export async function generateChallenge(
  context: FutbolContext,
  archetype: Archetype,
  mode: "individual" | "dueto" | "grupo",
): Promise<string> {
  // Check if OpenAI API key is available
  const apiKey = process.env.OPENAI_API_KEY

  // If no API key is available, use the default challenge
  if (!apiKey) {
    console.log("OpenAI API key not found, using default challenge")
    return getDefaultChallenge(context, archetype, mode)
  }

  const teamName = context.brand.id === "tigres" ? "Tigres UANL" : "Rayados de Monterrey"
  const rivalName = context.brand.id === "tigres" ? "Rayados de Monterrey" : "Tigres UANL"
  const location = context.campaign.location
  const emotion = context.campaign.emotion

  const prompt = `
    Genera un desafío de ${mode} para un juego de fútbol entre ${teamName} y ${rivalName}.
    
    Contexto:
    - Equipo: ${teamName}
    - Rival: ${rivalName}
    - Ubicación: ${location} (puede ser bar, estadio o casa)
    - Emoción principal: ${emotion} (puede ser tribal, nostálgico o competitivo)
    
    Arquetipo: "${archetype.name}" - ${archetype.description}
    
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
    - Considerar la ubicación (${location}) y la emoción (${emotion})
    - Ser divertido, atrevido pero no ofensivo
    - Tener entre 1-2 oraciones máximo
    - NO incluir instrucciones adicionales, solo el desafío
    
    Ejemplo: "Imita el festejo más icónico de tu jugador favorito cuando anotó contra ${rivalName}."
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 100,
    })

    // Clean up the response to ensure it's just the challenge
    return text.trim().replace(/^["']|["']$/g, "")
  } catch (error) {
    console.error("Error generating challenge:", error)
    return getDefaultChallenge(context, archetype, mode)
  }
}

// Fallback function in case the AI service fails
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
    },
  }

  const teamChallenges = defaultChallenges[mode][context.brand.id]
  const randomIndex = Math.floor(Math.random() * teamChallenges.length)
  return teamChallenges[randomIndex]
}
