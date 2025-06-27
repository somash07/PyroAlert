import API from "@/config/baseUrl";

export const createAlert = (data: any) => API.post("/api/v1/alert", data);

export const fetchActiveIncidents = () => API.get("/api/v1/alert/active");

export const fetchPendingIncidents = () =>  API.get("/api/v1/alert/pending");
;

export const fetchAllIncidents = () => API.get("/api/v1/alert/all");

export const updateIncident = (id: string, data: any) =>
  API.put(`/api/v1/alert/${id}`, data);

// ✅ Respond to an incident (accept or reject) (POST /api/v1/alerts/:id/respond)
export const respondToIncident = (
  id: string,
  action: "accept" | "reject",
  notes?: string
) => API.post(`/api/v1/alert/${id}/respond`, { action, notes });
