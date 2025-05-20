"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lock, Unlock, Users, User, UsersIcon } from "lucide-react"
import { useFutbolContext } from "@/contexts/futbol-context"
import { generateChallenge } from "@/lib/services/ai-service"
import type { Archetype } from "@/types/archetype"
import { useToast } from "@/hooks/use-toast"

interface ArchetypeCardProps {
  archetype: Archetype
  onSelectChallenge?: (challenge: string, mode: "individual" | "dueto" | "grupo") => void
}

export const ArchetypeCard = ({ archetype, onSelectChallenge }: ArchetypeCardProps) => {
  const { context } = useFutbolContext()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedMode, setSelectedMode] = useState<"individual" | "dueto" | "grupo" | null>(null)
  const [generatedChallenge, setGeneratedChallenge] = useState<string | null>(null)
  const { id, name, team, description, unlockCondition, challengeModes, isUnlocked = true } = archetype

  // Determine team colors
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
  }

  const colors = teamColors[team as keyof typeof teamColors]

  const handleGenerateChallenge = async (mode: "individual" | "dueto" | "grupo") => {
    if (!isUnlocked) return

    setSelectedMode(mode)
    setIsGenerating(true)
    setGeneratedChallenge(null)

    try {
      const challenge = await generateChallenge(context, archetype, mode)
      setGeneratedChallenge(challenge)
      if (onSelectChallenge) {
        onSelectChallenge(challenge, mode)
      }
    } catch (error) {
      console.error("Error generating challenge:", error)
      toast({
        title: "Error al generar desafío",
        description: "Usando desafío predeterminado",
        variant: "destructive",
      })

      // Generate a simple default challenge
      const rivalName = context.brand.id === "tigres" ? "Rayados" : "Tigres"
      const defaultChallenge = `Cuenta una anécdota sobre ${name} relacionada con ${rivalName}.`
      setGeneratedChallenge(defaultChallenge)

      if (onSelectChallenge) {
        onSelectChallenge(defaultChallenge, mode)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const getModeIcon = (mode: "individual" | "dueto" | "grupo") => {
    switch (mode) {
      case "individual":
        return <User className="h-4 w-4 mr-1" />
      case "dueto":
        return <UsersIcon className="h-4 w-4 mr-1" />
      case "grupo":
        return <Users className="h-4 w-4 mr-1" />
    }
  }

  return (
    <Card className={`overflow-hidden ${isUnlocked ? "" : "opacity-75"}`}>
      <div className="h-12 flex items-center justify-between px-4" style={{ backgroundColor: colors.primary }}>
        <Badge variant="outline" className="text-white border-white">
          {team.toUpperCase()}
        </Badge>
        {isUnlocked ? <Unlock className="h-5 w-5 text-white" /> : <Lock className="h-5 w-5 text-white" />}
      </div>

      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="mb-4">{description}</p>

        {isUnlocked && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Generar desafío:</h4>
            <div className="flex flex-wrap gap-2">
              {challengeModes.map((mode) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={selectedMode === mode ? "default" : "outline"}
                  onClick={() => handleGenerateChallenge(mode)}
                  disabled={isGenerating}
                >
                  {getModeIcon(mode)}
                  {mode === "individual" ? "Individual" : mode === "dueto" ? "Dueto" : "Grupo"}
                </Button>
              ))}
            </div>

            {isGenerating && <p className="text-sm text-muted-foreground">Generando desafío...</p>}

            {generatedChallenge && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{generatedChallenge}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        <div>
          <span className="font-semibold">Condición: </span>
          {unlockCondition.replace("complete_challenge:", "Completar desafío: ")}
        </div>
      </CardFooter>
    </Card>
  )
}
