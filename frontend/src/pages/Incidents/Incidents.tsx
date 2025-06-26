"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchIncidents,
  acceptIncident,
  assignFirefighters,
} from "../../store/slices/incidentsSlice";
import { fetchFirefightersByDepartment } from "../../store/slices/firefighterSlice";
import IncidentCard from "./IncidentCard";
import AssignFirefightersModal from "./AssignFirefightersModal";
import type { FireIncident } from "../../types";

const Incidents: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { incidents, loading, lastUpdated } = useSelector(
    (state: RootState) => state.incidents
  );
  const { firefighters } = useSelector(
    (state: RootState) => state.firefighters
  );
  const [selectedIncident, setSelectedIncident] = useState<FireIncident | null>(
    null
  );
  const [showAssignModal, setShowAssignModal] = useState(false);

  const storedUser = localStorage.getItem("userInfo");
  const storedDepartmentId = storedUser ? JSON.parse(storedUser)?._id : "";

  useEffect(() => {
    // Initial fetch
    dispatch(fetchIncidents());
    dispatch(fetchFirefightersByDepartment(storedDepartmentId));

    // Auto-refresh every 15 seconds
    const refreshInterval = setInterval(() => {
      dispatch(fetchIncidents());
    }, 15000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [dispatch,storedDepartmentId]);

  const handleAcceptIncident = (incidentId: string) => {
    dispatch(acceptIncident(incidentId));
  };

  const handleAssignFirefighters = (
    incidentId: string,
    firefighterIds: string[]
  ) => {
    dispatch(assignFirefighters({ incidentId, firefighterIds }));
    setShowAssignModal(false);
    setSelectedIncident(null);
  };

  const activeIncidents = incidents.filter(
    (incident) =>
      incident.status === "pending" ||
      incident.status === "accepted" ||
      incident.status === "assigned"
  );

  if (loading && incidents.length === 0) {
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-2 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Active Incidents
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium text-center">
            {activeIncidents.length} Active
          </div>
          {lastUpdated && (
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {activeIncidents.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-4">🔥</div>
            <p className="text-gray-500 text-base sm:text-lg">
              No active incidents at the moment
            </p>
            <p className="text-gray-400 text-sm sm:text-base">
              System is monitoring for fire emergencies
            </p>
            <div className="mt-4 text-xs sm:text-sm text-gray-400">
              🔌 Real-time monitoring active • 🤖 AI detection enabled
            </div>
          </div>
        ) : (
          <>
            {/* Show newest incidents first */}
            {activeIncidents
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onAccept={handleAcceptIncident}
                  onAssign={(incident) => {
                    setSelectedIncident(incident);
                    setShowAssignModal(true);
                  }}
                />
              ))}
          </>
        )}
      </div>

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
