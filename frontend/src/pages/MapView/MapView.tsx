"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RootState } from "../../store/store";
import { selectActiveIncidents, selectPendingIncidents } from "../../store/slices/incidentsSlice";
import type { Firefighter, Incident } from "../../types";
import IncidentInfoCard from "./IncidentInfoCard";
import { FireIcon } from "@heroicons/react/24/outline";

const MapView: React.FC = () => {
  const pendingRequests = useSelector(selectPendingIncidents);
  const activeIncidents = useSelector(selectActiveIncidents);
  const firefighters = useSelector(
    (state: RootState) => state.firefighters.firefighters
  );

  const combined = [...pendingRequests, ...activeIncidents];

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showIncidentCard, setShowIncidentCard] = useState(false);
  const [mapCenter] = useState<[number, number]>([27.7172, 85.324]); // Kathmandu
  const [mapZoom] = useState(13);

  // Initialize Leaflet map
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

  // Place Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      mapInstanceRef.current!.removeLayer(marker);
    });
    markersRef.current = {};

    combined.forEach((incident) => {
      const coords = incident.geo_location?.coordinates;
      const lat = coords?.[1];
      const lng = coords?.[0];
      if (!lat || !lng) return;

      // Custom emoji icon
      const iconHtml = `
        <div class="bg-red-600 w-7 h-7 rounded-full shadow-md border-2 border-white text-white text-sm flex items-center justify-center">
          ${incident.alert_type === "fire" ? "🔥" : "💨"}
        </div>
      `;
      const customIcon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [28, 28],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current!);

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
  }, [combined]);

  const getAssignedFirefighters = (incidentId: string): Firefighter[] => {
    const incident = combined.find((i) => i._id === incidentId);
    if (!incident?.assigned_firefighters) return [];
    return firefighters.filter((ff) =>
      incident.assigned_firefighters?.includes(ff._id)
    );
  };

  const statusCounts = {
    pending: pendingRequests.length,
    active: activeIncidents.length,
    dispatched: activeIncidents.filter((i)=> i.status === "dispatched").length,
  };

  const handleCloseIncidentCard = () => {
    setShowIncidentCard(false);
    setSelectedIncident(null);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Live Incident Map</h2>
        <p className="text-sm text-gray-500">
          Visualize and manage ongoing fire emergencies in real-time.
        </p>
      </div>

      {/* Incident Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-yellow-600 font-semibold">{statusCounts.pending}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
        <div>
          <p className="text-blue-600 font-semibold">{statusCounts.active}</p>
          <p className="text-xs text-gray-600">Accepted</p>
        </div>
        <div>
          <p className="text-blue-600 font-semibold">{statusCounts.dispatched}</p>
          <p className="text-xs text-gray-600">Dispatched</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[80vh] rounded-lg overflow-hidden shadow border">
        <div ref={mapRef} className="w-full h-full" />
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
