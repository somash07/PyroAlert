import { Button } from "@/components/ui/button";
import type { Incident } from "@/types";
import { FireIcon } from "@heroicons/react/24/outline";
import { CheckCircle, MapPin, XCircle } from "lucide-react";
import { GiSmokeBomb } from "react-icons/gi";

const PendingRequestCard: React.FC<{
  incident: Incident;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ incident, onAccept, onReject }) => {
  return (
    <div className="p-4 rounded-md shadow-lg bg-stone-50 hover:shadow-md transition-shadow w-full h-auto md:flex md:flex-col justify-end">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
        <div className="flex items-start w-full">
          <div className="flex flex-col gap-3 w-full">
            <h4 className="font-bold text-gray-600 flex flex-wrap items-center gap-2 justify-around w-full">
              {/* {incident.alert_type === "fire" ? "Fire Detected" : "Smoke Detected"} */}
              {incident.alert_type === "smoke" ? (
                <GiSmokeBomb size={40} />
              ) : (
                <FireIcon className="h-9 w-9 text-red-500 mr-3" />
              )}
              {incident.additional_info?.device_name && (
                <p className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  {incident.additional_info.device_name}
                </p>
              )}
              <p className="px-2 py-1 bg-red-400 text-white text-xs rounded-full animate-pulse">
                ACTION REQUIRED
              </p>
            </h4>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1 mb-3">
        <p>
          <b>Id: #</b>
          {incident._id.slice(-6)}
        </p>
        <p>
          <b>Time: </b> {new Date(incident.timestamp).toLocaleString()}
        </p>
        <p>
          <b>Requested Station:</b>{" "}
          {incident.requested_department?.username || "Unknown"}
        </p>
        {incident.rejection_history &&
          incident.rejection_history.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold mb-1">Rejection History:</p>
              <table className="w-full text-xs text-left border border-gray-200 rounded-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1">
                      Department
                    </th>
                    <th className="border border-gray-300 px-2 py-1">Reason</th>
                    <th className="border border-gray-300 px-2 py-1">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incident.rejection_history.map((rej, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1">
                        {rej.department?.username || "Unknown"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {rej.reason || "No reason provided"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {rej.timestamp
                          ? new Date(rej.timestamp).toLocaleString()
                          : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        <p>
          <b>Location: </b>
          {incident.location || "Unknown"}
        </p>
        <p className=" text-gray-600 mt-1">
          <a
            href={`https://www.google.com/maps?q=${incident.geo_location?.coordinates[1]},${incident.geo_location?.coordinates[0]}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="w-auto h-auto p-2 mt-1 hover:cursor-pointer text-sm "
              variant="outline"
            >
              {/* <MapPin className="w-3 h-3 mr-1" /> */}
              View on Maps
            </Button>
          </a>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <Button
          onClick={() => onAccept(incident._id)}
          className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors hover:cursor-pointer"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Accept Request
        </Button>
        <Button
          onClick={() => onReject(incident._id)}
          className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors hover:cursor-pointer"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject Request
        </Button>
      </div>
    </div>
  );
};

export default PendingRequestCard;
