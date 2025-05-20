"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFutbolContext } from "@/contexts/futbol-context"
import { Check, X, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuizChallengeProps {
  questions: {
    text: string
    correctAnswer: string
  }[]
  onComplete: (score: number) => void
}

export function QuizChallenge({ questions, onComplete }: QuizChallengeProps) {
  const { context } = useFutbolContext()
  const { toast } = useToast()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const { brand } = context

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer

    if (isCorrect) {
      setScore(score + 1)
      toast({
        title: "¡Correcto!",
        description: "Has acertado la pregunta",
      })
    } else {
      toast({
        title: "Incorrecto",
        description: `La respuesta correcta era: ${questions[currentQuestionIndex].correctAnswer}`,
        variant: "destructive",
      })
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setIsCompleted(true)
      onComplete(score + (isCorrect ? 1 : 0))
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

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
        <CardTitle className="text-xl">Quiz del Clásico</CardTitle>
      </CardHeader>

      <CardContent>
        {!isCompleted ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </span>
              <span className="text-sm font-medium">
                Puntuación: {score}/{questions.length}
              </span>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">{currentQuestion.text}</h3>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-3" onClick={() => handleAnswer("tigres")}>
                  Tigres UANL
                </Button>
                <Button variant="outline" className="h-auto py-3" onClick={() => handleAnswer("rayados")}>
                  Rayados de Monterrey
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <p className="text-green-800 font-semibold">¡Quiz completado!</p>
            <p className="text-lg font-bold mt-2">
              Puntuación final: {score}/{questions.length}
            </p>

            <div className="mt-4 flex justify-center">
              {score === questions.length ? (
                <div className="flex items-center text-green-600">
                  <Check className="h-5 w-5 mr-2" />
                  <span>¡Perfecto! Eres un experto del Clásico Regio</span>
                </div>
              ) : score >= questions.length / 2 ? (
                <div className="flex items-center text-amber-600">
                  <Check className="h-5 w-5 mr-2" />
                  <span>¡Bien hecho! Conoces bastante del Clásico Regio</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <X className="h-5 w-5 mr-2" />
                  <span>Necesitas estudiar más sobre el Clásico Regio</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {isCompleted && (
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Nuevo Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
