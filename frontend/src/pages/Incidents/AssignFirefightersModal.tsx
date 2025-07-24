import type React from "react";
import { useState } from "react";
import type { Firefighter, Incident } from "../../types";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { loadActiveIncidents } from "@/store/slices/incidentsSlice";
import type { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Check } from "lucide-react";

interface AssignFirefightersModalProps {
  incident: Incident;
  firefighters: Firefighter[];
  onAssign: (
    incidentId: string,
    firefighterIds: string[],
    leaderId: string
  ) => void;
  onClose: () => void;
}

const AssignFirefightersModal: React.FC<AssignFirefightersModalProps> = ({
  incident,
  firefighters,
  onAssign,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFirefighters, setSelectedFirefighters] = useState<string[]>(
    []
  );
  const [selectedLeader, setSelectedLeader] = useState<string | null>("");
  const availableFirefighters = firefighters.filter(
    (f) => f.status === "available"
  );

  const handleToggleFirefighter = (firefighterId: string) => {
    setSelectedFirefighters((prev) =>
      prev.includes(firefighterId)
        ? prev.filter((id) => id !== firefighterId)
        : [...prev, firefighterId]
    );
  };

  const handleAssign = () => {
    if (selectedFirefighters.length > 0) {
      onAssign(incident._id, selectedFirefighters, selectedLeader ?? "");
      dispatch(loadActiveIncidents());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold ">
            Assign Firefighters
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4">
            {/* <p className="text-sm text-gray-600">Distance: {distance} km</p> */}
          </div>

          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-medium mb-3">
              Available Firefighters
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableFirefighters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No firefighters available at the moment</p>
                </div>
              ) : (
                availableFirefighters.map((firefighter) => (
                  <div
                    className="flex items-center justify-center gap-x-2"
                    key={firefighter._id}
                  >
                    <label
                      className={`flex mt-3 items-center w-[90%]  p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                         ${
                           selectedLeader === firefighter._id &&
                           "ring-2 ring-green-500 bg-green-100"
                         }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFirefighters.includes(firefighter._id)}
                        onChange={() =>
                          handleToggleFirefighter(firefighter._id)
                        }
                        className={`mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded *:
                         `}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {firefighter.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {firefighter.contact}
                        </p>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded flex-shrink-0">
                        {firefighter.status}
                      </span>
                    </label>
                    <div>
                      <Tooltip>
                        <TooltipTrigger>
                          <Check
                            className="h-5 w-5 text-primary"
                            onClick={() => {
                              setSelectedLeader(firefighter._id);
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>Make Leader</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedFirefighters.length === 0}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Assign ({selectedFirefighters.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignFirefightersModal;
