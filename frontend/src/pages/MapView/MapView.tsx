"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import IncidentInfoCard from "./components/IncidentInfoCard";
import type { Incident } from "../../types";
import {
  MapPinIcon,
  FireIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { loadAllIncidents } from "@/store/slices/incidentsSlice";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const { active, pending, loading } = useSelector(
    (state: RootState) => state.incidents
  );
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [showIncidentCard, setShowIncidentCard] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    40.7128, -74.006,
  ]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    dispatch(loadAllIncidents());
  }, [dispatch]);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
      });

      // Add tile layer with better styling
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add map event listeners
      mapInstanceRef.current.on("moveend", () => {
        if (mapInstanceRef.current) {
          const center = mapInstanceRef.current.getCenter();
          setMapCenter([center.lat, center.lng]);
        }
      });

      mapInstanceRef.current.on("zoomend", () => {
        if (mapInstanceRef.current) {
          setMapZoom(mapInstanceRef.current.getZoom());
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      // Clear existing markers
      Object.values(markersRef.current).forEach((marker) => {
        mapInstanceRef.current!.removeLayer(marker);
      });
      markersRef.current = {};

      // Add fire incident markers
      active.forEach((incident) => {
        if (
          incident.geo_location?.coordinates[1] &&
          incident.geo_location?.coordinates[0]
        ) {
          const isHighPriority =
            // incident.temperature > 80 ||
            incident.confidence && incident.confidence > 0.8;
          const isFireType = incident.alert_type === "fire";

          // Create custom icon based on incident type and priority
          const iconHtml = isFireType
            ? `<div style="
                background-color: ${isHighPriority ? "#dc2626" : "#ef4444"}; 
                width: ${isHighPriority ? "28px" : "24px"}; 
                height: ${isHighPriority ? "28px" : "24px"}; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${isHighPriority ? "14px" : "12px"};
                animation: ${isHighPriority ? "pulse 2s infinite" : "none"};
              ">🔥</div>`
            : `<div style="
                background-color: #f59e0b; 
                width: 22px; 
                height: 22px; 
                border-radius: 50%; 
                border: 2px solid white; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
              ">💨</div>`;

          const fireIcon = L.divIcon({
            html: iconHtml,
            className: "fire-marker",
            iconSize: [isHighPriority ? 28 : 24, isHighPriority ? 28 : 24],
            iconAnchor: [isHighPriority ? 14 : 12, isHighPriority ? 14 : 12],
          });

          const marker = L.marker(
            [
              incident.geo_location?.coordinates[1],
              incident.geo_location?.coordinates[0],
            ],
            {
              icon: fireIcon,
            }
          ).addTo(mapInstanceRef.current!);

          // Add click event to marker
          marker.on("click", () => {
            setSelectedIncident(incident);
            setShowIncidentCard(true);
          });

          // Add hover popup with basic info
          marker.bindTooltip(
            `
            <div style="text-align: center; font-size: 12px;">
              <strong>${isFireType ? "🔥 Fire" : "💨 Smoke"} Alert</strong><br>
              <span style="color: #666;">Click for details</span>
            </div>
          `,
            {
              direction: "top",
              offset: [0, -10],
            }
          );

          // Store marker reference
          markersRef.current[incident._id] = marker;
        }
      });

      // Fit map to show all incidents if any exist
      if (active.length > 0) {
        const validIncidents = active.filter(
          (i) =>
            i.geo_location?.coordinates[1] && i.geo_location?.coordinates[1]
        );
        if (validIncidents.length > 0) {
          const group = new L.FeatureGroup(
            validIncidents.map((incident) =>
              L.marker([
                incident.geo_location?.coordinates[1],
                incident.geo_location?.coordinates[0],
              ])
            )
          );

          // Only fit bounds if we have multiple incidents or if zoomed out too far
          if (validIncidents.length > 1 || mapZoom < 10) {
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
          }
        }
      }
    }
  }, [active, mapZoom]);

  const handleCloseIncidentCard = () => {
    setShowIncidentCard(false);
    setSelectedIncident(null);
  };

  const getIncidentsByStatus = () => {
    const statusCounts = {
      pending: active.filter((i) => i.status === "pending").length,
      accepted: active.filter((i) => i.status === "accepted").length,
      assigned: active.filter((i) => i.status === "assigned").length,
      dispatched: active.filter((i) => i.status === "dispatched").length,
    };
    return statusCounts;
  };

  const statusCounts = getIncidentsByStatus();

  if (loading && active.length === 0) {
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
    <div className="p-4 sm:p-6 relative">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Live Fire Incident Map
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Real-time view of active fire incidents detected by AI monitoring
          system
        </p>
      </div>

      {/* Statistics Bar */}
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="text-lg sm:text-xl font-bold text-yellow-600">
                {statusCounts.pending}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <FireIcon className="h-5 w-5 text-blue-500 mr-1" />
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                {statusCounts.accepted}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MapPinIcon className="h-5 w-5 text-purple-500 mr-1" />
              <span className="text-lg sm:text-xl font-bold text-purple-600">
                {statusCounts.assigned}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Assigned</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <EyeIcon className="h-5 w-5 text-green-500 mr-1" />
              <span className="text-lg sm:text-xl font-bold text-green-600">
                {statusCounts.dispatched}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Dispatched</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
        <div className="p-3 sm:p-4 bg-gray-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  High Priority Fire
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Fire Incident</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Smoke Detection</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Total Active: {active.length}
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            ref={mapRef}
            className="h-64 sm:h-96 md:h-[500px] lg:h-[600px] w-full"
          />

          {/* No incidents message */}
          {active.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
              <div className="text-center">
                <FireIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No Active Incidents
                </p>
                <p className="text-gray-400 text-sm">
                  AI monitoring system is active and scanning for fires
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incident Information Card */}
      {showIncidentCard && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <IncidentInfoCard
              incident={selectedIncident}
              onClose={handleCloseIncidentCard}
            />
          </div>
        </div>
      )}

      {/* Map Controls Info */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-base sm:text-lg font-semibold mb-3">
          Map Controls
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Click markers to view incident details</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Zoom and pan to explore the map</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Real-time updates from AI detection</span>
          </div>
        </div>
      </div>

      {/* Live Status Indicator */}
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg text-sm font-medium">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          Live Monitoring
        </div>
      </div>
    </div>
  );
};

export default MapView;
