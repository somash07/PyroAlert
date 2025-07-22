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
    <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="text-lg mr-2">
            {getAlertIcon(incident.alert_type)}
          </span>
          <div>
            <h4 className="font-semibold text-gray-800 flex items-center">
              {incident.alert_type === "fire"
                ? "Fire Detected"
                : "Smoke Detected"} 
              <span className="ml-2 px-2 py-1 bg-red-100 text-orange-800 text-xs rounded-full animate-pulse">
                ACTION REQUIRED
              </span>

              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                {incident.additional_info?.device_name}
              </span>


            </h4>
            <p className="text-sm text-gray-600 flex items-center">
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

      <div className="text-xs text-gray-500 space-y-1 mb-3">
        <p>Confidence: {(incident.confidence * 100).toFixed(0)}%</p>
        <p>Time: {new Date(incident.timestamp).toLocaleString()}</p>
        <p>
          Requested Station:{" "}
          {incident.requested_department?.username || "Unknown"}
        </p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onAccept(incident._id)}
          className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Accept Request
        </button>
        <button
          onClick={() => onReject(incident._id)}
          className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject Request
        </button>
      </div>
    </div>
  );
};

export default PendingRequestCard;
