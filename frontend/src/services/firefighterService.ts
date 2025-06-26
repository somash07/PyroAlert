import API from "@/config/baseUrl"
import type { Firefighter } from "../types"



export const firefighterService = {
  getFirefighters: (id? : string) => API.get(`/api/v1/firefighters?departmentId=${id}`),
  addFirefighter: (firefighter: Omit<Firefighter, "_id">) => API.post<Firefighter>("/api/v1/firefighters", firefighter),
  deleteFirefighter: (id: string) => API.delete(`/api/v1/firefighters/${id}`),
  updateFirefighter: (id: string, firefighter: Partial<Firefighter>) => API.patch(`api/v1/firefighters/${id}`, firefighter),
}


