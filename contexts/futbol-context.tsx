"use client"

import { createContext, useContext, type ReactNode, useState } from "react"

export type TeamId = "tigres" | "rayados"
export type GameMode = "individual" | "dueto" | "mesa"
export type GameLocation = "bar" | "estadio" | "casa"
export type Emotion = "tribal" | "nostalgico" | "competitivo"

export type FutbolContext = {
  capsule: string
  brand: {
    id: TeamId
    name: string
    styles: {
      primaryColor: string
      secondaryColor: string
      font: string
      logo: string
    }
  }
  campaign: {
    emotion: Emotion
    mode: GameMode
    location: GameLocation
    difficulty: number
  }
}

type FutbolContextProviderProps = {
  children: ReactNode
  initialContext: {
    capsule: string
    brand: string
    emotion: string
    mode: string
    location: string
  }
}

const teamConfigs = {
  tigres: {
    id: "tigres" as TeamId,
    name: "Tigres UANL",
    styles: {
      primaryColor: "#FDB913", // Orange
      secondaryColor: "#000000", // Black
      font: "Montserrat",
      logo: "/placeholder.svg?height=100&width=100",
    },
  },
  rayados: {
    id: "rayados" as TeamId,
    name: "Rayados de Monterrey",
    styles: {
      primaryColor: "#003DA6", // Blue
      secondaryColor: "#FFFFFF", // White
      font: "Roboto",
      logo: "/placeholder.svg?height=100&width=100",
    },
  },
}

const defaultContext: FutbolContext = {
  capsule: "tigres_rayados",
  brand: teamConfigs.tigres,
  campaign: {
    emotion: "tribal",
    mode: "mesa",
    location: "bar",
    difficulty: 3,
  },
}

const FutbolContextContext = createContext<{
  context: FutbolContext
  updateContext: (params: Partial<FutbolContextProviderProps["initialContext"]>) => void
}>({
  context: defaultContext,
  updateContext: () => {},
})

export function FutbolContextProvider({ children, initialContext }: FutbolContextProviderProps) {
  const [context, setContext] = useState<FutbolContext>({
    capsule: initialContext.capsule,
    brand: teamConfigs[initialContext.brand as TeamId] || teamConfigs.tigres,
    campaign: {
      emotion: initialContext.emotion as Emotion,
      mode: initialContext.mode as GameMode,
      location: initialContext.location as GameLocation,
      difficulty: 3,
    },
  })

  const updateContext = (params: Partial<FutbolContextProviderProps["initialContext"]>) => {
    setContext((prev) => ({
      ...prev,
      capsule: params.capsule || prev.capsule,
      brand: params.brand ? teamConfigs[params.brand as TeamId] || prev.brand : prev.brand,
      campaign: {
        ...prev.campaign,
        emotion: (params.emotion as Emotion) || prev.campaign.emotion,
        mode: (params.mode as GameMode) || prev.campaign.mode,
        location: (params.location as GameLocation) || prev.campaign.location,
      },
    }))
  }

  return <FutbolContextContext.Provider value={{ context, updateContext }}>{children}</FutbolContextContext.Provider>
}

export const useFutbolContext = () => {
  const context = useContext(FutbolContextContext)
  if (!context) {
    throw new Error("useFutbolContext must be used within a FutbolContextProvider")
  }
  return context
}
