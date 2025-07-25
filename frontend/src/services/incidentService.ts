import API from "@/config/baseUrl";

export const createAlert = (data: any) => API.post("/api/v1/alert", data);

export const fetchActiveIncidents = () => API.get("/api/v1/alert/active");

export const fetchPendingIncidents = (department_id: string) =>
  API.get(`/api/v1/alert/pending/${department_id}`);

export const assignFirefighters = (id: string, firefighterIds: string[],leaderId: string) =>
  API.patch(`/api/v1/alert/${id}/assign`, { firefighterIds,leaderId });

export const fetchAllIncidents = () => API.get("/api/v1/alert/all");

export const fetchAssignedincidents = (departmentId: string) =>
  API.get(`/api/v1/alert/getAssignedIncidents/${departmentId}`);

export const updateIncident = (id: string, data: any) =>
  API.put(`/api/v1/alert/${id}`, data);

// ✅ Respond to an incident (accept or reject) (POST /api/v1/alerts/:id/respond)
export const respondToIncident = (
  id: string,
  departmentId: string,
  action: "accept" | "reject",
  notes?: string
) =>
  API.post(`/api/v1/alert/${id}/respond`, {
    department_id: departmentId,
    action,
    notes,
  });

export const confirmAndSend = (id: string) =>
  API.patch(`/api/v1/alert/${id}/confirm`);

export const completeIncident = (
  id: string,
  notes: string,
  responseTime: number
) =>
  API.patch(`/api/v1/alert/${id}/complete`, {
    completion_notes: notes,
    responseTime,
  });
