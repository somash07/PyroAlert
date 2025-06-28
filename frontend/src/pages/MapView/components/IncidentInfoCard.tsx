"use client";

import type React from "react";
import type { Incident} from "../../../types";
import {
  XMarkIcon,
  FireIcon,
  MapPinIcon,
  ClockIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

interface IncidentInfoCardProps {
  incident: Incident;
  onClose: () => void;
}

const IncidentInfoCard: React.FC<IncidentInfoCardProps> = ({
  incident,
  onClose,
}) => {
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
      case "pending":
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

  const getPriorityLevel = () => {
    const temp = incident.temperature;
    const confidence = incident.confidence || 0;

    if (temp? 0 > 100 || confidence > 0.9)
      return { level: "Critical", color: "text-red-600", bg: "bg-red-50" };
    if (temp? 0 > 80 || confidence > 0.7)
      return { level: "High", color: "text-orange-600", bg: "bg-orange-50" };
    if (temp? 0 > 60 || confidence > 0.5)
      return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "Low", color: "text-green-600", bg: "bg-green-50" };
  };

  const timeInfo = formatTime(incident.timestamp);
  const statusInfo = getStatusInfo(incident.status);
  const StatusIcon = statusInfo.icon;
  const priority = getPriorityLevel();

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="relative p-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
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
                ? "🔥 Fire Incident"
                : "💨 Smoke Detection"}
            </h2>
            <p className="text-red-100 text-sm">ID: {incident._id.slice(-8)}</p>
          </div>
        </div>

        {/* Priority Badge */}
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priority.bg} ${priority.color} border`}
        >
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {priority.level} Priority
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

      {/* Main Information */}
      <div className="p-6 space-y-4">
        {/* Location */}
        <div className="flex items-start">
          <MapPinIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium text-gray-900">
              {/* {incident.location.address} */}
            </p>
            <p className="text-xs text-gray-400">
              {incident.geo_location?.coordinates[1].toFixed(6)},{" "}
              {incident.geo_location?.coordinates[0].toFixed(6)}
            </p>
          </div>
        </div>

        {/* Time Information */}
        <div className="flex items-start">
          <ClockIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Detection Time</p>
            <p className="font-medium text-gray-900">{timeInfo.time}</p>
            <p className="text-sm text-gray-600">{timeInfo.date}</p>
            <p className="text-xs text-blue-600 font-medium">
              {timeInfo.relative}
            </p>
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-start">
          <div>
            <p className="text-sm text-gray-500">Temperature</p>
            <p className="font-bold text-2xl text-red-600">
              {incident.temperature}°C
            </p>
            <p className="text-xs text-gray-500">
              {incident.temperature? > 80
                ? "🔥 Extremely High"
                : incident.temperature? > 60
                ? "🌡️ High"
                : incident.temperature? > 40
                ? "⚠️ Elevated"
                : "📊 Normal"}
            </p>
          </div>
        </div>

        {/* Distance */}
        <div className="flex items-start">
          <MapPinIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Distance from Station</p>
            <p className="font-medium text-gray-900">{incident.distance} km</p>
            <p className="text-xs text-gray-500">
              Estimated response time: {Math.ceil(incident.distance * 2)}{" "}
              minutes
            </p>
          </div>
        </div>

        {/* AI Detection Info */}
        {incident.confidence && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <CameraIcon className="h-5 w-5 text-blue-600 mr-2" />
              <p className="font-medium text-blue-900">AI Detection Details</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Confidence Level:</span>
                <span className="font-semibold text-blue-900">
                  {(incident.confidence * 100).toFixed(1)}%
                </span>
              </div>
              {incident.detectionMethod && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Detection Method:</span>
                  <span className="font-medium text-blue-900">
                    {incident.detectionMethod === "yolov8_realtime"
                      ? "YOLOv8 AI"
                      : incident.detectionMethod}
                  </span>
                </div>
              )}
              {incident.cameraName && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Camera Source:</span>
                  <span className="font-medium text-blue-900">
                    {incident.cameraName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assigned Firefighters */}
        {incident.assigned_firefighters &&
          incident.assigned_firefighters.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <UserGroupIcon className="h-5 w-5 text-green-600 mr-2" />
                <p className="font-medium text-green-900">Assigned Team</p>
              </div>
              <p className="text-sm text-green-700">
                {incident.assigned_firefighters.length} firefighter(s) assigned
                to this incident
              </p>
            </div>
          )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-gray-50 rounded-b-lg border-t">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              const url = `https://maps.google.com/?q=${incident.location.lat},${incident.location.lng}`;
              window.open(url, "_blank");
            }}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            Open in Maps
          </button>
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
