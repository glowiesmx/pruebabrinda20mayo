"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFutbolContext } from "@/contexts/futbol-context"
import { Mic, Send, Video, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WheelChallengeProps {
  options: {
    id: string
    text: string
  }[]
  onComplete: (selectedOption: string, mediaType?: "audio" | "video") => void
}

export function WheelChallenge({ options, onComplete }: WheelChallengeProps) {
  const { context } = useFutbolContext()
  const { toast } = useToast()
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingType, setRecordingType] = useState<"audio" | "video" | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { brand } = context

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [])

  const spinWheel = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setSelectedOption(null)

    // Número aleatorio de rotaciones (entre 2 y 5)
    const rotations = 2 + Math.random() * 3

    // Ángulo aleatorio adicional
    const extraAngle = Math.random() * 360

    // Ángulo total
    const totalAngle = rotations * 360 + extraAngle

    // Aplicar la rotación
    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)"
      wheelRef.current.style.transform = `rotate(${totalAngle}deg)`
    }

    // Calcular qué opción quedó seleccionada
    spinTimeoutRef.current = setTimeout(() => {
      setIsSpinning(false)

      // Calcular el índice de la opción seleccionada
      const segmentAngle = 360 / options.length
      const normalizedAngle = extraAngle % 360
      const selectedIndex = Math.floor(normalizedAngle / segmentAngle)

      // Índice invertido porque la rueda gira en sentido horario
      const invertedIndex = options.length - 1 - selectedIndex

      setSelectedOption(options[invertedIndex].text)

      toast({
        title: "¡Desafío seleccionado!",
        description: options[invertedIndex].text,
      })
    }, 3000)
  }

  const handleStartRecording = (type: "audio" | "video") => {
    setIsRecording(true)
    setRecordingType(type)

    toast({
      title: `Grabando ${type === "audio" ? "audio" : "video"}`,
      description: "Esta es una simulación. En una implementación real, se activaría la cámara o el micrófono.",
    })
  }

  const handleComplete = () => {
    if (!selectedOption) return

    onComplete(selectedOption, recordingType || undefined)
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
        <CardTitle className="text-xl">La Rueda del Desmadre</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center">
          {/* Rueda */}
          <div className="relative w-64 h-64 mb-6">
            {/* Indicador */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0"
              style={{
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: `20px solid ${brand.styles.primaryColor}`,
                zIndex: 10,
              }}
            ></div>

            {/* Rueda giratoria */}
            <div
              ref={wheelRef}
              className="w-full h-full rounded-full relative overflow-hidden"
              style={{
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
              }}
            >
              {options.map((option, index) => {
                const segmentAngle = 360 / options.length
                const startAngle = index * segmentAngle
                const endAngle = (index + 1) * segmentAngle

                // Alternar colores
                const bgColor = index % 2 === 0 ? brand.styles.primaryColor : brand.styles.secondaryColor
                const textColor = index % 2 === 0 ? brand.styles.secondaryColor : brand.styles.primaryColor

                return (
                  <div
                    key={option.id}
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                    style={{
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle * Math.PI) / 180)}% ${
                        50 + 50 * Math.sin((startAngle * Math.PI) / 180)
                      }%, ${50 + 50 * Math.cos((endAngle * Math.PI) / 180)}% ${
                        50 + 50 * Math.sin((endAngle * Math.PI) / 180)
                      }%)`,
                      backgroundColor: bgColor,
                      color: textColor === "#000000" ? "#FFFFFF" : textColor,
                    }}
                  >
                    <div
                      className="text-xs font-bold text-center max-w-[80px] rotate-90"
                      style={{
                        transform: `rotate(${startAngle + segmentAngle / 2}deg)`,
                        transformOrigin: "center",
                      }}
                    >
                      {option.text.split(" ").slice(0, 3).join(" ")}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {!selectedOption ? (
            <Button
              onClick={spinWheel}
              disabled={isSpinning}
              style={{
                backgroundColor: brand.styles.primaryColor,
                color: brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : brand.styles.secondaryColor,
              }}
            >
              {isSpinning ? "Girando..." : "¡Girar la Rueda!"}
            </Button>
          ) : !isRecording ? (
            <div className="space-y-4 w-full">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Tu desafío:</h3>
                <p className="text-lg">{selectedOption}</p>
              </div>

              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => handleStartRecording("audio")}>
                  <Mic className="mr-2 h-4 w-4" />
                  Audio
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleStartRecording("video")}>
                  <Video className="mr-2 h-4 w-4" />
                  Video
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                  style={{
                    backgroundColor: brand.styles.primaryColor,
                    color: brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : brand.styles.secondaryColor,
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Completar
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-4 p-3 bg-red-100 rounded-lg text-center">
                <p className="text-red-800 font-semibold">
                  {recordingType === "audio" ? "Grabando audio..." : "Grabando video..."}
                </p>
                <p className="text-sm">Presiona Enviar cuando termines</p>
              </div>
              <Button
                onClick={handleComplete}
                className="w-full"
                style={{
                  backgroundColor: brand.styles.primaryColor,
                  color: brand.styles.secondaryColor === "#000000" ? "#FFFFFF" : brand.styles.secondaryColor,
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {selectedOption && (
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Nuevo Desafío
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
