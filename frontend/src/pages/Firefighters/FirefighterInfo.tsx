import type React from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../store/store"
import { UserIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline"

const FirefighterInfo: React.FC = () => {
  const { firefighters, loading } = useSelector((state: RootState) => state.firefighters)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-red-100 text-red-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-300 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {firefighters.map((firefighter) => (
        <div key={firefighter.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <UserIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{firefighter.name}</h3>
                <p className="text-sm text-gray-600">{firefighter.department}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(firefighter.status)}`}>
              {firefighter.status.charAt(0).toUpperCase() + firefighter.status.slice(1)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{firefighter.email}</span>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{firefighter.contact}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FirefighterInfo
