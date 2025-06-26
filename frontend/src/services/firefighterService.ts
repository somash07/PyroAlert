import API from "@/config/baseUrl"
import type { Firefighter } from "../types"

export const firefighterService = {
  getFirefighters: () => API.get<Firefighter[]>("/firefighters"),
  addFirefighter: (firefighter: Omit<Firefighter, "id">) => API.post<Firefighter>("/firefighters", firefighter),
  deleteFirefighter: (id: string) => API.delete(`/firefighters/${id}`),
  updateFirefighter: (id: string, firefighter: Partial<Firefighter>) => API.patch(`/firefighters/${id}`, firefighter),
}
