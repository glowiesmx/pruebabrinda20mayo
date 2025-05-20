import type { FutbolContext } from "@/contexts/futbol-context"

export const resolveVariables = (template: string, context: FutbolContext) => {
  const rival = context.brand.id === "tigres" ? "Rayados" : "Tigres"
  const date = new Date().toISOString().slice(0, 10)

  return template.replace("{rival}", rival).replace("{date}", date).replace("{team}", context.brand.name)
}
