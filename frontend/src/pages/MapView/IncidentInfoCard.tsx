"use client";

import type React from "react";
import type { Firefighter, Incident } from "../../types";
import {
  XMarkIcon,
  FireIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TruckIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import {toast} from "sonner";

interface IncidentInfoCardProps {
  incident: Incident;
  assignedFirefighters: Firefighter[];
  newFirefighters?: Firefighter[]; // Added for toggle
  onClose: () => void;
}

const IncidentInfoCard: React.FC<IncidentInfoCardProps> = ({
  incident,
  assignedFirefighters,
  newFirefighters = [],
  onClose,
}) => {
  const [showNew, setShowNew] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending_response":
        return {
          color: "text-yellow-800 bg-yellow-100 border-yellow-200",
          icon: ExclamationTriangleIcon,
          label: "Pending Response",
          description: "Awaiting fire department response",
        };
      case "accepted":
        return {
          color: "text-blue-800 bg-blue-100 border-blue-200",
          icon: CheckCircleIcon,
          label: "Accepted",
          description: "Fire department has accepted the incident",
        };
      case "assigned":
        return {
          color: "text-purple-800 bg-purple-100 border-purple-200",
          icon: UserGroupIcon,
          label: "Assigned",
          description: "Firefighters have been assigned",
        };
      case "dispatched":
        return {
          color: "text-green-800 bg-green-100 border-green-200",
          icon: TruckIcon,
          label: "Dispatched",
          description: "Emergency response team is en route",
        };
      default:
        return {
          color: "text-gray-800 bg-gray-100 border-gray-200",
          icon: ExclamationTriangleIcon,
          label: status,
          description: "Status unknown",
        };
    }
  };

  //   const getPriorityLevel = () => {
  //     const temp = incident.temperature
  //     const confidence = incident.confidence || 0

  //     if (temp > 100 || confidence > 0.9) return { level: "Critical", color: "text-red-600", bg: "bg-red-50" }
  //     if (temp > 80 || confidence > 0.7) return { level: "High", color: "text-orange-600", bg: "bg-orange-50" }
  //     if (temp > 60 || confidence > 0.5) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-50" }
  //     return { level: "Low", color: "text-green-600", bg: "bg-green-50" }
  //   }

  const timeInfo = formatTime(incident.timestamp);
  const statusInfo = getStatusInfo(incident.status);
  const StatusIcon = statusInfo.icon;
  //   const priority = getPriorityLevel()
  const visibleFirefighters = showNew ? newFirefighters : assignedFirefighters;

  return (
    <div className="relative z-50 md:w-[600px] bg-white rounded-lg shadow-2xl max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="relative z-50 p-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center mb-2">
          <FireIcon className="h-8 w-8 mr-3" />
          <div>
            <h2 className="text-xl font-bold">
              {incident.alert_type === "fire"
                ? "Fire Incident"
                : "Smoke Detection"}
            </h2>
            <p className="text-red-100 text-sm">ID: #{incident._id.slice(-6)}</p>
          </div>
        </div>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium  border`}
        >
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
        </div>
      </div>

      {/* Status */}
      <div className="p-4 border-b">
        <div
          className={`flex items-center p-3 rounded-lg border ${statusInfo.color}`}
        >
          <StatusIcon className="h-5 w-5 mr-3" />
          <div>
            <p className="font-semibold">{statusInfo.label}</p>
            <p className="text-sm opacity-75">{statusInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 space-y-4">
        {/* Location */}
        <div className="flex items-start">
          <MapPinIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium text-gray-900">{incident.location}</p>
            <p className="text-xs text-gray-400">
              {incident.geo_location?.coordinates[1].toFixed(6)},{" "}
              {incident.geo_location?.coordinates[1].toFixed(6)}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start">
          <ClockIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Detected</p>
            <p className="font-medium text-gray-900">{timeInfo.time}</p>
            <p className="text-sm text-gray-600">{timeInfo.date}</p>
            <p className="text-xs text-blue-600 font-medium">
              {timeInfo.relative}
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        {(assignedFirefighters.length > 0 || newFirefighters.length > 0) && (
          <div className="flex justify-end gap-2 mt-4">
            {assignedFirefighters.length > 0 && (
              <button
                className={`text-sm px-3 py-1 rounded-md border ${
                  !showNew
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setShowNew(false)}
              >
                Assigned
              </button>
            )}
            {newFirefighters.length > 0 && (
              <button
                className={`text-sm px-3 py-1 rounded-md border ${
                  showNew
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setShowNew(true)}
              >
                New
              </button>
            )}
          </div>
        )}

        {/* Firefighter List */}
        {visibleFirefighters.length > 0 && (
          <div className="space-y-3">
            {visibleFirefighters.map((ff) => (
              <div
                key={ff._id}
                className="bg-white p-3 rounded-md border border-gray-200"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{ff.name}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      {ff.email}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {ff.contact}
                    </p>
                  </div>
                  <span
                    className={`self-start px-2 py-1 rounded-full text-xs font-medium ${
                      ff.status === "available"
                        ? "bg-green-100 text-green-800"
                        : ff.status === "busy"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ff.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Firefighters Case */}
        {visibleFirefighters.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            No firefighters in this category.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 rounded-b-lg border-t">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              const url = `https://maps.google.com/?q=${incident.geo_location?.coordinates[1]},${incident.geo_location?.coordinates[0]}`;
              window.open(url, "_blank");
            }}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            Open in Maps
          </button>
          {visibleFirefighters.length > 0 && (
            <button
              onClick={() => {
                const phoneNumbers = visibleFirefighters
                  .map((ff) => ff.contact)
                  .join(", ");
                navigator.clipboard.writeText(phoneNumbers);
                toast.success("Contacts copied to clipboard!");
              }}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              <PhoneIcon className="h-4 w-4 mr-2" />
              Copy Contacts
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentInfoCard;
