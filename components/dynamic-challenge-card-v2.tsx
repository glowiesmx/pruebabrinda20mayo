"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFutbolContext } from "@/contexts/futbol-context"
import { generateChallenge, saveCompletedChallenge, type RuntimeChallenge } from "@/lib/services/challenge-engine"
import { issueReward } from "@/lib/services/reward-engine"
import { broadcastChallengeCompletion } from "@/lib/services/realtime-service"
import { Mic, Send, Video, RefreshCw, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

export const DynamicChallengeCardV2 = () => {
  const { context } = useFutbolContext()
  const { toast } = useToast()
  const [challenge, setChallenge] = useState<RuntimeChallenge | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [recordingType, setRecordingType] = useState<"audio" | "video" | null>(null)
  const [mode, setMode] = useState<"individual" | "dueto" | "grupo">("individual")
  const [abTestGroup, setAbTestGroup] = useState<"A" | "B">("A")
  const [reward, setReward] = useState<any | null>(null)
  const [userId, setUserId] = useState<string>("demo_user")
  const [userName, setUserName] = useState<string>("Usuario Demo")

  // Fetch a random challenge on mount or when mode changes
  useEffect(() => {
    fetchChallenge()

    // Randomly assign A/B test group
    setAbTestGroup(Math.random() > 0.5 ? "A" : "B")

    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (session?.session?.user) {
        setUserId(session.session.user.id)
        setUserName(session.session.user.email?.split("@")[0] || "Usuario")
      } else {
        // Generate a random demo user ID and name
        const demoId = "demo_user_" + Math.random().toString(36).substring(2, 9)
        const demoNames = ["Carlos", "Ana", "Miguel", "Laura", "Pedro", "Sofia"]
        const demoName = demoNames[Math.floor(Math.random() * demoNames.length)]

        setUserId(demoId)
        setUserName(demoName)
      }
    }

    checkAuth()
  }, [mode])

  const fetchChallenge = async () => {
    setIsLoading(true)
    try {
      const newChallenge = await generateChallenge(context, mode, abTestGroup)
      setChallenge(newChallenge)
    } catch (error) {
      console.error("Error generating challenge:", error)
      toast({
        title: "Error",
        description: "No se pudo generar un desafío. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartRecording = (type: "audio" | "video") => {
    setIsRecording(true)
    setRecordingType(type)

    toast({
      title: `Grabando ${type === "audio" ? "audio" : "video"}`,
      description: "Esta es una simulación. En una implementación real, se activaría la cámara o el micrófono.",
    })
  }

  const handleCompleteChallenge = async () => {
    if (!challenge) return

    setIsLoading(true)
    try {
      // Save challenge completion (simulado en modo demo)
      const completionData = await saveCompletedChallenge(userId, challenge, mode, context.brand.id, recordingType)

      if (!completionData) {
        throw new Error("Failed to save challenge completion")
      }

      // Issue reward (simulado en modo demo)
      const rewardData = await issueReward(userId, challenge, completionData[0].id, context.brand.id)
      setReward(rewardData)

      // Broadcast completion to all connected clients (simulado en modo demo)
      await broadcastChallengeCompletion({
        user_id: userId,
        user_name: userName,
        team_id: context.brand.id,
        challenge: challenge.challenge_text,
        mode,
        timestamp: new Date().toISOString(),
      })

      setIsRecording(false)
      setIsCompleted(true)

      toast({
        title: "¡Desafío completado!",
        description: "Has desbloqueado una recompensa.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error completing challenge:", error)

      // En modo demo, continuamos a pesar del error
      setIsRecording(false)
      setIsCompleted(true)

      // Creamos una recompensa simulada
      const fallbackReward = {
        reward: {
          name: "Recompensa de Respaldo",
          description: "Una recompensa especial por completar el desafío",
          type: "digital",
        },
      }
      setReward(fallbackReward)

      toast({
        title: "¡Desafío completado!",
        description: "Modo de demostración: Has desbloqueado una recompensa simulada.",
        variant: "default",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setIsCompleted(false)
    setIsRecording(false)
    setRecordingType(null)
    setReward(null)
    fetchChallenge()
  }

  const getModeLabel = (mode: "individual" | "dueto" | "grupo") => {
    switch (mode) {
      case "individual":
        return "Desafío Individual"
      case "dueto":
        return "Desafío en Dueto"
      case "grupo":
        return "Desafío Grupal"
    }
  }

  const getSocialTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case "group_reaction":
        return "Reacción del grupo"
      case "group_vote":
        return "Votación del grupo"
      case "emotional_sync":
        return "Sincronización emocional"
      case "first_to_act":
        return "Primero en actuar"
      case "mystery_guess":
        return "Adivinar misterio"
      default:
        return trigger
    }
  }

  return (
    <Card
      className="overflow-hidden"
      style={{
        borderColor: context.brand.styles.primaryColor,
        borderWidth: "2px",
      }}
    >
      <div
        className="h-16 flex items-center justify-center"
        style={{ backgroundColor: context.brand.styles.primaryColor }}
      >
        <img
          src={context.brand.styles.logo || "/placeholder.svg?height=100&width=100"}
          alt={context.brand.name}
          className="h-12 w-auto"
        />
      </div>

      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-center">
          <span>{challenge?.title || getModeLabel(mode)}</span>
          <div className="text-xs font-normal bg-gray-100 px-2 py-1 rounded-full">Grupo {abTestGroup}</div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Jugadores:</h3>
          <div className="flex gap-2">
            <Button variant={mode === "individual" ? "default" : "outline"} onClick={() => setMode("individual")}>
              Solo
            </Button>
            <Button variant={mode === "dueto" ? "default" : "outline"} onClick={() => setMode("dueto")}>
              Dueto
            </Button>
            <Button variant={mode === "grupo" ? "default" : "outline"} onClick={() => setMode("grupo")}>
              Grupo
            </Button>
          </div>
        </div>

        {challenge ? (
          <>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-2">Desafío:</h3>
              <p className="text-lg">{challenge.challenge_text}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {challenge.challenge_type}
                </span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {challenge.theme_tag}
                </span>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  {challenge.emotional_tier}
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {getSocialTriggerLabel(challenge.social_trigger)}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Recompensa potencial:</h3>
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                <Award className="h-5 w-5 text-amber-500" />
                <div>
                  {challenge.reward_type === "monetary_giftcard_small" && <p>Tarjeta de regalo de $50 MXN</p>}
                  {challenge.reward_type === "individual_shot" && (
                    <p>Shot gratis: {context.brand.id === "tigres" ? "Gignac Special" : "Rayado Power"}</p>
                  )}
                  {challenge.reward_type === "symbolic_sticker" && <p>Sticker digital exclusivo</p>}
                  {challenge.reward_type === "group_toast" && <p>Brindis grupal especial</p>}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Cargando desafío...</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {!isRecording && !isCompleted ? (
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={() => handleStartRecording("audio")}>
              <Mic className="mr-2 h-4 w-4" />
              Audio
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleStartRecording("video")}>
              <Video className="mr-2 h-4 w-4" />
              Video
            </Button>
            <Button
              onClick={handleCompleteChallenge}
              className="flex-1"
              style={{
                backgroundColor: context.brand.styles.primaryColor,
                color:
                  context.brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : context.brand.styles.secondaryColor,
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Completar
            </Button>
          </div>
        ) : isRecording ? (
          <div className="w-full">
            <div className="mb-4 p-3 bg-red-100 rounded-lg text-center">
              <p className="text-red-800 font-semibold">
                {recordingType === "audio" ? "Grabando audio..." : "Grabando video..."}
              </p>
              <p className="text-sm">Presiona Enviar cuando termines</p>
            </div>
            <Button
              onClick={handleCompleteChallenge}
              className="w-full"
              disabled={isLoading}
              style={{
                backgroundColor: context.brand.styles.primaryColor,
                color:
                  context.brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : context.brand.styles.secondaryColor,
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-4 text-center p-4 bg-green-100 rounded-lg">
              <p className="text-green-800 font-semibold">¡Desafío completado!</p>
              {reward && <p className="text-sm">Has desbloqueado: {reward.reward?.name || "una recompensa"}</p>}
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Nuevo Desafío
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
