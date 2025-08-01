-- Create table: legend
CREATE TABLE legend (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  object TEXT NOT NULL,
  object_en TEXT NOT NULL,
  description_de TEXT NOT NULL,
  description_en TEXT NOT NULL,
  type TEXT
);

-- Create table: area_settings
CREATE TABLE area_settings (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  type TEXT NOT NULL,
  area_name TEXT NOT NULL,
  area_name_en TEXT NOT NULL,
  capacity_usage INT DEFAULT 0,
  coordinates JSONB NOT NULL, -- Storing coordinates as JSON
  highlight TEXT DEFAULT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hidden_name BOOLEAN DEFAULT FALSE,
  hidden_absolute BOOLEAN DEFAULT FALSE,
  hidden_percentage BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('active', 'inactive')) NOT NULL
);

-- Create table: thresholds
CREATE TABLE thresholds (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Assuming users table exists
  role TEXT CHECK (role IN ('admin', 'security')) NOT NULL
);

-- Create table: visitor_data
CREATE TABLE visitor_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id INT NOT NULL REFERENCES area_settings(id) ON DELETE CASCADE,
  amount_visitors INT DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);