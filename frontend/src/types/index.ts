export interface FireIncident {
  id: string
  temperature: number
  timestamp: string
  location: {
    lat: number
    lng: number
    address: string
  }
  distance: number
  status: "pending" | "accepted" | "rejected" | "assigned" | "dispatched" | "completed"
  assignedFirefighters?: string[]
  fireDepartmentId?: string
  confidence?: number
  detectionMethod?: string
  detectionType?: "fire" | "smoke" | "other"
  cameraId?: string
  cameraName?: string
}

export interface Firefighter {
  _id: string
  name: string
  email: string
  address: string
  departmentId: string
  contact: string
  status: "available" | "busy" | "offline"
  specializations?: string[]
  yearsOfExperience?: number
  certifications?: Array<{
    name: string
    issuedDate: string
    expiryDate: string
  }>
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  isActive?: boolean
  lastStatusUpdate?: string
}

export interface FireDepartment {
  id: string
  name: string
  location: {
    lat: number
    lng: number
    address?: string
  }
  contact: {
    phone?: string
    email: string
    emergencyLine?: string
  }
  firefighters?: string[]
  equipment?: Array<{
    name: string
    type: string
    status: "operational" | "maintenance" | "out-of-service"
    lastMaintenance?: string
  }>
  coverage?: {
    radius: number
    areas: string[]
  }
  isActive?: boolean
  settings?: {
    autoAcceptIncidents: boolean
    maxResponseDistance: number
    notificationPreferences: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
}

export interface DashboardStats {
  pendingIncidents: number
  activeIncidents: number
  availableFirefighters: number
  averageResponseTime: number
  incidentsToday: number
  totalFirefighters?: number
  busyFirefighters?: number
}

export interface User {
  id: string
  name: string
  email: string
  department: string
  role: "admin" | "chief" | "operator"
  isActive: boolean
  lastLogin?: string
}


export interface Incident {
  acceptedBy: string;
  _id: string;
  location: string;
  alert_type: "fire" | "smoke";
  timestamp: string; // from Date
  confidence: number;
  temperature?: number;
  source_device_id?: string;
  status:
    | "pending_response"
    | "acknowledged"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "rejected"
    | "unassigned";
  assigned_firefighters?: Array<{ name: string; _id: string }>;
  assigned_department?: {
    _id: string;
    username: string;
    address: string;
  };
  requested_department?: {
    _id: string;
    username: string;
    address: string;
  };
  notes?: string;
  additional_info?: Record<string, any>;
  geo_location?: {
    type: "Point";
    coordinates: [number, number];
  };
  nearby_departments?: Array<{
    department: {
      _id: string;
      name: string;
    };
    distance: number;
  }>;
  rejection_history?: Array<{
    department: {
      _id: string;
      name: string;
    };
    reason: string;
    timestamp: string;
  }>;
  response_time?: string;
  action_required?: boolean;
}


// WebSocket event types
export interface SocketEvents {
  "new-incident": FireIncident
  "incident-created": FireIncident
  "incident-updated": FireIncident
  "dashboard-update": FireIncident
  "stats-update": DashboardStats
  "firefighter-added": Firefighter
  "firefighter-updated": Firefighter
  "firefighters-assigned": { firefighters: Firefighter[]; incidentId: string }
  "firefighters-dispatched": FireIncident
  connected: { message: string; timestamp: string }
}
