"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WheelChallenge } from "@/components/wheel-challenge"
import { VoiceTextChallenge } from "@/components/voice-text-challenge"
import { QuizChallenge } from "@/components/quiz-challenge"
import { useToast } from "@/hooks/use-toast"

export default function RutasPage() {
  const { toast } = useToast()
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])

  const handleChallengeComplete = (routeId: string, result: any) => {
    setCompletedChallenges([...completedChallenges, routeId])

    toast({
      title: "¡Desafío completado!",
      description: "Has desbloqueado una recompensa",
    })

    console.log(`Desafío ${routeId} completado:`, result)
  }

  // Opciones para la rueda del desmadre
  const wheelOptions = [
    { id: "cantalo", text: "Canta tu grito de gol en karaoke" },
    { id: "imitalo", text: "Imita el festejo de Gignac" },
    { id: "confiesa", text: "Di tu frase más ardida contra el rival" },
    { id: "baila", text: "Baila como si tu equipo hubiera ganado el clásico" },
    { id: "narra", text: "Narra el gol más importante de tu equipo" },
    { id: "insulta", text: "Di el apodo más creativo para el equipo rival" },
  ]

  // Preguntas para el quiz
  const quizQuestions = [
    {
      text: "¿Quién dijo: '¡Rayados nunca aprenden!'?",
      correctAnswer: "tigres",
    },
    {
      text: "¿Qué equipo tiene más títulos en la última década?",
      correctAnswer: "tigres",
    },
    {
      text: "¿Qué equipo tiene el estadio más grande?",
      correctAnswer: "rayados",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Rutas de Desafío</h1>

      <Tabs defaultValue="rueda_desmadre" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rueda_desmadre">Rueda del Desmadre</TabsTrigger>
          <TabsTrigger value="respuesta_incomoda">Respuesta Incómoda</TabsTrigger>
          <TabsTrigger value="caos_colectivo">Caos Colectivo</TabsTrigger>
        </TabsList>

        <TabsContent value="rueda_desmadre">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Rueda del Desmadre</CardTitle>
                <CardDescription>
                  Gira la rueda y acepta el desafío que te toque. ¡La suerte decidirá tu destino!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Esta ruta desbloquea el arquetipo <strong>El Comentarista de Bar</strong>. Completa el desafío que te
                  asigne la rueda para desbloquearlo.
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-800 font-bold">1</span>
                  </div>
                  <p>Gira la rueda</p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-800 font-bold">2</span>
                  </div>
                  <p>Completa el desafío que te toque</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-800 font-bold">3</span>
                  </div>
                  <p>Desbloquea el arquetipo y una recompensa</p>
                </div>
              </CardContent>
            </Card>

            <WheelChallenge
              options={wheelOptions}
              onComplete={(selectedOption, mediaType) =>
                handleChallengeComplete("rueda_desmadre", { selectedOption, mediaType })
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="respuesta_incomoda">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Respuesta Incómoda</CardTitle>
                <CardDescription>
                  Confiesa algo que nunca le dirías a otro aficionado. ¡La honestidad te liberará!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Esta ruta desbloquea el arquetipo <strong>El Rival Secreto</strong>. Responde con sinceridad para
                  desbloquearlo.
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-800 font-bold">1</span>
                  </div>
                  <p>Responde a la pregunta incómoda</p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-800 font-bold">2</span>
                  </div>
                  <p>Puedes responder por texto o audio</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-800 font-bold">3</span>
                  </div>
                  <p>Los demás jugadores votarán tu respuesta</p>
                </div>
              </CardContent>
            </Card>

            <VoiceTextChallenge
              challenge="Confiesa la peor mentira que dijiste para ocultar tu afición al otro equipo."
              maxLength={280}
              voteOptions={["😳", "🤣"]}
              onComplete={(response, mediaType) =>
                handleChallengeComplete("respuesta_incomoda", { response, mediaType })
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="caos_colectivo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Caos Colectivo</CardTitle>
                <CardDescription>
                  Pon a prueba tu conocimiento sobre el Clásico Regio. ¿Quién dijo qué? ¿Qué equipo hizo qué?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Esta ruta desbloquea el arquetipo <strong>El Villamelón</strong>. Responde correctamente para
                  desbloquearlo.
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-800 font-bold">1</span>
                  </div>
                  <p>Responde a las preguntas del quiz</p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-800 font-bold">2</span>
                  </div>
                  <p>Acumula puntos para tu equipo</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-800 font-bold">3</span>
                  </div>
                  <p>Desbloquea el arquetipo según tu puntuación</p>
                </div>
              </CardContent>
            </Card>

            <QuizChallenge
              questions={quizQuestions}
              onComplete={(score) => handleChallengeComplete("caos_colectivo", { score })}
            />
          </div>
        </TabsContent>
      </Tabs>

      {completedChallenges.length > 0 && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Desafíos completados</h2>
          <ul className="list-disc list-inside">
            {completedChallenges.map((routeId) => (
              <li key={routeId} className="text-green-700">
                {routeId === "rueda_desmadre"
                  ? "Rueda del Desmadre"
                  : routeId === "respuesta_incomoda"
                    ? "Respuesta Incómoda"
                    : "Caos Colectivo"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
