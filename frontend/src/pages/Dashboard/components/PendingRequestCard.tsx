import { Button } from "@/components/ui/button";
import type { Incident } from "@/types";
import { CheckCircle, MapPin, XCircle } from "lucide-react";

const PendingRequestCard: React.FC<{
  incident: Incident;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ incident, onAccept, onReject }) => {
  const getAlertIcon = (type: string) => (type === "fire" ? "🔥" : "💨");

  return (
    <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50 hover:shadow-md transition-shadow w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
        <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">
            {getAlertIcon(incident.alert_type)}
          </span>
          <div>
            <h4 className="font-semibold text-gray-800 flex flex-wrap items-center gap-2">
              {incident.alert_type === "fire" ? "Fire Detected" : "Smoke Detected"}
              <span className="px-2 py-1 bg-red-100 text-orange-800 text-xs rounded-full animate-pulse">
                ACTION REQUIRED
              </span>
              {incident.additional_info?.device_name && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  {incident.additional_info.device_name}
                </span>
              )}
            </h4>

            <p className="text-sm text-gray-600 mt-1">
              <a
                href={`https://www.google.com/maps?q=${incident.geo_location?.coordinates[1]},${incident.geo_location?.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-auto h-auto p-1 mt-1" variant="outline">
                  <MapPin className="w-3 h-3 mr-1" />
                  View on Google Maps
                </Button>
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1 mb-3">
        <p>Time: {new Date(incident.timestamp).toLocaleString()}</p>
        <p>
          Requested Station:{" "}
          {incident.requested_department?.username || "Unknown"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <Button
          onClick={() => onAccept(incident._id)}
          className="flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Accept Request
        </Button>
        <Button
          onClick={() => onReject(incident._id)}
          className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject Request
        </Button>
      </div>
    </div>
  );
};

export default PendingRequestCard;
