

import type React from "react"
import { useState, useEffect } from "react"
import { socketService } from "../../services/socketService"
import FireStationSidebar from "./FireStationDashboardSidebar"
import Dashboard from "@/pages/Dashboard/Dashboard"
import Incidents from "@/pages/Incidents/Incidents"
import Firefighters from "@/pages/Firefighters/Firefighters"
import MapView from "@/pages/MapView/MapView"
import History from "@/pages/History/History"
import { Settings } from "lucide-react"

const FireStationDashboardLayout: React.FC = () => {
  const [activeView, setActiveView] = useState("dashboard")
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  useEffect(() => {
    // Initialize WebSocket connection
    console.log("🔌 Initializing WebSocket connection...")
    socketService.connect()

    // Check connection status periodically
    const checkConnection = () => {
      const connected = socketService.isConnected()
      setIsSocketConnected(connected)

      if (!connected) {
        setConnectionAttempts((prev) => prev + 1)
      } else {
        setConnectionAttempts(0)
      }
    }

    const connectionInterval = setInterval(checkConnection, 2000)

    // Initial check
    checkConnection()

    // Cleanup on unmount
    return () => {
      clearInterval(connectionInterval)
    }
  }, [])

  const handleRetryConnection = () => {
    console.log("🔄 Manual retry connection...")
    socketService.retry()
    setConnectionAttempts(0)
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />
      case "incidents":
        return <Incidents />
      case "firefighters":
        return <Firefighters />
      case "map":
        return <MapView />
      case "history":
        return <History />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 w-screen">
      <FireStationSidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main content area */}
      <div className="flex-1 overflow-auto relative lg:ml-0">
        {/* Connection Status Indicator */}
        <div className="fixed top-4 right-4 z-30">
          <div
            className={`flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
              isSocketConnected
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${isSocketConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="hidden sm:inline">{isSocketConnected ? "Live Updates" : "⚠️ Disconnected"}</span>
            <span className="sm:hidden">{isSocketConnected ? "🔌" : "⚠️"}</span>
          </div>

          {/* Retry button for failed connections */}
          {!isSocketConnected && connectionAttempts > 3 && (
            <button
              onClick={handleRetryConnection}
              className="mt-2 w-full px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>

        {/* Content with proper padding for mobile */}
        <div className="pt-16 lg:pt-0">{renderContent()}</div>
      </div>
    </div>
  )
}

export default FireStationDashboardLayout
