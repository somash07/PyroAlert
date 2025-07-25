import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store/store";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RootState } from "../../store/store";
import {
  selectActiveIncidents,
  selectPendingIncidents,
} from "../../store/slices/incidentsSlice";
import type { Firefighter, Incident, User } from "../../types";
import IncidentInfoCard from "./IncidentInfoCard";
import { FireIcon } from "@heroicons/react/24/outline";
import {
  fetchDepartments,
  selectDepartments,
} from "@/store/slices/departmentSlice";
const MapView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const pendingRequests = useSelector(selectPendingIncidents);
  const activeIncidents = useSelector(selectActiveIncidents);
  const firefighters = useSelector(
    (state: RootState) => state.firefighters.firefighters
  );
  const departments = useSelector(selectDepartments);

  const storedUser = localStorage.getItem("userInfo");
  const storedDepartmentId = storedUser ? JSON.parse(storedUser)?._id : "";

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const combined = [...pendingRequests, ...activeIncidents]
    .filter(
      (incident) =>
        incident.requested_department?._id === storedDepartmentId ||
        incident.assigned_department?._id === storedDepartmentId
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const mostRecentPending = pendingRequests
    .filter(
      (incident) =>
        incident.requested_department?._id === storedDepartmentId ||
        incident.assigned_department?._id === storedDepartmentId
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [showIncidentCard, setShowIncidentCard] = useState(false);
  const [hasCentered, setHasCentered] = useState(false);
  const [mapCenter] = useState<[number, number]>([27.7172, 85.324]); // Kathmandu
  const [mapZoom] = useState(13);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
  }, [mapCenter, mapZoom]);

  useEffect(() => {
    if (
      !hasCentered &&
      mostRecentPending?.geo_location?.coordinates &&
      mapInstanceRef.current
    ) {
      const [lng, lat] = mostRecentPending.geo_location.coordinates;
      mapInstanceRef.current.setView([lat, lng], mapZoom, {
        animate: true,
      });
      setHasCentered(true);
    }
  }, [mostRecentPending, hasCentered, mapZoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear markers
    Object.values(markersRef.current).forEach((marker) => {
      mapInstanceRef.current!.removeLayer(marker);
    });
    markersRef.current = {};

    // INCIDENT MARKERS
    combined.forEach((incident) => {
      const coords = incident.geo_location?.coordinates;
      const lat = coords?.[1];
      const lng = coords?.[0];
      if (!lat || !lng) return;

      const iconUrl =
        incident.status === "pending_response"
          ? "/mapMarker/pending.png"
          : incident.status === "acknowledged"
          ? "/mapMarker/acknowledged.png"
          : "/mapMarker/dispatched.png";

      const isPending = incident.status === "pending_response";
      const iconHtml = `
        <div class="relative w-16 h-16 flex items-center justify-center">
          ${
            isPending
              ? `<div class="absolute w-full h-full rounded-full bg-red-400 opacity-40 animate-ping"></div>`
              : ""
          }
          <div class="relative z-10 w-10 h-10 rounded-full shadow-md border flex items-center justify-center overflow-hidden">
            <img src="${iconUrl}" alt="incident" class="w-6 h-6 object-contain" />
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [28, 28],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(
        mapInstanceRef.current!
      );

      marker.on("click", () => {
        setSelectedIncident(incident);
        setShowIncidentCard(true);
      });

      marker.bindTooltip(
        `<div style="text-align:center;font-size:12px">
          <strong>${incident.alert_type?.toUpperCase()}</strong><br />
          Status: ${incident.status}<br />
        </div>`,
        { direction: "top", offset: [0, -15] }
      );

      markersRef.current[incident._id] = marker;
    });

    // DEPARTMENT MARKERS
    departments.forEach((dept: User) => {
      const coords = dept.location;
      const lat = coords?.lat;
      const lng = coords?.lng;
      if (!lat || !lng) return;

      const deptIcon = L.divIcon({
        html: `
        <img src= "/mapMarker/fire-department.png" class="w-6 h-6 object-contain" alt="department"  />
          
        `,
        className: "",
        iconSize: [30, 30],
      });

      const marker = L.marker([lat, lng], { icon: deptIcon }).addTo(
        mapInstanceRef.current!
      );

      marker.bindTooltip(
        `<div style="text-align:center;font-size:12px">
          <strong>${dept.username || "Fire Department"}</strong>
        </div>`,
        { direction: "top", offset: [0, -15] }
      );

      markersRef.current[dept._id] = marker;
    });
  }, [combined, departments]);

  const getAssignedFirefighters = (incidentId: string): Firefighter[] => {
    const incident = combined.find((i) => i._id === incidentId);

    if (!incident || !Array.isArray(incident.assigned_firefighters)) return [];

    const assignedIds: string[] = incident.assigned_firefighters.map((ff) =>
      typeof ff === "string" ? ff : ff._id
    );

    return firefighters.filter((ff) => assignedIds.includes(ff._id));
  };

  const statusCounts = {
    pending: pendingRequests.length,
    acknowledged: combined.filter((i) => i.status === "acknowledged").length,
    dispatched: combined.filter((i) => i.status === "dispatched").length,
  };

  const handleCloseIncidentCard = () => {
    setShowIncidentCard(false);
    setSelectedIncident(null);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <p className="text-sm text-gray-500 text-center">
          Visualize ongoing fire emergencies in real-time.
        </p>
      </div>

      {/* Incident Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/mapMarker/pending.png" alt="" className="w-5" />
          <p className="text-xs text-gray-600">
            {statusCounts.pending} Pending
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <img src="/mapMarker/acknowledged.png" alt="" className="w-5" />
          <p className="text-xs text-gray-600">
            {statusCounts.acknowledged} Acknowledged
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <img src="/mapMarker/dispatched.png" alt="" className="w-5" />
          <p className="text-xs text-gray-600">
            {statusCounts.dispatched} Dispatched
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <img src="/mapMarker/fire-department.png" alt="" className="w-5" />
          <p className="text-xs text-gray-600">
            {departments.length} Departments
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[80vh] rounded-lg overflow-hidden shadow border">
        <div ref={mapRef} className="w-full h-full z-20" />
        {combined.length === 0 && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center">
            <FireIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No Active Incidents</p>
          </div>
        )}
      </div>

      {/* Incident Info Popup */}
      {showIncidentCard && selectedIncident && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
          <div className="relative z-[10000]">
            <IncidentInfoCard
              incident={selectedIncident}
              assignedFirefighters={getAssignedFirefighters(
                selectedIncident._id
              )}
              onClose={handleCloseIncidentCard}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
