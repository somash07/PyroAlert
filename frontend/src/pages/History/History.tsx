import { io } from "socket.io-client";
import type React from "react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  loadActiveIncidents,
  loadAllIncidents,
  selectActiveIncidents,
} from "../../store/slices/incidentsSlice";
import { fetchFirefightersByDepartment } from "../../store/slices/firefighterSlice";
import {
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  PencilIcon,
  ClipboardDocumentCheckIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import type { Firefighter, Incident } from "../../types";
import { GiSmokeBomb } from "react-icons/gi";
import { ExternalLink } from "lucide-react";

const History: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { incidents, loading } = useSelector(
    (state: RootState) => state.incidents
  );
  const activeIncidents = useSelector(selectActiveIncidents);
  console.log("active: ", activeIncidents);
  const { firefighters } = useSelector(
    (state: RootState) => state.firefighters
  );
  console.log("ff: ", firefighters);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const storedUser = localStorage.getItem("userInfo");
  const storedDepartmentId = storedUser ? JSON.parse(storedUser)?._id : "";

  useEffect(() => {
    const socket = io("https://pyroalert-tdty.onrender.com");

    socket.on("INCIDENT_COMPLETED", async () => {
      await dispatch(loadActiveIncidents());
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadActiveIncidents());
    dispatch(fetchFirefightersByDepartment(storedDepartmentId));
  }, [dispatch, storedDepartmentId]);

  const historyIncidents = activeIncidents.filter(
    (incident) => incident.status === "completed"
  );

  const filteredIncidents = historyIncidents.filter((incident) => {
    const matchesSearch =
      incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      const incidentDate = new Date(incident.timestamp);
      const now = new Date();

      switch (dateFilter) {
        case "today":
          return incidentDate.toDateString() === now.toDateString();
        case "week": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return incidentDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return incidentDate >= monthAgo;
        }
        default:
          return true;
      }
    })();

    return matchesSearch && matchesDate;
  });

  const getAssignedFirefighters = (incidentId: string): Firefighter[] => {
    const incident = incidents.find((i) => i._id === incidentId);
    if (!incident?.assigned_firefighters) return [];

    return firefighters.filter((ff) =>
      incident.assigned_firefighters?.includes(ff._id)
    );
  };

  const calculateDuration = (
    start: string | Date,
    end: string | Date
  ): string => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = endTime - startTime;

    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  if (loading && historyIncidents.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-96 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <p className="text-gray-600 text-sm sm:text-base">
          List of successfully resolved incidents.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by location or incident ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none "
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Completed History
            </h2>
            <span className="text-sm text-gray-500">
              {filteredIncidents.length} of {historyIncidents.length} incidents
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200 max-h-[30rem] overflow-y-auto">
          {filteredIncidents.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || dateFilter !== "all"
                  ? "No completed incidents match your filters"
                  : "No completed incidents yet"}
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => {
              const assignedFirefighters = getAssignedFirefighters(
                incident._id
              );

              return (
                <div
                  key={incident._id}
                  className="p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-start space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900 flex">
                            <p>
                              {incident.alert_type === "smoke" ? (
                                <GiSmokeBomb size={30} />
                              ) : (
                                <FireIcon className="h-7 w-7 text-red-500 mr-3" />
                              )}
                            </p>
                            Completed{" "}
                            {incident.alert_type === "fire" ? "Fire" : "Smoke"}{" "}
                            Incident
                          </h3>
                          <span className="text-sm text-gray-500">
                            #{incident._id.slice(-6)}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <p>Location : {incident.location}</p>
                            <a
                              href={`https://www.google.com/maps?q=${incident.geo_location?.coordinates[1]},${incident.geo_location?.coordinates[0]}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink
                                size={15}
                                className="text-gray-500 hover:text-gray-900"
                              />
                              {/* <Button variant="outline" size="sm">
              <MapPin className="h-3 w-3 mr-1" />
              View on Google Maps
            </Button> */}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(incident.timestamp).toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                            Note: {incident.completion_notes || "N/A"}
                          </div>
                          <div className="flex items-center">
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Time taken:{" "}
                            {calculateDuration(
                              incident.timestamp,
                              incident.updatedAt
                            )}
                          </div>
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            Firefighters:{" "}
                            {assignedFirefighters
                              .map((f) => f.name)
                              .join(", ") || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full font-medium">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
