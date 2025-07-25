import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/constants";
import type {
  FFighter,
  Firefighter,
  Incident,
  IncidentDetails,
  LoginResponse,
} from "../types";

class ApiService {
  private baseURL = API_BASE_URL;

  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/firefighters/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const headers = await this.getAuthHeaders();
    // await fetch(`${this.baseURL}/firefighters/logout`, {
    //   method: "POST",
    //   headers,
    // })
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userData");
  }

  async getProfile(): Promise<Firefighter> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/firefighters/me`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    return data.data;
  }

  async getIncidents(
    firefighterId: string,
    statuses?: string[]
  ): Promise<Incident[]> {
    const headers = await this.getAuthHeaders();

    // Construct query string if statuses are provided
    let queryString = "";
    if (statuses && statuses.length > 0) {
      const queryParams = statuses
        .map((s) => `status=${encodeURIComponent(s)}`)
        .join("&");
      queryString = `?${queryParams}`;
    }

    const response = await fetch(
      `${this.baseURL}/alert/getAllIncidentsAssignedToFirefighter/${firefighterId}${queryString}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch incidents");
    }

    return data.data;
  }

  async getIncidentDetails(
    incidentId: string,
    firefighterId: string
  ): Promise<IncidentDetails> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseURL}/alert/getSingleIncidentAssignedToFirefighter/${incidentId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ firefighterId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch incident details");
    }

    const data = await response.json();
    return data.data;
  }

  async markIncidentComplete(
    id: string,
    leaderId: string,
    notes: string
  ): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseURL}/alert/markIncidentAsCompleted/${id}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ leaderId, notes }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to mark incident complete");
    }
    return response.json();
  }

  async getFireFighterUserDetailById(id: string): Promise<FFighter> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseURL}/firefighters/getFireFighterUserDetailById/${id}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();
    return data.data;
  }
}

export const apiService = new ApiService();
