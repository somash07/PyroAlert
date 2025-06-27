import { MapPin } from "lucide-react";
import type { Incident } from "../Dashboard";

const RecentAlertCard: React.FC<{ incident: Incident }> = ({ incident }) => {
  const getAlertIcon = (type: string) => (type === "fire" ? "🔥" : "💨");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_response":
        return "bg-orange-100 text-orange-800";
      case "acknowledged":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "unassigned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className="text-lg mr-2">
            {getAlertIcon(incident.alert_type)}
          </span>
          <div>
            <h4 className="font-semibold text-gray-800">
              {incident.alert_type === "fire"
                ? "Fire Detected"
                : "Smoke Detected"}
            </h4>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {incident.location}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
            incident.status
          )}`}
        >
          {incident.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>Confidence: {(incident.confidence * 100).toFixed(0)}%</p>
        <p>Time: {new Date(incident.timestamp).toLocaleString()}</p>
        {incident.assigned_department && (
          <p>Assigned to: {incident.assigned_department.name}</p>
        )}
        {incident.requested_department && !incident.assigned_department && (
          <p>Requested from: {incident.requested_department.username}</p>
        )}
      </div>
    </div>
  );
};


export default RecentAlertCard