"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArchetypeChallengeCard } from "@/components/archetype-challenge-card"
import { ChallengePlayer } from "@/components/challenge-player"
import { fetchArchetypes } from "@/lib/services/gameplay-service"
import type { Archetype, GameRoute, GameMode } from "@/types/game-types"
import { useFutbolContext } from "@/contexts/futbol-context"
import { Loader2 } from "lucide-react"

export default function GameplayPage() {
  const { context } = useFutbolContext()
  const [archetypes, setArchetypes] = useState<Archetype[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChallenge, setSelectedChallenge] = useState<{
    text: string
    archetype: Archetype
    routeId: GameRoute
    mode: GameMode
  } | null>(null)
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])

  // Cargar arquetipos al montar
  useEffect(() => {
    const loadArchetypes = async () => {
      setIsLoading(true)
      try {
        const data = await fetchArchetypes(context.brand.id)
        setArchetypes(data)
      } catch (error) {
        console.error("Error loading archetypes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadArchetypes()
  }, [context.brand.id])

  const handleSelectChallenge = (challenge: string, routeId: GameRoute, mode: GameMode, archetype: Archetype) => {
    setSelectedChallenge({
      text: challenge,
      archetype,
      routeId,
      mode,
    })
  }

  const handleChallengeComplete = () => {
    if (selectedChallenge) {
      setCompletedChallenges([...completedChallenges, `${selectedChallenge.archetype.id}_${selectedChallenge.routeId}`])
      setSelectedChallenge(null)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Gameplay del Clásico Regio</h1>

      {selectedChallenge ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tu Desafío</h2>
          <ChallengePlayer
            challenge={selectedChallenge.text}
            archetype={selectedChallenge.archetype}
            routeId={selectedChallenge.routeId}
            mode={selectedChallenge.mode}
            onComplete={handleChallengeComplete}
          />
        </div>
      ) : (
        <Tabs defaultValue="archetypes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="archetypes">Arquetipos</TabsTrigger>
            <TabsTrigger value="completed">Completados ({completedChallenges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="archetypes">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archetypes.map((archetype) => (
                  <ArchetypeChallengeCard
                    key={archetype.id}
                    archetype={archetype}
                    onSelectChallenge={(challenge, routeId, mode) =>
                      handleSelectChallenge(challenge, routeId, mode, archetype)
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedChallenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <p className="text-muted-foreground">Aún no has completado ningún desafío</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedChallenges.map((challengeId) => {
                  const [archetypeId, routeId] = challengeId.split("_")
                  const archetype = archetypes.find((a) => a.id === archetypeId)

                  return (
                    <Card key={challengeId}>
                      <CardHeader>
                        <CardTitle className="text-lg">Desafío completado: {archetype?.name || archetypeId}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>
                          Has completado un desafío de {archetype?.name || "arquetipo desconocido"} en la ruta{" "}
                          {routeId.replace(/_/g, " ")}.
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <div className="mt-8 p-4 bg-amber-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Cómo funciona el gameplay</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Selecciona un arquetipo</strong> - Cada arquetipo tiene su propia personalidad y desafíos
            característicos
          </li>
          <li>
            <strong>Elige una ruta</strong> - Cada arquetipo es compatible con ciertas rutas de juego (mecánicas)
          </li>
          <li>
            <strong>Selecciona un modo</strong> - Individual, dueto o grupo, según cómo quieras jugar
          </li>
          <li>
            <strong>Genera un desafío</strong> - La IA creará un desafío personalizado según el arquetipo, ruta y modo
          </li>
          <li>
            <strong>Completa el desafío</strong> - Según la ruta, podrás responder con texto, audio, video o
            participando en un quiz
          </li>
          <li>
            <strong>Desbloquea recompensas</strong> - Al completar desafíos, desbloquearás nuevos arquetipos y
            recompensas
          </li>
        </ol>
      </div>
    </div>
  )
}
