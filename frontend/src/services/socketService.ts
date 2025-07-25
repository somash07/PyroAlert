import { io, type Socket } from "socket.io-client"

const SOCKET_URL = "https://pyroalert-tdty.onrender.com"

class SocketIOService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000

  connect(departmentId?: string) {
    if (this.socket && this.socket.connected) {
      console.log("Socket.IO already connected")
      return
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    })

    this.socket.on("connect", () => {
      console.log("Socket.IO connected:", this.socket?.id)
      this.reconnectAttempts = 0

      // Join department-specific room if provided
      if (departmentId) {
        this.socket?.emit("join_department", departmentId)
      }
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason)
      this.attemptReconnect()
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error)
      this.attemptReconnect()
    })

    this.socket.on("connection_ack", (data) => {
      console.log("Socket.IO connection acknowledged:", data)
    })

    // Handle all custom events
    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    // List of events to listen for
    const events = [
      "NEW_INCIDENT_REQUEST",
      "INCIDENT_ACCEPTED",
      "INCIDENT_REASSIGNED",
      "INCIDENT_UNASSIGNED",
      "INCIDENT_UPDATED",
      "DEPARTMENT_INCIDENT_REQUEST",
      "COMPLETED_INCIDENT"
    ]

    events.forEach((event) => {
      this.socket?.on(event, (data) => {
        console.log(`Socket.IO event received: ${event}`, data)
        const callbacks = this.listeners.get(event) || []
        callbacks.forEach((callback) => callback(data))
      })
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => this.connect(), this.reconnectInterval)
    } else {
      console.error("Max reconnection attempts reached")
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data)
    } else {
      console.error("Socket.IO not connected. Cannot emit event.")
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.listeners.clear()
    this.reconnectAttempts = 0
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

export const socketService = new SocketIOService()
