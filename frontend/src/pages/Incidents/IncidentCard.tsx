"use client";
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
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmAndSend } from "@/services/incidentService";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { loadActiveIncidents } from "@/store/slices/incidentsSlice";

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
  const dispatch = useDispatch<AppDispatch>();

  const storedUser = localStorage.getItem("userInfo");
  const storedUserLat = storedUser ? JSON.parse(storedUser)?.lat : null;
  const storedUserLng = storedUser ? JSON.parse(storedUser)?.lng : null;

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleString();

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

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance =
    storedUserLat &&
    storedUserLng &&
    incident.geo_location?.coordinates?.[1] !== undefined &&
    incident.geo_location?.coordinates?.[0] !== undefined
      ? calculateDistance(
          storedUserLat,
          storedUserLng,
          Number(incident.geo_location.coordinates[1]),
          Number(incident.geo_location.coordinates[0])
        ).toFixed(2)
      : null;

  const handleConfirm = async (incidentId: string) => {
    await confirmAndSend(incidentId);
    dispatch(loadActiveIncidents());
    toast.success("Notified firefighters");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-red-500">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <FireIcon className="h-6 w-6 text-red-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
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
        <p className="text-xs text-gray-500">#{incident._id.slice(-6)}</p>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />
          <p className="text-xs text-gray-500">
            Time: {formatTime(incident.timestamp)}
          </p>
        </div>
        {distance && (
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 text-green-500 mr-2" />
            <p className="text-xs text-gray-500">Distance: {distance} km</p>
          </div>
        )}
        <div className="col-span-2">
          <a
            href={`https://www.google.com/maps?q=${incident.geo_location?.coordinates[1]},${incident.geo_location?.coordinates[0]}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm">
              <MapPin className="h-3 w-3 mr-1" />
              View on Google Maps
            </Button>
          </a>
        </div>
      </div>

      {/* Extra Info */}
      <div className="text-xs text-gray-700 mb-3">
        Type:{" "}
        <strong>
          {incident.alert_type === "fire"
            ? "Fire"
            : incident.alert_type === "smoke"
            ? "Smoke"
            : "Other"}
        </strong>
        {incident.additional_info?.device_name && (
          <>
            {" "}
            | Device: <strong>{incident.additional_info.device_name}</strong>
          </>
        )}
      </div>

      {/* Buttons based on status */}
      {incident.status === "pending_response" && (
        <div className="flex gap-2">
          <Button
            onClick={() => onAccept(incident._id)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <CheckIcon className="h-4 w-4 mr-1" /> Accept
          </Button>
          <Button variant="destructive" className="text-sm">
            <XMarkIcon className="h-4 w-4 mr-1" /> Reject
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
            <ArrowRightIcon className="h-4 w-4 mr-1" /> Transfer
          </Button>
        </div>
      )}

      {incident.status === "acknowledged" && (
        <Button
          onClick={() => onAssign(incident)}
          className="bg-blue-700 hover:bg-blue-800 text-white mt-2"
        >
          <UserGroupIcon className="h-4 w-4 mr-1" />
          Assign Firefighters
        </Button>
      )}

      {incident.status === "assigned" && (
        <div className="mt-3">
          <p className="text-xs text-green-800">
            Assigned to {incident.assigned_firefighters?.length} firefighter(s)
          </p>
          <Button
            onClick={() => handleConfirm(incident._id)}
            className="mt-2 bg-green-600 text-white"
          >
            Confirm & Send to Location
          </Button>
        </div>
      )}

      {incident.status === "dispatched" && (
        <div className="mt-4 bg-green-50 p-3 rounded-md flex justify-between items-center">
          <p className="text-xs text-green-800 mb-2">Firefighters dispatched</p>
        </div>
      )}
    </div>
  );
};

export default IncidentCard;
