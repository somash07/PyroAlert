
import type React from "react"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../store/store"
import { fetchDashboardStats } from "../../store/slices/dashboardSlice"
import { FireIcon, UserGroupIcon, ClockIcon, ChartBarIcon } from "@heroicons/react/24/outline"

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { stats, loading, lastUpdated } = useSelector((state: RootState) => state.dashboard)
  const { incidents } = useSelector((state: RootState) => state.incidents)

  useEffect(() => {
    // Initial fetch
    dispatch(fetchDashboardStats())

    // Listen for dashboard refresh events from WebSocket
    const handleDashboardRefresh = () => {
      console.log("📊 Dashboard refresh triggered by WebSocket")
      dispatch(fetchDashboardStats())
    }

    window.addEventListener("dashboard-refresh", handleDashboardRefresh)

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      dispatch(fetchDashboardStats())
    }, 30000)

    return () => {
      window.removeEventListener("dashboard-refresh", handleDashboardRefresh)
      clearInterval(refreshInterval)
    }
  }, [dispatch])

  // Get recent incidents (last 5)
  const recentIncidents = incidents
    .filter((incident) => ["pending", "accepted", "assigned"].includes(incident.status))
    .slice(0, 5)

  const statCards = [
    {
      title: "Active Incidents",
      value: stats.activeIncidents,
      icon: FireIcon,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      title: "Available Firefighters",
      value: stats.availableFirefighters,
      icon: UserGroupIcon,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Avg Response Time",
      value: `${stats.averageResponseTime} min`,
      icon: ClockIcon,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Incidents Today",
      value: stats.incidentsToday,
      icon: ChartBarIcon,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
  ]

  if (loading && !lastUpdated) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/3 sm:w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 sm:h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-2 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        {lastUpdated && (
          <div className="text-xs sm:text-sm text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-lg shadow-md p-4 sm:p-6 transition-all hover:shadow-lg border border-gray-200`}
            >
              <div className="flex items-center">
                <div className={`${card.color} p-2 sm:p-3 rounded-full`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm font-medium ${card.textColor} truncate`}>{card.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Fire Incidents</h2>
        <div className="space-y-3 sm:space-y-4">
          {recentIncidents.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <FireIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm sm:text-base">No recent incidents</p>
              <p className="text-xs sm:text-sm">System is monitoring for fire emergencies</p>
            </div>
          ) : (
            recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-start p-3 sm:p-4 bg-red-50 rounded-lg border-l-4 border-red-500"
              >
                <FireIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      🔥 Fire detected at {incident.location.address}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        incident.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : incident.status === "accepted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center mt-1 text-xs text-gray-500 gap-x-4 gap-y-1">
                    <span>🌡️ {incident.temperature}°C</span>
                    <span>📍 {incident.distance}km away</span>
                    <span className="hidden sm:inline">⏰ {new Date(incident.timestamp).toLocaleTimeString()}</span>
                    {incident.confidence && (
                      <span className="hidden lg:inline">🤖 {(incident.confidence * 100).toFixed(1)}% confidence</span>
                    )}
                  </div>
                  <div className="sm:hidden mt-1 text-xs text-gray-500">
                    ⏰ {new Date(incident.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
