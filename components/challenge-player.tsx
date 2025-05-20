"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFutbolContext } from "@/contexts/futbol-context"
import { fetchGameRoute, saveCompletedChallenge } from "@/lib/services/gameplay-service"
import type { Archetype, GameRoute, GameMode } from "@/types/game-types"
import { useToast } from "@/hooks/use-toast"
import { WheelChallenge } from "@/components/wheel-challenge"
import { VoiceTextChallenge } from "@/components/voice-text-challenge"
import { QuizChallenge } from "@/components/quiz-challenge"
import { Loader2 } from "lucide-react"

interface ChallengePlayerProps {
  challenge: string
  archetype: Archetype
  routeId: GameRoute
  mode: GameMode
  onComplete?: () => void
}

export function ChallengePlayer({ challenge, archetype, routeId, mode, onComplete }: ChallengePlayerProps) {
  const { context } = useFutbolContext()
  const { toast } = useToast()
  const [routeConfig, setRouteConfig] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId] = useState(`demo_user_${Math.random().toString(36).substring(2, 9)}`)

  const { brand } = context

  // Cargar configuración de la ruta
  useEffect(() => {
    const loadRouteConfig = async () => {
      setIsLoading(true)
      try {
        const config = await fetchGameRoute(routeId)
        setRouteConfig(config)
      } catch (error) {
        console.error("Error loading route config:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración del desafío",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRouteConfig()
  }, [routeId, toast])

  const handleChallengeComplete = async (result: any, mediaType?: "audio" | "video" | "text") => {
    setIsSubmitting(true)
    try {
      // Guardar completación del desafío
      await saveCompletedChallenge(userId, `challenge_${Date.now()}`, archetype.id, routeId, mode, brand.id, mediaType)

      toast({
        title: "¡Desafío completado!",
        description: `Has completado un desafío de ${archetype.name}`,
      })

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Error completing challenge:", error)

      // Even if there's an error, we'll consider it completed in demo mode
      toast({
        title: "¡Desafío completado!",
        description: `Has completado un desafío de ${archetype.name} (modo demo)`,
      })

      if (onComplete) {
        onComplete()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (!routeConfig) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">No se pudo cargar la configuración del desafío</p>
      </Card>
    )
  }

  // Renderizar el componente adecuado según el tipo de mecánica
  switch (routeConfig.mechanics.type) {
    case "random_wheel":
      return (
        <WheelChallenge
          options={routeConfig.mechanics.options || []}
          onComplete={(selectedOption, mediaType) => handleChallengeComplete({ selectedOption }, mediaType)}
        />
      )
    case "voice_or_text":
      return (
        <VoiceTextChallenge
          challenge={challenge}
          maxLength={routeConfig.mechanics.maxLength || 280}
          voteOptions={routeConfig.mechanics.voteOptions}
          onComplete={(response, mediaType) => handleChallengeComplete({ response }, mediaType)}
        />
      )
    case "quiz":
      return (
        <QuizChallenge
          questions={routeConfig.mechanics.questions || []}
          onComplete={(score) => handleChallengeComplete({ score })}
        />
      )
    case "karaoke":
    case "ritual":
      // Para karaoke y ritual, usamos el componente de voz/texto por ahora
      return (
        <VoiceTextChallenge
          challenge={challenge}
          maxLength={280}
          voteOptions={routeConfig.mechanics.voteOptions}
          onComplete={(response, mediaType) => handleChallengeComplete({ response }, mediaType)}
        />
      )
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>Desafío</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{challenge}</p>
            <Button onClick={() => handleChallengeComplete({ completed: true })} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completando...
                </>
              ) : (
                "Completar Desafío"
              )}
            </Button>
          </CardContent>
        </Card>
      )
  }
}
