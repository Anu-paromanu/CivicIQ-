export type IssueCategory =
  | "Road Damage"
  | "Garbage"
  | "Streetlight"
  | "Water Leakage"
  | "Drainage"
  | "Illegal Parking"
  | "Tree Hazards"
  | "Public Safety"
  | "Noise Pollution"
  | "Electric Hazards"
  | "Construction Damage";

export type IssuePriority = "Low" | "Medium" | "High" | "Critical";

export type IssueStatus =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "Accepted"
  | "In Progress"
  | "Completed"
  | "Citizen Confirmed"
  | "Archived";

export interface WorkflowHistoryItem {
  status: IssueStatus;
  message: string;
  timestamp: string;
  updatedBy: string;
}

export interface CivicReport {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  gpsAddress: string;
  priority: IssuePriority;
  status: IssueStatus;
  department: string;
  estimatedCost: number;
  severity: number; // 1 to 100
  contractor: string;
  reporterName: string;
  reportedAt: string;
  upvotes: number;
  isVerified: boolean;
  isEmergency: boolean;
  sentimentScore: "Positive" | "Neutral" | "Negative";
  fraudDetected: boolean;
  aiSummary: string;
  history: WorkflowHistoryItem[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export type UserRole = "Citizen" | "Government" | "Contractor" | "Administrator";
