"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFutbolContext } from "@/contexts/futbol-context"
import { Mic, Send, Video, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface ChallengeDisplayProps {
  challenge: string
  mode: "individual" | "dueto" | "grupo"
  onReset: () => void
}

export function ChallengeDisplay({ challenge, mode, onReset }: ChallengeDisplayProps) {
  const { context } = useFutbolContext()
  const [isRecording, setIsRecording] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [recordingType, setRecordingType] = useState<"audio" | "video" | null>(null)

  const { brand } = context

  const handleStartRecording = (type: "audio" | "video") => {
    setIsRecording(true)
    setRecordingType(type)
  }

  const handleCompleteChallenge = async () => {
    setIsRecording(false)
    setIsCompleted(true)

    // Save challenge completion to Supabase
    try {
      const { data: session } = await supabase.auth.getSession()
      const userId = session?.session?.user?.id || "anonymous"

      const { error } = await supabase.from("challenge_completions").insert([
        {
          user_id: userId,
          challenge: challenge,
          mode: mode,
          team: brand.id,
          recording_type: recordingType,
        },
      ])

      if (error) throw error

      // Broadcast the completion to all connected clients
      const channel = supabase.channel("challenge-completions")
      await channel.subscribe()
      channel.send({
        type: "broadcast",
        event: "challenge-completed",
        payload: {
          challenge,
          mode,
          team: brand.id,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error("Error saving challenge completion:", error)
    }
  }

  const getModeLabel = () => {
    switch (mode) {
      case "individual":
        return "Desafío Individual"
      case "dueto":
        return "Desafío en Dueto"
      case "grupo":
        return "Desafío Grupal"
    }
  }

  return (
    <Card
      className="overflow-hidden"
      style={{
        borderColor: brand.styles.primaryColor,
        borderWidth: "2px",
      }}
    >
      <div className="h-16 flex items-center justify-center" style={{ backgroundColor: brand.styles.primaryColor }}>
        <img src={brand.styles.logo || "/placeholder.svg"} alt={brand.name} className="h-12 w-auto" />
      </div>

      <CardHeader>
        <CardTitle className="text-xl">{getModeLabel()}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="bg-muted p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-2">Desafío:</h3>
          <p className="text-lg">{challenge}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Instrucciones:</h3>
          <p>
            {mode === "individual"
              ? "Completa este desafío individualmente."
              : mode === "dueto"
                ? "Completa este desafío con otra persona."
                : "Completa este desafío con tu grupo."}
          </p>
          <p className="mt-2">
            Puedes grabar tu respuesta en audio o video, o simplemente marcar como completado cuando termines.
          </p>
        </div>
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
                backgroundColor: brand.styles.primaryColor,
                color: brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : brand.styles.secondaryColor,
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
              style={{
                backgroundColor: brand.styles.primaryColor,
                color: brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : brand.styles.secondaryColor,
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-4 text-center p-4 bg-green-100 rounded-lg">
              <p className="text-green-800 font-semibold">¡Desafío completado!</p>
              <p className="text-sm">Has desbloqueado una recompensa</p>
            </div>
            <Button onClick={onReset} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Nuevo Desafío
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
