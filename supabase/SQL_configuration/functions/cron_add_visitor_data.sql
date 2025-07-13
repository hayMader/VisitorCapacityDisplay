-- This SQL script inserts random visitor data into the visitor_data table for each area defined in area_settings.
-- exeute every minute

INSERT INTO visitor_data (area_id, amount_visitors)
SELECT
  id AS area_id,
  FLOOR(RANDOM() * 6001)::int AS amount_visitors
FROM area_settings;