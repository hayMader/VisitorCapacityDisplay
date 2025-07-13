-- Create table: legend
CREATE TABLE legend (
  id SERIAL PRIMARY KEY,
  object TEXT NOT NULL,
  object_en TEXT NOT NULL,
  description_de TEXT NOT NULL,
  description_en TEXT NOT NULL
);

-- Create table: area_settings
CREATE TABLE area_settings (
  id SERIAL PRIMARY KEY,
  area_name TEXT NOT NULL,
  capacity_usage INT DEFAULT 0,
  coordinates JSONB NOT NULL, -- Storing coordinates as JSON
  highlight TEXT DEFAULT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hidden_name BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('active', 'inactive')) NOT NULL
);

-- Create table: thresholds
CREATE TABLE thresholds (
  id SERIAL PRIMARY KEY,
  setting_id INT NOT NULL REFERENCES area_settings(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  upper_threshold INT NOT NULL,
  alert BOOLEAN DEFAULT FALSE,
  alert_message TEXT DEFAULT NULL,
  alert_message_control BOOLEAN DEFAULT FALSE, -- Controls whether the alert message is shown in the UI
  type TEXT CHECK (type IN ('security', 'management')) NOT NULL
);

-- Create table: roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Assuming users table exists
  role TEXT CHECK (role IN ('admin', 'security')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table: visitor_data
CREATE TABLE visitor_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id INT NOT NULL REFERENCES area_settings(id) ON DELETE CASCADE,
  amount_visitors INT DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create view: area_status
CREATE VIEW area_status AS
SELECT
  a.id AS area_number,
  a.area_name,
  a.capacity_usage,
  a.coordinates,
  a.highlight,
  a.hidden_name,
  a.status,
  v.amount_visitors,
  json_agg(t.*) AS thresholds
FROM
  area_settings a
LEFT JOIN visitor_data v ON a.id = v.area_id
LEFT JOIN thresholds t ON a.id = t.setting_id
GROUP BY a.id, v.amount_visitors;