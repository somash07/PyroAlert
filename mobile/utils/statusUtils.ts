import { GRAY_COLOR, PRIMARY_COLOR, SUCCESS_COLOR, WARNING_COLOR } from "../constants/constants";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
    case "available":
      return SUCCESS_COLOR;
    case "in-progress":
    case "busy":
      return WARNING_COLOR;
    case "pending":
      return PRIMARY_COLOR;
    default:
      return GRAY_COLOR;
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case "available":
      return "AVAILABLE";
    case "busy":
      return "BUSY";
    case "completed":
      return "COMPLETED";
    case "in-progress":
      return "IN PROGRESS";
    case "pending":
      return "PENDING";
    default:
      return status.toUpperCase();
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical":
      return "#DC2626";
    case "high":
      return "#EA580C";
    case "medium":
      return WARNING_COLOR;
    case "low":
      return SUCCESS_COLOR;
    default:
      return GRAY_COLOR;
  }
}; 