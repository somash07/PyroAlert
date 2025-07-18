import API from "@/config/baseUrl";
import type { Firefighter } from "../types";

export const firefighterService = {
  getFirefightersByDepartment: (id?: string) =>
    API.get(`/api/v1/firefighters/${id}`),
  addFirefighter: (formData: FormData) =>
    API.post<Firefighter>("/api/v1/firefighters", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteFirefighter: (id: string) => API.delete(`/api/v1/firefighters/${id}`),
  updateFirefighter: (id: string, firefighter: Partial<Firefighter>) =>
    API.patch(`api/v1/firefighters/${id}`, firefighter),
};
