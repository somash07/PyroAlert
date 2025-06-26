"use client"

import type React from "react"
import type { FireIncident } from "../../types"
import {
  FireIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"
import { ThermometerIcon } from "lucide-react"

interface IncidentCardProps {
  incident: FireIncident
  onAccept: (id: string) => void
  onAssign: (incident: FireIncident) => void
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onAccept, onAssign }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "assigned":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-red-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <FireIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Fire Detected</h3>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}
            >
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs sm:text-sm text-gray-500">Incident #{incident.id.slice(-6)}</p>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center">
          <ThermometerIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Temperature</p>
            <p className="font-semibold text-sm sm:text-base">{incident.temperature}°C</p>
          </div>
        </div>
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Time</p>
            <p className="font-semibold text-xs sm:text-sm truncate">{formatTime(incident.timestamp)}</p>
          </div>
        </div>
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Distance</p>
            <p className="font-semibold text-sm sm:text-base">{incident.distance} km</p>
          </div>
        </div>
        <div className="flex items-center sm:col-span-1 lg:col-span-1">
          <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mr-2 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">Location</p>
            <p className="font-semibold text-xs sm:text-sm truncate">{incident.location.address}</p>
          </div>
        </div>
      </div>

      {/* Detection Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">Detection Method</span>
          <p className="font-semibold text-xs sm:text-sm">
            {incident.detectionMethod === "yolov8_realtime" ? "🤖 AI Camera" : "📱 Manual"}
          </p>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">Detection Type</span>
          <p className="font-semibold text-xs sm:text-sm">
            {incident.detectionType === "fire"
              ? "🔥 Fire"
              : incident.detectionType === "smoke"
                ? "💨 Smoke"
                : "⚠️ Other"}
          </p>
        </div>
        {incident.cameraName && (
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Camera</span>
            <p className="font-semibold text-xs sm:text-sm truncate">📹 {incident.cameraName}</p>
          </div>
        )}
      </div>

      {/* AI Confidence */}
      {incident.confidence && (
        <div className="mb-4 bg-blue-50 p-3 rounded-md">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>AI Confidence:</strong> {(incident.confidence * 100).toFixed(1)}%
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {incident.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => onAccept(incident.id)}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Accept
          </button>
          <button className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
            <XMarkIcon className="h-4 w-4 mr-2" />
            Reject
          </button>
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            Transfer
          </button>
        </div>
      )}

      {incident.status === "accepted" && (
        <div className="flex">
          <button
            onClick={() => onAssign(incident)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
          >
            <UserGroupIcon className="h-4 w-4 mr-2" />
            Assign Firefighters
          </button>
        </div>
      )}

      {incident.status === "assigned" && incident.assignedFirefighters && (
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-xs sm:text-sm text-green-800 mb-2">
            Assigned to {incident.assignedFirefighters.length} firefighter(s)
          </p>
          <button className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
            Confirm & Send to Location
          </button>
        </div>
      )}
    </div>
  )
}

export default IncidentCard
