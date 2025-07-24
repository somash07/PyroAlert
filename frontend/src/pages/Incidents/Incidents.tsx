import type React from "react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  assignFirefighterss,
  loadActiveIncidents,
  respondToIncidentThunk,
  selectActiveIncidents,
  selectPendingIncidents,
} from "../../store/slices/incidentsSlice";
import { fetchFirefightersByDepartment } from "../../store/slices/firefighterSlice";
import IncidentCard from "./IncidentCard";
import AssignFirefightersModal from "./AssignFirefightersModal";
import type { Incident } from "../../types";
import {toast} from "sonner";

const Incidents: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pending, active, loading, lastUpdated } = useSelector(
    (state: RootState) => state.incidents
  );

  const pendingRequests = useSelector(selectPendingIncidents);
  const activeIncidents = useSelector(selectActiveIncidents);

  const { firefighters } = useSelector(
    (state: RootState) => state.firefighters
  );
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending_response" | "acknowledged" | "dispatched"
  >("all");

  const storedUser = localStorage.getItem("userInfo");
  const storedDepartmentId = storedUser ? JSON.parse(storedUser)?._id : "";

  useEffect(() => {
    dispatch(fetchFirefightersByDepartment(storedDepartmentId));
    const refreshInterval = setInterval(() => {
      dispatch(fetchFirefightersByDepartment(storedDepartmentId));
    }, 15000);
    return () => clearInterval(refreshInterval);
  }, [dispatch, storedDepartmentId]);

  const handleAcceptIncident = (incidentId: string, departmentId: string) => {
    dispatch(
      respondToIncidentThunk({ id: incidentId, departmentId, action: "accept" })
    );
    toast("")

  };

  const handleAssignFirefighters = (
    incidentId: string,
    firefighterIds: string[]
  ) => {
    dispatch(assignFirefighterss({ incidentId, firefighterIds }));
    dispatch(loadActiveIncidents());
    setShowAssignModal(false);
    setSelectedIncident(null);
  };

  const allIncidents = [...activeIncidents, ...pendingRequests].filter(
    (incident) => {
      return (
        (typeof incident.assigned_department === "string"
          ? incident.assigned_department === storedDepartmentId
          : incident.assigned_department?._id === storedDepartmentId) ||
        (typeof incident.requested_department === "string"
          ? incident.requested_department === storedDepartmentId
          : incident.requested_department?._id === storedDepartmentId)
      );
    }
  );

  const filteredIncidents =
    statusFilter === "all"
      ? allIncidents
      : allIncidents.filter((incident) => incident.status === statusFilter);

  if (loading && active.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/2 sm:w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 sm:h-48 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row gap-5 sm:items-center mb-6 space-y-4 sm:space-y-0 ">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {allIncidents.length} Active
          </span>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="statusFilter"
            className="text-sm text-gray-700 font-medium"
          >
            Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="text-sm px-3 py-1.5 border rounded-md focus:outline-none "
          >
            <option value="all">All</option>
            <option value="pending_response">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="dispatched">Dispatched</option>
          </select>
        </div>
      </div>

      {/* Incident Cards */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-base sm:text-lg">
              No {statusFilter === "all" ? "active" : statusFilter} incidents.
            </p>
            <p className="text-gray-400 text-sm sm:text-base">
              System is monitoring for fire emergencies
            </p>
            <div className="mt-4 text-xs sm:text-sm text-gray-400">
              Real-time monitoring active
            </div>
          </div>
        ) : (
          filteredIncidents
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
            .map((incident) => (
              <IncidentCard
                key={incident._id}
                incident={incident}
                onAccept={() =>
                  handleAcceptIncident(incident._id, storedDepartmentId)
                }
                onAssign={(incident) => {
                  setSelectedIncident(incident);
                  setShowAssignModal(true);
                }}
              />
            ))
        )}
      </div>

      {/* Modal */}
      {showAssignModal && selectedIncident && (
        <AssignFirefightersModal
          incident={selectedIncident}
          firefighters={firefighters}
          onAssign={handleAssignFirefighters}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedIncident(null);
          }}
        />
      )}
    </div>
  );
};

export default Incidents;
