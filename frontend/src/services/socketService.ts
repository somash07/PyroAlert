import io from "socket.io-client"
import type { Socket } from "socket.io-client"
import { store } from "../store/store"
import { addIncident, updateIncident } from "../store/slices/incidentsSlice"
import { updateStats } from "../store/slices/dashboardSlice"
import type { FireIncident, DashboardStats } from "../types"

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 10
  private reconnectTimer: NodeJS.Timeout | null = null
  private isManuallyDisconnected = false

  connect() {
    if (this.socket?.connected) {
      console.log("🔌 Socket already connected")
      return
    }

    this.isManuallyDisconnected = false
    const serverUrl = import.meta.env.SOCKET_SERVER|| "http://localhost:8080"
    console.log("Connecting to WebSocket server:", serverUrl)

    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts,
      forceNew: false,
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server:", this.socket?.id)
      this.reconnectAttempts = 0
      this.clearReconnectTimer()

      // Join rooms
      this.socket?.emit("join-dashboard")
      this.socket?.emit("join-incidents")

      this.showNotification("Connected to real-time updates", "success")
    })

    this.socket.on("disconnect", (reason: string) => {
      console.log("Disconnected from WebSocket server:", reason)

      if (!this.isManuallyDisconnected) {
        this.showNotification("⚠️ Lost connection to real-time updates", "warning")
        this.scheduleReconnect()
      }
    })

    this.socket.on("connect_error", (error: Error) => {
      console.error("WebSocket connection error:", error)
      this.handleConnectionError()
    })

    this.socket.on("reconnect", (attemptNumber: number) => {
      console.log(`Reconnected after ${attemptNumber} attempts`)
      this.showNotification("🔌 Reconnected to real-time updates", "success")
    })

    this.socket.on("reconnect_error", (error: Error) => {
      console.error("Reconnection error:", error)
    })

    this.socket.on("reconnect_failed", () => {
      console.error("Failed to reconnect after maximum attempts")
      this.showNotification("Unable to connect to real-time updates", "error")
    })

    // Fire incident events
    this.socket.on("new-incident", (incident: FireIncident) => {
      console.log("New fire incident received:", incident)
      store.dispatch(addIncident(incident))
      this.showEmergencyNotification(incident)
      this.playAlertSound()
    })

    this.socket.on("incident-created", (incident: FireIncident) => {
      console.log("Incident created:", incident)
      store.dispatch(addIncident(incident))
    })

    this.socket.on("incident-updated", (incident: FireIncident) => {
      console.log("Incident updated:", incident)
      store.dispatch(updateIncident(incident))
    })

    // Dashboard events
    this.socket.on("dashboard-update", () => {
      console.log("Dashboard update received")
      this.requestDashboardUpdate()
    })

    this.socket.on("stats-update", (stats: DashboardStats) => {
      console.log("Stats update received:", stats)
      store.dispatch(updateStats(stats))
    })

    // Firefighter events
    this.socket.on("firefighter-added", (firefighter: unknown) => {
      console.log("Firefighter added:", firefighter)
    })

    this.socket.on("firefighter-updated", (firefighter: unknown) => {
      console.log("Firefighter updated:", firefighter)
    })

    this.socket.on("firefighters-assigned", (data: { firefighters: unknown[] }) => {
      console.log("Firefighters assigned:", data)
      this.showNotification(`👥 ${data.firefighters.length} firefighter(s) assigned to incident`, "info")
    })

    this.socket.on("firefighters-dispatched", (incident: FireIncident) => {
      console.log("Firefighters dispatched:", incident)
      this.showNotification("🚒 Emergency response team dispatched!", "success")
    })

    // System events
    this.socket.on("connected", (data: unknown) => {
      console.log("Server connection confirmed:", data)
    })
  }

  private handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isManuallyDisconnected) {
      this.scheduleReconnect()
    } else if (!this.isManuallyDisconnected) {
      this.showNotification("Unable to connect to real-time updates", "error")
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.isManuallyDisconnected) return

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // Exponential backoff, max 30s

    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.clearReconnectTimer()
      if (!this.isManuallyDisconnected) {
        this.connect()
      }
    }, delay)
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private showNotification(message: string, type: "success" | "error" | "warning" | "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".socket-notification")
    existingNotifications.forEach((notification) => notification.remove())

    const notification = document.createElement("div")
    notification.className = `socket-notification fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg text-white text-sm max-w-xs sm:max-w-sm transition-all duration-300 ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
          ? "bg-red-500"
          : type === "warning"
            ? "bg-yellow-500"
            : "bg-blue-500"
    }`
    notification.textContent = message
    document.body.appendChild(notification)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = "0"
        notification.style.transform = "translateX(100%)"
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 300)
      }
    }, 5000)
  }

  private showEmergencyNotification(incident: FireIncident) {
    const notification = document.createElement("div")
    notification.className =
      "fixed top-4 right-4 z-50 p-4 sm:p-6 rounded-lg shadow-2xl bg-red-600 text-white max-w-xs sm:max-w-md border-l-4 border-red-800 transition-all duration-300"
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 sm:h-6 sm:w-6 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm sm:text-lg font-bold">🔥 FIRE EMERGENCY</h3>
          <p class="text-xs sm:text-sm mt-1">
            <strong>Location:</strong> ${incident.location.address}<br>
            <strong>Temperature:</strong> ${incident.temperature}°C<br>
            ${incident.confidence ? `<strong>AI Confidence:</strong> ${(incident.confidence * 100).toFixed(1)}%` : ""}
          </p>
          <p class="text-xs mt-2 opacity-75">
            ${new Date(incident.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    `
    document.body.appendChild(notification)
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = "0"
        notification.style.transform = "translateX(100%)"
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 300)
      }
    }, 10000)
  }

  private playAlertSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log("Could not play alert sound:", error)
    }
  }

  private requestDashboardUpdate() {
    window.dispatchEvent(new CustomEvent("dashboard-refresh"))
  }

  disconnect() {
    this.isManuallyDisconnected = true
    this.clearReconnectTimer()

    if (this.socket) {
      console.log("Disconnecting from WebSocket server")
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit(`join-${room}`)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocket(): Socket | null {
    return this.socket
  }

  // Method to manually retry connection
  retry() {
    this.reconnectAttempts = 0
    this.clearReconnectTimer()
    this.disconnect()
    setTimeout(() => this.connect(), 1000)
  }
}

export const socketService = new SocketService()
