export interface Archetype {
  id: string
  name: string
  team: string
  description: string
  unlockCondition: string
  challengeModes: ("individual" | "dueto" | "grupo")[]
  stickerUrl?: string
  isUnlocked?: boolean
}
