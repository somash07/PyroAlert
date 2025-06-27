import { io } from "../app"; // Import the `io` you exported from your main file

export const broadcastMessage = (event: string, payload: any) => {
  if (!io) {
    console.warn("Socket.IO server not initialized. Cannot broadcast message.")
    return
  }

  // Broadcast to all connected clients
  io.emit(event, payload)
  console.log(`Broadcasted Socket.IO message: ${event}`)
}

export const broadcastToDepartment = (departmentId: string, event: string, payload: any) => {
  if (!io) {
    console.warn("Socket.IO server not initialized. Cannot broadcast message.")
    return
  }

  // Broadcast to specific department room
  io.to(`department_${departmentId}`).emit(event, payload)
  console.log(`Broadcasted Socket.IO message to department ${departmentId}: ${event}`)
}

export const getConnectedClients = () => {
  if (!io) return 0
  return io.engine.clientsCount
}
