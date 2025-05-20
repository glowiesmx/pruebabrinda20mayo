"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFutbolContext } from "@/contexts/futbol-context"
import { CHALLENGE_TEMPLATES } from "@/lib/templates/challenges"
import { REWARD_TEMPLATES } from "@/lib/templates/rewards"
import { resolveVariables } from "@/lib/utils/variable-resolver"
import { Mic, Send, Video } from "lucide-react"

export const DynamicChallengeCard = () => {
  const { context } = useFutbolContext()
  const [players, setPlayers] = useState(4) // Default to group
  const [isRecording, setIsRecording] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const { brand, campaign } = context
  const teamId = brand.id
  const mode = players === 1 ? "solo" : players === 2 ? "duo" : "grupo"

  // Get challenge template based on team and mode
  const challengeTemplate = CHALLENGE_TEMPLATES[teamId][mode]
  const challenge = resolveVariables(challengeTemplate, context)

  // Get reward based on team
  const reward = REWARD_TEMPLATES[teamId]

  const handleStartChallenge = () => {
    setIsRecording(true)
  }

  const handleCompleteChallenge = () => {
    setIsRecording(false)
    setIsCompleted(true)
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
        <CardTitle className="text-xl">
          {campaign.mode === "mesa"
            ? "Desafío de Mesa"
            : campaign.mode === "dueto"
              ? "Desafío en Dueto"
              : "Desafío Individual"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Jugadores:</h3>
          <div className="flex gap-2">
            <Button variant={players === 1 ? "default" : "outline"} onClick={() => setPlayers(1)}>
              Solo
            </Button>
            <Button variant={players === 2 ? "default" : "outline"} onClick={() => setPlayers(2)}>
              Dueto
            </Button>
            <Button variant={players >= 3 ? "default" : "outline"} onClick={() => setPlayers(4)}>
              Grupo
            </Button>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-2">Desafío:</h3>
          <p className="text-lg">{challenge}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Recompensa:</h3>
          <div className="flex flex-col gap-1">
            <p>🏆 Digital: {reward.digital}</p>
            <p>🥃 Físico: {reward.fisico}</p>
            <p>✨ Experiencia: {reward.experiencia}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {!isRecording && !isCompleted ? (
          <Button
            onClick={handleStartChallenge}
            style={{
              backgroundColor: brand.styles.primaryColor,
              color: brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : brand.styles.secondaryColor,
            }}
          >
            ¡Iniciar Desafío!
          </Button>
        ) : isRecording ? (
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1">
              <Mic className="mr-2 h-4 w-4" />
              Audio
            </Button>
            <Button variant="outline" className="flex-1">
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
              Enviar
            </Button>
          </div>
        ) : (
          <div className="w-full text-center p-4 bg-green-100 rounded-lg">
            <p className="text-green-800 font-semibold">¡Desafío completado!</p>
            <p className="text-sm">Recompensa desbloqueada</p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
