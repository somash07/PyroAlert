import type { Incident } from "@/types";
import { MapPin } from "lucide-react";

const RecentAlertCard: React.FC<{ incident: Incident }> = ({ incident }) => {
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
    <div className="p-4 shadow-md rounded-lg bg-stone-50 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div>
            <h4 className="font-semibold text-gray-800">
              {incident.alert_type === "fire"
                ? "Fire Detected"
                : "Smoke Detected"}
            </h4>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-blue-500" />
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

      <div className="text-xs text-gray-600 space-y-1">
        <p>
          <b>Time: </b>
          {new Date(incident.timestamp).toLocaleString()}
        </p>
        {incident.assigned_department && (
          <p>
            <b>Assigned to: </b>
            {incident.assigned_department.username}
          </p>
        )}
        {incident.requested_department && !incident.assigned_department && (
          <p>
            <b>Requested from: </b>{" "}
            {incident.requested_department.username}
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentAlertCard;
