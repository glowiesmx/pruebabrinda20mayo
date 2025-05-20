import { RealTimeChat } from "@/components/real-time-chat"
import { RealTimePresence } from "@/components/real-time-presence"

export default function RealtimePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Supabase Realtime Demo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Real-Time Features</h2>
            <p className="mb-4 text-muted-foreground">
              This demo showcases Supabase Realtime functionality. Messages and user presence are synchronized in
              real-time across all connected clients.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Messages are stored in the Supabase database</li>
                <li>Supabase Realtime provides WebSocket connections</li>
                <li>Changes to the database are pushed to all connected clients</li>
                <li>Presence tracking shows who's currently online</li>
                <li>No need for custom WebSocket server setup</li>
              </ol>
            </div>
          </div>
          <RealTimePresence />
        </div>
        <RealTimeChat />
      </div>
    </div>
  )
}
