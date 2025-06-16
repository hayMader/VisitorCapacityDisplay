
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
  hidden_absolute?: boolean;    // Controls display of absolute visitor count
  hidden_percentage?: boolean; 
}

export interface Threshold {
  id: number;
  setting_id: number;
  upper_threshold: number;
  color?: string;
  alert: boolean;
  alert_message?: string;
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
  hidden_absolute?: boolean;    // Controls display of absolute visitor count
  hidden_percentage?: boolean; 
}

export interface LegendRow{
  id: number;
  object: string;
  description_de: string;
  description_en: string;
}

export type OccupancyLevel = 'low' | 'medium' | 'high';
