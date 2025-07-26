export interface Firefighter {
  _id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  status: "available" | "busy";
  specializations?: string[];
  yearsOfExperience?: number;
  isActive: boolean;
  lastStatusUpdate: Date;
  departmentId: string;
  image?: string;
  isLeader?: boolean;
}

export interface Incident {
  _id: string;
  alert_type: string;
  location: string;
  timestamp: string;
  confidence: number;
  status: string;
  leaderId: string;
  completion_notes: string;
  assigned_department: string;
  // geo_location: GeoLocation;
  response_time: string;
  notes: string;
}
export interface FFighter {
  name: string;
  email: string;
  status: string;
  contact: string;
  image: string;
}
export interface IncidentDetails {
  _id: string;
  alert_type: string;
  leaderId: string;
  assigned_firefighters: {
    _id: string;
    contact: string;
    name: string;
    email: string;
    image?: string;
  }[];
  detection_method: string;
  device_name: string;
  geo_location: GeoLocation;
  location: string;
  notes: string;
  status: string;
  timestamp: string;
}

export interface GeoLocation {
  lat: number;
  long: number;
}

export interface GeoLocation {
  type: string;
  coordinates: number[];
}

export interface AssignedFirefighter {
  resetPasswordExpiry: any;
  _id: string;
  name: string;
  address: string;
  email: string;
  contact: string;
  status: string;
  specializations: any[];
  isActive: boolean;
  departmentId: string;
  image: string;
  password: string;
  resetPasswordToken: string;
  certifications: any[];
  lastStatusUpdate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AdditionalInfo {
  camera_id: string;
  detection_method: string;
  alert_source: string;
  device_name: string;
}

export interface NearbyDepartment {
  department: string;
  distance: number;
  _id: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: Firefighter;
    token: string;
  };
}
