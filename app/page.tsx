import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Sistema de Desafíos del Clásico Regio</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Una experiencia interactiva basada en la rivalidad entre Tigres y Rayados. Completa desafíos, gana recompensas
          y vive la pasión del fútbol.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#FDB913] to-[#FF9800] p-8 rounded-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Desafíos</h2>
          <p className="mb-6">
            Completa desafíos dinámicos generados con IA, personalizados según tu equipo y contexto.
          </p>
          <Link href="/desafios">
            <Button className="bg-black hover:bg-gray-800 text-white">Ver Desafíos</Button>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-[#003DA6] to-[#0056b3] p-8 rounded-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Arquetipos</h2>
          <p className="mb-6">
            Descubre y desbloquea diferentes arquetipos de aficionados según tus acciones y respuestas.
          </p>
          <Link href="/arquetipos">
            <Button className="bg-white hover:bg-gray-100 text-[#003DA6]">Ver Arquetipos</Button>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-[#6200EA] to-[#9D46FF] p-8 rounded-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Gameplay</h2>
          <p className="mb-6">
            Experimenta el gameplay completo con arquetipos, rutas y desafíos integrados en una experiencia única.
          </p>
          <Link href="/gameplay">
            <Button className="bg-white hover:bg-gray-100 text-[#6200EA]">Jugar Ahora</Button>
          </Link>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-gray-600 mb-4">¿Listo para vivir la experiencia completa?</p>
        <Link href="/realtime">
          <Button size="lg" className="bg-gradient-to-r from-[#FDB913] to-[#003DA6] text-white">
            Jugar en Tiempo Real
          </Button>
        </Link>
      </div>

      <div className="mt-12 p-6 bg-amber-50 rounded-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Sobre el Proyecto</h2>
        <p className="mb-4">
          Este sistema de desafíos utiliza tecnologías avanzadas para crear una experiencia interactiva única:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>
            <strong>Supabase Realtime</strong> para sincronización en tiempo real entre jugadores
          </li>
          <li>
            <strong>OpenAI</strong> para generar desafíos dinámicos personalizados
          </li>
          <li>
            <strong>Arquetipos de aficionados</strong> que se desbloquean según tus acciones
          </li>
          <li>
            <strong>Sistema de recompensas</strong> con stickers digitales y premios físicos
          </li>
        </ul>
        <p className="text-sm text-gray-600">
          Nota: Esta es una versión de demostración. En una implementación real, se requeriría autenticación y acceso a
          la base de datos.
        </p>
      </div>
    </div>
  )
}
