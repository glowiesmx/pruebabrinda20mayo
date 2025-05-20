"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function AIIntegrationInfo() {
  const [hasOpenAIKey, setHasOpenAIKey] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if OpenAI API key is available
    const checkOpenAIKey = async () => {
      try {
        const response = await fetch("/api/check-openai-key")
        const data = await response.json()
        setHasOpenAIKey(data.hasKey)
      } catch (error) {
        console.error("Error checking OpenAI key:", error)
        setHasOpenAIKey(false)
      }
    }

    checkOpenAIKey()
  }, [])

  if (hasOpenAIKey === null) {
    return null // Loading state
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integración con IA</CardTitle>
        <CardDescription>Estado de la integración con OpenAI para generar desafíos dinámicos</CardDescription>
      </CardHeader>
      <CardContent>
        {hasOpenAIKey ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">OpenAI integrado correctamente</AlertTitle>
            <AlertDescription className="text-green-700">
              Los desafíos se generarán dinámicamente usando IA.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>OpenAI no configurado</AlertTitle>
            <AlertDescription>
              Se están usando desafíos predeterminados. Para habilitar la generación dinámica con IA, agrega la variable
              de entorno OPENAI_API_KEY.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
