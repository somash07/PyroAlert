import type React from "react";
import type { Incident } from "../../types";
import {
  FireIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { MapPin, ThermometerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmAndSend } from "@/services/incidentService";
import toast from "react-hot-toast";
import { useState } from "react";

interface IncidentCardProps {
  incident: Incident;
  onAccept: (id: string) => void;
  onAssign: (incident: Incident) => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onAccept,
  onAssign,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const storedUser = localStorage.getItem("userInfo");
  const storedUserLat = storedUser ? JSON.parse(storedUser)?.lat : null;
  const storedUserLng = storedUser ? JSON.parse(storedUser)?.lng : null;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    if (
      [lat1, lon1, lat2, lon2].some(
        (coord) =>
          coord === undefined ||
          isNaN(coord) ||
          Math.abs(lat1) > 90 ||
          Math.abs(lat2) > 90 ||
          Math.abs(lon1) > 180 ||
          Math.abs(lon2) > 180
      )
    ) {
      throw new Error("Invalid coordinates");
    }

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  let distance = null;
  try {
    if (
      storedUserLat !== null &&
      storedUserLng !== null &&
      incident.geo_location?.coordinates?.[1] !== undefined &&
      incident.geo_location?.coordinates?.[0] !== undefined
    ) {
      distance = calculateDistance(
        storedUserLat,
        storedUserLng,
        Number(incident.geo_location.coordinates[1]),
        Number(incident.geo_location.coordinates[0])
      ).toFixed(2);
    }
  } catch (error) {
    console.error("Distance calculation failed:", error);
  }

   function handelConfirm(incidentid: any){
    confirmAndSend(incidentid)
    setIsConfirmed(true)
    toast.success("Notified firefighters")
  } 
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-red-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <FireIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Fire Detected
            </h3>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                incident.status
              )}`}
            >
              {incident.status.charAt(0).toUpperCase() +
                incident.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs sm:text-sm text-gray-500">
            Incident #{incident._id.slice(-6)}
          </p>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center">
          <ThermometerIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Temperature</p>
            <p className="font-semibold text-sm sm:text-base">
              {incident.temperature}°C
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Time</p>
            <p className="font-semibold text-xs sm:text-sm truncate">
              {formatTime(incident.timestamp)}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Distance</p>
            <p className="font-semibold text-sm sm:text-base">
              {distance} km
            </p>
          </div>
        </div>
        <div className="flex items-center sm:col-span-1 lg:col-span-1">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs sm:text-sm truncate">
              {/* {incident.location.address} */}
               <a
                href={`https://www.google.com/maps?q=${incident.geo_location?.coordinates[1]},${incident.geo_location?.coordinates[0]}`}
                target="black"
              >
                <Button className="w-auto h-auto p-1 cursor-pointer" variant="outline">
                  <MapPin className="w-3 h-3 mr-1" />
                  View on googlemaps
                </Button>
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Detection Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">Detection Method</span>
          <p className="font-semibold text-xs sm:text-sm">
            {incident.additional_info?.detection_method === "YOLOv8"
              ? "🤖 AI Camera"
              : "📱 Manual"}
          </p>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">Detection Type</span>
          <p className="font-semibold text-xs sm:text-sm">
            {incident.alert_type === "fire"
              ? "🔥 Fire"
              : incident.alert_type === "smoke"
              ? "💨 Smoke"
              : "⚠️ Other"}
          </p>
        </div>
        {incident.additional_info?.device_name && (
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Camera</span>
            <p className="font-semibold text-xs sm:text-sm truncate">
              📹 {incident.additional_info?.device_name}
            </p>
          </div>
        )}
      </div>

      {/* AI Confidence */}
      {incident.confidence && (
        <div className="mb-4 bg-blue-50 p-3 rounded-md">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>AI Confidence:</strong>{" "}
            {(incident.confidence * 100).toFixed(1)}%
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {incident.status === "pending_response" && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => onAccept(incident._id)}
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

      {incident.status === "acknowledged" && (
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

      {incident.status === "assigned" && incident.assigned_firefighters && (
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-xs sm:text-sm text-green-800 mb-2">
            Assigned to {incident.assigned_firefighters.length} firefighter(s)
          </p>
          <button onClick={()=>handelConfirm(incident._id)} className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
            Confirm & Send to Location
          </button>
        </div>
      )}

      {isConfirmed &&(
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-xs sm:text-sm text-green-800 mb-2">
            Firefighters dispatched
          </p>
          {/* <button onClick={()=>confirmAndSend(incident._id)} className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
            Confirm & Send to Location
          </button> */}
        </div>
      )}
    </div>
  );
};

export default IncidentCard;
