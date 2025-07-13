-- This function retrieves area settings along with the latest visitor count and associated thresholds.

DROP FUNCTION get_area_status_filtered(integer);
CREATE OR REPLACE FUNCTION get_area_status_filtered(filter_minutes integer)
RETURNS SETOF jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_jsonb(a) ||
    jsonb_build_object(
      'amount_visitors', COALESCE((
        SELECT v.amount_visitors
        FROM public.visitor_data v
        WHERE v.area_id = a.id
          AND v.timestamp <= NOW() - (filter_minutes * INTERVAL '1 minute')
        ORDER BY v.timestamp DESC
        LIMIT 1
      ), 0),
      'thresholds', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', t.id,
            'setting_id', t.setting_id,
            'upper_threshold', t.upper_threshold,
            'color', t.color,
            'alert', t.alert,
            'alert_message_control', t.alert_message_control,
            'alert_message', t.alert_message,
            'type', t.type
          )
        )
        FROM public.thresholds t
        WHERE t.setting_id = a.id
      ), '[]'::jsonb)
    )
  FROM public.area_settings a;
END;
$$;

