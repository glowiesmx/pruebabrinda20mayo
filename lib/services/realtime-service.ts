export type ChallengeCompletionEvent = {
  user_id: string
  user_name: string
  team_id: string
  challenge: string
  mode: string
  timestamp: string
}

// Modificado para funcionar en modo de demostración
export async function broadcastChallengeCompletion(event: ChallengeCompletionEvent) {
  try {
    // En un entorno real, enviaríamos el evento a través de Supabase Realtime
    // Para la demostración, solo registramos el evento en la consola
    console.log("Broadcasting challenge completion:", event)

    // Simulamos un envío exitoso
    return true
  } catch (error) {
    console.error("Error broadcasting challenge completion:", error)
    return false
  }
}

export function subscribeToCompletions(callback: (event: ChallengeCompletionEvent) => void) {
  // En un entorno real, nos suscribiríamos a los eventos de Supabase Realtime
  // Para la demostración, simulamos eventos periódicos

  // Simulamos algunos eventos de ejemplo
  const demoEvents: ChallengeCompletionEvent[] = [
    {
      user_id: "demo_user_1",
      user_name: "Carlos",
      team_id: "tigres",
      challenge: "Grita un gol como si fuera la final del Mundial",
      mode: "individual",
      timestamp: new Date().toISOString(),
    },
    {
      user_id: "demo_user_2",
      user_name: "Ana",
      team_id: "rayados",
      challenge: "Canta el himno de Rayados con todo el sentimiento",
      mode: "grupo",
      timestamp: new Date().toISOString(),
    },
  ]

  // Enviamos un evento de ejemplo cada 15 segundos
  const interval = setInterval(() => {
    const randomEvent = demoEvents[Math.floor(Math.random() * demoEvents.length)]
    // Actualizamos el timestamp para que parezca reciente
    randomEvent.timestamp = new Date().toISOString()
    callback(randomEvent)
  }, 15000)

  // Retornamos una función para cancelar la suscripción
  return () => {
    clearInterval(interval)
  }
}

export function subscribeToPresence(callback: (users: any[]) => void) {
  // En un entorno real, nos suscribiríamos a la presencia de Supabase Realtime
  // Para la demostración, simulamos usuarios en línea

  // Simulamos algunos usuarios de ejemplo
  const demoUsers = [
    { id: "demo_user_1", name: "Carlos", team_id: "tigres", online_since: new Date().toISOString() },
    { id: "demo_user_2", name: "Ana", team_id: "rayados", online_since: new Date().toISOString() },
    { id: "demo_user_3", name: "Miguel", team_id: "tigres", online_since: new Date().toISOString() },
  ]

  // Enviamos la lista de usuarios inmediatamente
  setTimeout(() => {
    callback(demoUsers)
  }, 1000)

  // Actualizamos la lista cada 30 segundos
  const interval = setInterval(() => {
    // Agregamos o quitamos un usuario aleatoriamente
    if (Math.random() > 0.5 && demoUsers.length < 10) {
      const teamId = Math.random() > 0.5 ? "tigres" : "rayados"
      const names = ["Laura", "Pedro", "Sofia", "Juan", "Daniela", "Roberto"]
      const randomName = names[Math.floor(Math.random() * names.length)]
      demoUsers.push({
        id: `demo_user_${demoUsers.length + 1}`,
        name: randomName,
        team_id: teamId,
        online_since: new Date().toISOString(),
      })
    } else if (demoUsers.length > 3) {
      demoUsers.pop()
    }

    callback([...demoUsers])
  }, 30000)

  // Retornamos una función para cancelar la suscripción
  return () => {
    clearInterval(interval)
  }
}
