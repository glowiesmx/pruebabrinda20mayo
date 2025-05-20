"use client"

import { useState } from "react"
import { archetypes } from "@/lib/data/archetypes"
import { ArchetypeCard } from "@/components/archetype-card"
import { ChallengeDisplay } from "@/components/challenge-display"
import { AIIntegrationInfo } from "@/components/ai-integration-info"
import { useFutbolContext } from "@/contexts/futbol-context"

export default function ArquetiposPage() {
  const { context } = useFutbolContext()
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [selectedMode, setSelectedMode] = useState<"individual" | "dueto" | "grupo" | null>(null)

  // Filter archetypes by team
  const teamArchetypes = archetypes.filter((archetype) => archetype.team === context.brand.id)

  const handleSelectChallenge = (challenge: string, mode: "individual" | "dueto" | "grupo") => {
    setSelectedChallenge(challenge)
    setSelectedMode(mode)
  }

  const handleResetChallenge = () => {
    setSelectedChallenge(null)
    setSelectedMode(null)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Arquetipos y Desafíos</h1>

      <div className="mb-8">
        <AIIntegrationInfo />
      </div>

      {selectedChallenge && selectedMode ? (
        <div className="max-w-md mx-auto mb-8">
          <ChallengeDisplay challenge={selectedChallenge} mode={selectedMode} onReset={handleResetChallenge} />
        </div>
      ) : (
        <p className="text-center mb-8 text-muted-foreground">
          Selecciona un arquetipo y genera un desafío para comenzar
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamArchetypes.map((archetype) => (
          <ArchetypeCard key={archetype.id} archetype={archetype} onSelectChallenge={handleSelectChallenge} />
        ))}
      </div>
    </div>
  )
}
