"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useFutbolContext } from "@/contexts/futbol-context"
import { Mic, Send, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceTextChallengeProps {
  challenge: string
  maxLength?: number
  voteOptions?: string[]
  onComplete: (response: string, mediaType?: "audio" | "text") => void
}

export function VoiceTextChallenge({ challenge, maxLength = 280, voteOptions, onComplete }: VoiceTextChallengeProps) {
  const { context } = useFutbolContext()
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [textResponse, setTextResponse] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)

  const { brand } = context

  const handleStartRecording = () => {
    setIsRecording(true)

    toast({
      title: "Grabando audio",
      description: "Esta es una simulación. En una implementación real, se activaría el micrófono.",
    })
  }

  const handleCompleteAudio = () => {
    setIsRecording(false)
    setIsCompleted(true)

    // Simulamos una respuesta de audio
    onComplete("audio_response_" + Date.now(), "audio")
  }

  const handleCompleteText = () => {
    if (!textResponse.trim()) {
      toast({
        title: "Error",
        description: "Por favor, escribe una respuesta",
        variant: "destructive",
      })
      return
    }

    setIsCompleted(true)
    onComplete(textResponse, "text")
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
        <img
          src={brand.styles.logo || "/placeholder.svg?height=100&width=100"}
          alt={brand.name}
          className="h-12 w-auto"
        />
      </div>

      <CardHeader>
        <CardTitle className="text-xl">Desafío de Confesión</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Tu desafío:</h3>
            <p className="text-lg">{challenge}</p>
          </div>

          {!isCompleted ? (
            <>
              {!isRecording ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tu respuesta:</h3>
                    <Textarea
                      placeholder="Escribe tu respuesta aquí..."
                      value={textResponse}
                      onChange={(e) => setTextResponse(e.target.value)}
                      maxLength={maxLength}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-right mt-1 text-muted-foreground">
                      {textResponse.length}/{maxLength}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleStartRecording}>
                      <Mic className="mr-2 h-4 w-4" />
                      Responder con audio
                    </Button>
                    <Button
                      onClick={handleCompleteText}
                      className="flex-1"
                      style={{
                        backgroundColor: brand.styles.primaryColor,
                        color: brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : brand.styles.secondaryColor,
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Enviar texto
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-red-100 rounded-lg text-center">
                    <p className="text-red-800 font-semibold">Grabando audio...</p>
                    <p className="text-sm">Presiona Enviar cuando termines</p>
                  </div>

                  <Button
                    onClick={handleCompleteAudio}
                    className="w-full"
                    style={{
                      backgroundColor: brand.styles.primaryColor,
                      color: brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : brand.styles.secondaryColor,
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar audio
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <p className="text-green-800 font-semibold">¡Desafío completado!</p>
              <p className="text-sm">Tu respuesta ha sido enviada</p>

              {voteOptions && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Los demás jugadores pueden votar:</p>
                  <div className="flex justify-center gap-2">
                    {voteOptions.map((option) => (
                      <Button key={option} variant="outline" size="sm">
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {isCompleted && (
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Nuevo Desafío
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
