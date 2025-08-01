
export interface VisitorData {
  id: string;
  timestamp: string;
  area_id: number;
  amount_visitors: number;
}

export interface AreaSettings {
  id: number;
  area_name: string;
  area_name_en?: string;
  last_updated: string;
  capacity_usage: number;
  coordinates: { x: number; y: number }[];
  highlight: string | null;
  hidden_name: boolean;
  status: "active" | "inactive";
  hidden_absolute?: boolean;    // Controls display of absolute visitor count
  hidden_percentage?: boolean; 
}

export interface Threshold {
  id: number;
  setting_id: number;
  upper_threshold: number;
  color?: string;
  type: 'security' | 'management';
  alert: boolean;
  alert_message?: string;
  alert_message_control: boolean; // Controls whether the alert message is shown in the UI
}

export interface AreaStatus {
  id: number;
  area_name: string;
  area_name_en?: string;
  capacity_usage: number;
  coordinates: { x: number; y: number }[];
  amount_visitors: number;
  highlight: string | null;
  thresholds: Threshold[];
  hidden_name: boolean;
  status: "active" | "inactive";
  hidden_absolute?: boolean;    // Controls display of absolute visitor count
  hidden_percentage?: boolean; 
  type: AreaType; // Type of area, e.g., entrance, hall, etc.
}

export interface LegendRow {
  id: number;
  object: string;
  object_en: string;
  description_de: string;
  description_en: string;
  type: 'security' | 'management';
}

export type OccupancyLevel = 'low' | 'medium' | 'high';

export type AreaType = 'entrance' | 'hall' | 'other';


export interface AuthUser {
  isAuthenticated: boolean;
  username: string;
  name: string;
  role: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  getCurrentUser: () => AuthUser | null;
  isLoading: boolean; // Add loading state
}
