"use client"

import { useEffect, useState } from "react"
import { subscribeToCompletions, type ChallengeCompletionEvent } from "@/lib/services/realtime-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

export const ChallengeNotifications = () => {
  const [notifications, setNotifications] = useState<ChallengeCompletionEvent[]>([])

  useEffect(() => {
    // Suscribirse a las notificaciones de desafíos completados
    const unsubscribe = subscribeToCompletions((event) => {
      setNotifications((prev) => [event, ...prev].slice(0, 5)) // Mantener solo las 5 más recientes
    })

    return () => {
      unsubscribe()
    }
  }, [])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Actividad Reciente</h3>
      </div>

      {notifications.map((notification, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                {notification.user_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{notification.user_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {notification.team_id === "tigres" ? "Tigres" : "Rayados"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Completó: "
                  {notification.challenge.length > 50
                    ? notification.challenge.substring(0, 50) + "..."
                    : notification.challenge}
                  "
                </p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notification.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
