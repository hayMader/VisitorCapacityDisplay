DROP VIEW public.area_status;

-- Create a simplified view for easier access to combined data

-- Create or replace a view to simplify access to combined area settings, visitor data, and thresholds.
CREATE OR REPLACE VIEW public.area_status AS
SELECT 
    a.*, -- Include all columns from the area_settings table.
    
    -- Retrieve the latest visitor count for each area.
    COALESCE((
        SELECT v.amount_visitors 
        FROM public.visitor_data v 
        WHERE v.area_id = a.id -- Match visitor data by area ID.
        ORDER BY v.timestamp DESC -- Get the most recent record.
        LIMIT 1 -- Limit to one record.
    ), 0) AS amount_visitors, -- Default to 0 if no visitor data is found.

    -- Aggregate thresholds associated with each area setting into a JSONB array.
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', t.id, -- Threshold ID.
                'setting_id', t.setting_id, -- Associated setting ID.
                'upper_threshold', t.upper_threshold, -- Upper threshold value.
                'color', t.color, -- Color indicator.
                'alert', t.alert, -- Alert flag.
                'alert_message', t.alert_message, -- Alert message text.
                'type', t.type -- Threshold type.
            )
        )
        FROM public.thresholds t
        WHERE t.setting_id = a.id -- Match thresholds by area setting ID.
    ) AS thresholds -- Store aggregated thresholds as a JSONB array.

FROM 
    public.area_settings a; -- Query all area settings.
