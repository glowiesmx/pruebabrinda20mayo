"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

interface Message {
  id: number
  content: string
  user_id: string
  user_name: string
  created_at: string
}

interface User {
  id: string
  name: string
  avatar_url?: string
}

export function RealTimeChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Fetch initial messages and set up real-time subscription
  useEffect(() => {
    // Fetch current user
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser({
          id: user.id,
          name: user.email?.split("@")[0] || "Anonymous",
          avatar_url: user.user_metadata?.avatar_url,
        })
      } else {
        // For demo purposes, create a random user
        setUser({
          id: `guest-${Math.random().toString(36).substring(2, 9)}`,
          name: `Guest-${Math.floor(Math.random() * 1000)}`,
        })
      }
    }

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error fetching messages",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setMessages(data || [])
    }

    fetchUser()
    fetchMessages()

    // Set up real-time subscription
    const subscription = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from("messages").insert([
        {
          content: newMessage,
          user_id: user.id,
          user_name: user.name,
        },
      ])

      if (error) throw error

      setNewMessage("")
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Real-Time Chat</span>
          <div className="flex items-center text-sm font-normal">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span>{messages.length} messages</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No messages yet. Be the first to send one!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.user_id === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex ${message.user_id === user?.id ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${message.user_name}`} />
                      <AvatarFallback>{message.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          message.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.content}
                      </div>
                      <div
                        className={`text-xs text-muted-foreground mt-1 ${
                          message.user_id === user?.id ? "text-right" : ""
                        }`}
                      >
                        {message.user_name} • {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading || !user}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !user}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
