"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFutbolContext } from "@/contexts/futbol-context"
import { generateArchetypeChallenge, fetchGameRoute } from "@/lib/services/gameplay-service"
import type { Archetype, GameRoute, GameMode } from "@/types/game-types"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw } from "lucide-react"

interface ArchetypeChallengeCardProps {
  archetype: Archetype
  onSelectChallenge?: (challenge: string, routeId: GameRoute, mode: GameMode) => void
}

export function ArchetypeChallengeCard({ archetype, onSelectChallenge }: ArchetypeChallengeCardProps) {
  const { context } = useFutbolContext()
  const { toast } = useToast()
  const [selectedRoute, setSelectedRoute] = useState<GameRoute | null>(null)
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedChallenge, setGeneratedChallenge] = useState<string | null>(null)
  const [routeDetails, setRouteDetails] = useState<any | null>(null)

  const { id, name, team, description, compatibleRoutes, challengeModes, isUnlocked = true } = archetype

  // Determinar colores del equipo
  const teamColors = {
    tigres: {
      primary: "#FDB913",
      secondary: "#000000",
      badge: "bg-yellow-500",
    },
    rayados: {
      primary: "#003DA6",
      secondary: "#FFFFFF",
      badge: "bg-blue-700",
    },
    neutral: {
      primary: "#6200EA",
      secondary: "#FFFFFF",
      badge: "bg-purple-700",
    },
  }

  const colors = teamColors[team as keyof typeof teamColors] || teamColors.neutral

  // Cargar detalles de la ruta cuando se selecciona
  useEffect(() => {
    if (selectedRoute) {
      const loadRouteDetails = async () => {
        const details = await fetchGameRoute(selectedRoute)
        setRouteDetails(details)
      }

      loadRouteDetails()
    }
  }, [selectedRoute])

  const handleSelectRoute = (routeId: GameRoute) => {
    setSelectedRoute(routeId)
    setSelectedMode(null)
    setGeneratedChallenge(null)
  }

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode)
    setGeneratedChallenge(null)
  }

  const handleGenerateChallenge = async () => {
    if (!selectedRoute || !selectedMode) return

    setIsGenerating(true)
    setGeneratedChallenge(null)

    try {
      const challenge = await generateArchetypeChallenge(context, archetype, selectedRoute, selectedMode)
      setGeneratedChallenge(challenge)
      if (onSelectChallenge) {
        onSelectChallenge(challenge, selectedRoute, selectedMode)
      }
    } catch (error) {
      console.error("Error generating challenge:", error)
      toast({
        title: "Error al generar desafío",
        description: "No se pudo generar el desafío. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getRouteName = (routeId: GameRoute) => {
    switch (routeId) {
      case "rueda_desmadre":
        return "Rueda del Desmadre"
      case "respuesta_incomoda":
        return "Respuesta Incómoda"
      case "caos_colectivo":
        return "Caos Colectivo"
      case "karaoke_emocional":
        return "Karaoke Emocional"
      case "ritual_victoria":
        return "Ritual de Victoria"
      default:
        return routeId
    }
  }

  const getRouteIcon = (routeId: GameRoute) => {
    switch (routeId) {
      case "rueda_desmadre":
        return "🎡"
      case "respuesta_incomoda":
        return "🤐"
      case "caos_colectivo":
        return "🧠"
      case "karaoke_emocional":
        return "🎤"
      case "ritual_victoria":
        return "🏆"
      default:
        return "🎮"
    }
  }

  const getModeName = (mode: GameMode) => {
    switch (mode) {
      case "individual":
        return "Individual"
      case "dueto":
        return "Dueto"
      case "grupo":
        return "Grupo"
      default:
        return mode
    }
  }

  return (
    <Card className={`overflow-hidden ${isUnlocked ? "" : "opacity-75"}`}>
      <div className="h-12 flex items-center justify-between px-4" style={{ backgroundColor: colors.primary }}>
        <Badge variant="outline" className="text-white border-white">
          {team.toUpperCase()}
        </Badge>
        <span className="text-white font-semibold">{name}</span>
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{description}</CardTitle>
      </CardHeader>

      <CardContent>
        {isUnlocked ? (
          <div className="space-y-4">
            {/* Selección de ruta */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Selecciona una ruta:</h3>
              <div className="flex flex-wrap gap-2">
                {compatibleRoutes.map((routeId) => (
                  <Button
                    key={routeId}
                    size="sm"
                    variant={selectedRoute === routeId ? "default" : "outline"}
                    onClick={() => handleSelectRoute(routeId)}
                  >
                    <span className="mr-1">{getRouteIcon(routeId)}</span>
                    {getRouteName(routeId)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selección de modo (si hay ruta seleccionada) */}
            {selectedRoute && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Selecciona un modo:</h3>
                <div className="flex flex-wrap gap-2">
                  {challengeModes.map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      variant={selectedMode === mode ? "default" : "outline"}
                      onClick={() => handleSelectMode(mode)}
                    >
                      {getModeName(mode)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón para generar desafío */}
            {selectedRoute && selectedMode && (
              <Button
                onClick={handleGenerateChallenge}
                disabled={isGenerating}
                className="w-full"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.secondary === "#000000" ? "#FFFFFF" : colors.secondary,
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  "Generar Desafío"
                )}
              </Button>
            )}

            {/* Desafío generado */}
            {generatedChallenge && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <h3 className="text-sm font-semibold mb-1">Tu desafío:</h3>
                <p className="text-sm font-medium">{generatedChallenge}</p>
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="ghost" onClick={handleGenerateChallenge} disabled={isGenerating}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Otro
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">Arquetipo bloqueado. Completa desafíos para desbloquearlo.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        <div>
          <span className="font-semibold">Condición: </span>
          {archetype.unlockCondition.replace("complete_challenge:", "Completar desafío: ")}
        </div>
      </CardFooter>
    </Card>
  )
}
