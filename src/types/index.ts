
export interface VisitorData {
  id: string;
  timestamp: string;
  area_id: number;
  amount_visitors: number;
}

export interface AreaSettings {
  id: number;
  area_name: string;
  last_updated: string;
  capacity_usage: number;
  x: number;
  y: number;
  width: number;
  height: number;
  highlight: string | null;
}

export interface Threshold {
  id: number;
  setting_id: number;
  upper_threshold: number;
  color?: string;
  alert: boolean;
  alert_message: string;
}

export interface AreaStatus {
  id: number;
  area_name: string;
  capacity_usage: number;
  x: number;
  y: number;
  width: number;
  height: number;
  amount_visitors: number;
  highlight: string | null;
  thresholds: Threshold[]
}

export type OccupancyLevel = 'low' | 'medium' | 'high';
