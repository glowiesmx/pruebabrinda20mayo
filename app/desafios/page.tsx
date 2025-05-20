import { DynamicChallengeCardV2 } from "@/components/dynamic-challenge-card-v2"
import { ChallengeNotifications } from "@/components/challenge-notifications"
import { UserRewards } from "@/components/user-rewards"

export default function DesafiosPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Sistema de Desafíos del Clásico Regio</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <DynamicChallengeCardV2 />
        </div>

        <div className="space-y-8">
          <ChallengeNotifications />
          <UserRewards />
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Modo de Demostración</h2>
        <p className="text-gray-700">
          Esta es una versión de demostración del sistema de desafíos. En una implementación real, las acciones se
          guardarían en la base de datos y las recompensas serían reales.
        </p>
      </div>
    </div>
  )
}
