"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useFutbolContext } from "@/contexts/futbol-context"
import { Copy } from "lucide-react"

interface SmartLinkGeneratorProps {
  contextParams: {
    capsule: string
    brand: string
    emotion: string
    mode: string
    location: string
  }
  setContextParams: (params: any) => void
}

export const SmartLinkGenerator = ({ contextParams, setContextParams }: SmartLinkGeneratorProps) => {
  const { updateContext } = useFutbolContext()
  const [smartLink, setSmartLink] = useState("")

  useEffect(() => {
    generateSmartLink()
  }, [contextParams])

  const generateSmartLink = () => {
    const baseUrl = "https://brinda.io/play"
    const params = new URLSearchParams()

    Object.entries(contextParams).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    setSmartLink(`${baseUrl}?${params.toString()}`)
  }

  const handleChange = (key: string, value: string) => {
    const newParams = { ...contextParams, [key]: value }
    setContextParams(newParams)
    updateContext({ [key]: value })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(smartLink)
    // You could add a toast notification here
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Equipo</Label>
          <Select value={contextParams.brand} onValueChange={(value) => handleChange("brand", value)}>
            <SelectTrigger id="brand">
              <SelectValue placeholder="Selecciona un equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tigres">Tigres UANL</SelectItem>
              <SelectItem value="rayados">Rayados de Monterrey</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emotion">Emoción</Label>
          <Select value={contextParams.emotion} onValueChange={(value) => handleChange("emotion", value)}>
            <SelectTrigger id="emotion">
              <SelectValue placeholder="Selecciona una emoción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tribal">Tribal</SelectItem>
              <SelectItem value="nostalgico">Nostálgico</SelectItem>
              <SelectItem value="competitivo">Competitivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode">Modo de Juego</Label>
          <Select value={contextParams.mode} onValueChange={(value) => handleChange("mode", value)}>
            <SelectTrigger id="mode">
              <SelectValue placeholder="Selecciona un modo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="dueto">Dueto</SelectItem>
              <SelectItem value="mesa">Mesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Select value={contextParams.location} onValueChange={(value) => handleChange("location", value)}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Selecciona una ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="estadio">Estadio</SelectItem>
              <SelectItem value="casa">Casa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="smartlink">SmartLink Generado</Label>
        <div className="flex gap-2">
          <Input id="smartlink" value={smartLink} readOnly className="flex-1" />
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
