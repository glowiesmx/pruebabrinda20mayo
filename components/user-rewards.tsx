"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Gift, Check } from "lucide-react"
import { useFutbolContext } from "@/contexts/futbol-context"

// Recompensas simuladas para el modo de demostración
const demoRewards = [
  {
    id: 1,
    claimed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutos atrás
    reward: {
      id: 101,
      name: "Sticker Tigre Salvaje",
      description: "Un sticker digital exclusivo",
      type: "digital",
      team_id: "tigres",
      image_url: "/placeholder.svg?height=200&width=200",
    },
  },
  {
    id: 2,
    claimed: true,
    claimed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hora atrás
    reward: {
      id: 102,
      name: "Gignac Special",
      description: "Un shot especial inspirado en el delantero estrella",
      type: "fisico",
      team_id: "tigres",
      image_url: "/placeholder.svg?height=200&width=200",
    },
  },
  {
    id: 3,
    claimed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 horas atrás
    reward: {
      id: 103,
      name: "Tarjeta de Regalo",
      description: "Una tarjeta de regalo de $50 MXN",
      type: "digital",
      value: 50,
      team_id: "tigres",
      image_url: "/placeholder.svg?height=200&width=200",
    },
  },
]

export const UserRewards = () => {
  const { context } = useFutbolContext()
  const [rewards, setRewards] = useState(demoRewards)

  const handleClaimReward = (rewardId: number) => {
    // En un entorno real, llamaríamos a la API para reclamar la recompensa
    // Para la demostración, simplemente actualizamos el estado local
    setRewards(
      rewards.map((reward) =>
        reward.id === rewardId
          ? {
              ...reward,
              claimed: true,
              claimed_at: new Date().toISOString(),
            }
          : reward,
      ),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Tus Recompensas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rewards.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Aún no tienes recompensas. ¡Completa desafíos para ganarlas!
          </p>
        ) : (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: context.brand.styles.primaryColor + "33" }}
                    >
                      <Award className="h-6 w-6" style={{ color: context.brand.styles.primaryColor }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{reward.reward.name}</h4>
                      <p className="text-sm text-gray-600">{reward.reward.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge type={reward.reward.type} teamId={reward.reward.team_id} />
                        <span className="text-xs text-gray-400">
                          {new Date(reward.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      {reward.claimed ? (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <Check className="h-4 w-4" />
                          <span>Reclamado</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleClaimReward(reward.id)}
                          style={{
                            backgroundColor: context.brand.styles.primaryColor,
                            color:
                              context.brand.styles.secondaryColor === "#000000"
                                ? "#FFFFFF"
                                : context.brand.styles.secondaryColor,
                          }}
                        >
                          Reclamar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente Badge para mostrar el tipo de recompensa
const Badge = ({ type, teamId }: { type: string; teamId: string }) => {
  let bgColor = "bg-gray-100"
  let textColor = "text-gray-800"

  switch (type) {
    case "digital":
      bgColor = "bg-blue-100"
      textColor = "text-blue-800"
      break
    case "fisico":
      bgColor = "bg-green-100"
      textColor = "text-green-800"
      break
    case "experiencia":
      bgColor = "bg-purple-100"
      textColor = "text-purple-800"
      break
  }

  return <span className={`text-xs ${bgColor} ${textColor} px-2 py-0.5 rounded-full`}>{type}</span>
}
