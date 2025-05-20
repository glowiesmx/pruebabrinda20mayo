"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase/client"

interface PresenceUser {
  id: string
  name: string
  status: "online" | "away" | "offline"
  lastSeen: string
}

export function RealTimePresence() {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    // For demo purposes, create a random user
    const userId = `user-${Math.random().toString(36).substring(2, 9)}`
    const userName = `User-${Math.floor(Math.random() * 1000)}`
    setCurrentUser({ id: userId, name: userName })

    // Set up presence channel
    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    // Handle presence state changes
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const presentUsers = Object.keys(state).map((presenceId) => {
          const userInfo = state[presenceId][0] as any
          return {
            id: presenceId,
            name: userInfo.name,
            status: userInfo.status,
            lastSeen: new Date().toISOString(),
          }
        })
        setOnlineUsers(presentUsers)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        const newUser = newPresences[0] as any
        console.log(`${newUser.name} joined`)
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        const leftUser = leftPresences[0] as any
        console.log(`${leftUser.name} left`)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            name: userName,
            status: "online",
          })
        }
      })

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Online Users</span>
          <div className="flex items-center text-sm font-normal">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span>{onlineUsers.length} online</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {onlineUsers.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">No users online</div>
        ) : (
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${user.name}`} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
                    Online
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
