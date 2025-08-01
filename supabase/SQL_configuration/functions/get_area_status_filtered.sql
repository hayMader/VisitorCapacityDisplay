-- This function retrieves area settings along with the latest visitor count and associated thresholds.

-- Drop the function if it already exists to allow recreation.
DROP FUNCTION get_area_status_filtered(integer);

-- Create or replace the function `get_area_status_filtered`.
-- This function accepts an integer parameter `filter_minutes` and returns a set of JSONB objects.
CREATE OR REPLACE FUNCTION get_area_status_filtered(filter_minutes integer)
RETURNS SETOF jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return a query that combines area settings with visitor data and thresholds.
  RETURN QUERY
  SELECT
    -- Convert the area settings record to JSONB and merge it with additional data.
    to_jsonb(a) ||
    jsonb_build_object(
      -- Add the latest visitor count for the area, filtered by timestamp.
      'amount_visitors', COALESCE((
        SELECT v.amount_visitors
        FROM public.visitor_data v
        WHERE v.area_id = a.id
          AND v.timestamp <= NOW() - (filter_minutes * INTERVAL '1 minute') -- Filter by the given time range.
        ORDER BY v.timestamp DESC -- Get the most recent record.
        LIMIT 1 -- Limit to one record.
      ), 0), -- Default to 0 if no data is found.

      -- Add thresholds associated with the area settings.
      'thresholds', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', t.id, -- Threshold ID.
            'setting_id', t.setting_id, -- Associated setting ID.
            'upper_threshold', t.upper_threshold, -- Upper threshold value.
            'color', t.color, -- Color indicator for the threshold.
            'alert', t.alert, -- Alert flag.
            'alert_message_control', t.alert_message_control, -- Control for alert messages.
            'alert_message', t.alert_message, -- Alert message text.
            'type', t.type -- Type of threshold.
          )
        )
        FROM public.thresholds t
        WHERE t.setting_id = a.id -- Filter thresholds by the area setting ID.
      ), '[]'::jsonb) -- Default to an empty JSONB array if no thresholds are found.
    )
  FROM public.area_settings a; -- Query all area settings.
END;
$$;



