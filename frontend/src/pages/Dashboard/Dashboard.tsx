import React, { useEffect, useState } from "react"
import { Flame, Users, Clock, CalendarDays, MapPin, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { fetchActiveIncidents, fetchPendingIncidents } from "../../services/incidentService"
import { io, Socket } from "socket.io-client"
import toast from "react-hot-toast"

interface Incident {
  _id: string
  location: string
  alert_type: "fire" | "smoke"
  timestamp: string
  confidence: number
  status: string
  assigned_department?: {
    name: string
    address: string
  }
  requested_department?: {
    name: string
    address: string
  }
  action_required?: boolean
}

const StatCard: React.FC<{
  title: string
  value: string | number
  icon: React.ElementType
  description: string
  color: string
}> = ({ title, value, icon: Icon, description, color }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{description}</p>
  </div>
)

const PendingRequestCard: React.FC<{
  incident: Incident
  onAccept: (id: string) => void
  onReject: (id: string) => void
}> = ({ incident, onAccept, onReject }) => {
  const getAlertIcon = (type: string) => (type === "fire" ? "🔥" : "💨")

  return (
    <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="text-lg mr-2">{getAlertIcon(incident.alert_type)}</span>
          <div>
            <h4 className="font-semibold text-gray-800 flex items-center">
              {incident.alert_type === "fire" ? "Fire Detected" : "Smoke Detected"}
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full animate-pulse">
                ACTION REQUIRED
              </span>
            </h4>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {incident.location}
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1 mb-3">
        <p>Confidence: {(incident.confidence * 100).toFixed(0)}%</p>
        <p>Time: {new Date(incident.timestamp).toLocaleString()}</p>
        <p>Requested Department: {incident.requested_department?.name || "Unknown"}</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onAccept(incident._id)}
          className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Accept Request
        </button>
        <button
          onClick={() => onReject(incident._id)}
          className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject Request
        </button>
      </div>
    </div>
  )
}

const RecentAlertCard: React.FC<{ incident: Incident }> = ({ incident }) => {
  const getAlertIcon = (type: string) => (type === "fire" ? "🔥" : "💨")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_response":
        return "bg-orange-100 text-orange-800"
      case "acknowledged":
        return "bg-blue-100 text-blue-800"
      case "assigned":
        return "bg-purple-100 text-purple-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "unassigned":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className="text-lg mr-2">{getAlertIcon(incident.alert_type)}</span>
          <div>
            <h4 className="font-semibold text-gray-800">
              {incident.alert_type === "fire" ? "Fire Detected" : "Smoke Detected"}
            </h4>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {incident.location}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(incident.status)}`}>
          {incident.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>Confidence: {(incident.confidence * 100).toFixed(0)}%</p>
        <p>Time: {new Date(incident.timestamp).toLocaleString()}</p>
        {incident.assigned_department && <p>Assigned to: {incident.assigned_department.name}</p>}
        {incident.requested_department && !incident.assigned_department && (
          <p>Requested from: {incident.requested_department.name}</p>
        )}
      </div>
    </div>
  )
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeIncidents: 0,
    pendingRequests: 0,
    availableFirefighters: 27,
    averageResponseTime: "12m 30s",
    incidentsToday: 0,
  })
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([])
  const [pendingRequests, setPendingRequests] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)

  const loadIncidents = async () => {
    try {
      const [activeResponse, pendingResponse] = await Promise.all([fetchActiveIncidents(), fetchPendingIncidents()])
      const activeIncidents = activeResponse.data
      const pendingIncidents = pendingResponse.data

      setRecentIncidents([...pendingIncidents, ...activeIncidents].slice(0, 5))
      setPendingRequests(pendingIncidents)

      setStats((prev) => ({
        ...prev,
        activeIncidents: activeIncidents.length,
        pendingRequests: pendingIncidents.length,
        incidentsToday: [...activeIncidents, ...pendingIncidents].filter((incident) => {
          const today = new Date()
          const incidentDate = new Date(incident.timestamp)
          return incidentDate.toDateString() === today.toDateString()
        }).length,
      }))
    } catch (error) {
      console.error("Failed to fetch incidents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (incidentId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/alerts/${incidentId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          department_id: "current_department_id",
          notes: "Request accepted from dashboard",
        }),
      })
      if (response.ok) {
        toast.success("Incident request accepted successfully")
        loadIncidents()
      } else {
        toast.error("Failed to accept incident request")
      }
    } catch (error) {
      toast.error("Error accepting incident request")
    }
  }

  const handleRejectRequest = async (incidentId: string) => {
    const reason = window.prompt("Please provide a reason for rejection:")
    if (!reason) return

    try {
      const response = await fetch(`http://localhost:8080/api/alerts/${incidentId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          department_id: "current_department_id",
          notes: reason,
        }),
      })
      if (response.ok) {
        toast.success("Incident request rejected and reassigned")
        loadIncidents()
      } else {
        toast.error("Failed to reject incident request")
      }
    } catch (error) {
      toast.error("Error rejecting incident request")
    }
  }

  useEffect(() => {
    loadIncidents()

    const socket: Socket = io("http://localhost:8080")

    socket.on("NEW_INCIDENT_REQUEST", (newIncident: Incident) => {
      console.log("New incident request received:", newIncident)

      if (newIncident.action_required) {
        setPendingRequests((prev) => [newIncident, ...prev])
        setStats((prev) => ({
          ...prev,
          pendingRequests: prev.pendingRequests + 1,
          incidentsToday: prev.incidentsToday + 1,
        }))
        toast.error(`🚨 New ${newIncident.alert_type} request at ${newIncident.location}`, {
          description: `Confidence: ${(newIncident.confidence * 100).toFixed(0)}% - Action Required!`,
          duration: 15000,
        })
      }

      setRecentIncidents((prev) => [newIncident, ...prev.slice(0, 4)])
    })

    socket.on("INCIDENT_ACCEPTED", (acceptedIncident: Incident) => {
      setPendingRequests((prev) => prev.filter((inc) => inc._id !== acceptedIncident._id))
      setStats((prev) => ({
        ...prev,
        pendingRequests: Math.max(0, prev.pendingRequests - 1),
        activeIncidents: prev.activeIncidents + 1,
      }))
      toast.success(`Incident accepted by ${acceptedIncident.assigned_department?.name}`)
    })

    socket.on("INCIDENT_REASSIGNED", (reassignedIncident: Incident) => {
      if (reassignedIncident.action_required) {
        setPendingRequests((prev) => [
          reassignedIncident,
          ...prev.filter((inc) => inc._id !== reassignedIncident._id),
        ])
        toast(`Incident reassigned to ${reassignedIncident.requested_department?.name}`)
      }
    })

    socket.on("INCIDENT_UNASSIGNED", (unassignedIncident: Incident) => {
      setPendingRequests((prev) => prev.filter((inc) => inc._id !== unassignedIncident._id))
      setStats((prev) => ({
        ...prev,
        pendingRequests: Math.max(0, prev.pendingRequests - 1),
      }))
      toast.error("Incident rejected by all nearby departments - manual intervention required")
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  if (loading) return <div className="p-4">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      {/* HEADER + STATS */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Fire Department Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon={AlertTriangle} description="Awaiting your response" color="text-orange-500" />
        <StatCard title="Active Incidents" value={stats.activeIncidents} icon={Flame} description="Currently ongoing" color="text-red-500" />
        <StatCard title="Available Firefighters" value={stats.availableFirefighters} icon={Users} description="Ready for deployment" color="text-green-500" />
        <StatCard title="Avg. Response Time" value={stats.averageResponseTime} icon={Clock} description="Last 24 hours" color="text-blue-500" />
        <StatCard title="Incidents Today" value={stats.incidentsToday} icon={CalendarDays} description="Total reported today" color="text-purple-500" />
      </div>

      {/* PENDING REQUESTS */}
      {pendingRequests.length > 0 && (
        <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-orange-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Pending Incident Requests ({pendingRequests.length})
            </h2>
            <div className="flex items-center text-sm text-orange-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
              Action Required
            </div>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((incident) => (
              <PendingRequestCard
                key={incident._id}
                incident={incident}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            ))}
          </div>
        </div>
      )}

      {/* RECENT INCIDENTS */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Recent Alerts</h2>
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Updates
          </div>
        </div>

        {recentIncidents.length > 0 ? (
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <RecentAlertCard key={incident._id} incident={incident} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recent alerts to display</p>
            <p className="text-sm text-gray-400">Real-time alerts will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
