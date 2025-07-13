-- This function updates the area settings and thresholds based on the provided JSONB input.

CREATE OR REPLACE FUNCTION public.update_area_settings(area_id INT, setting_json JSONB)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    threshold JSONB;
    threshold_id INTEGER;
    input_ids INTEGER[];
    upper_val DOUBLE PRECISION;
BEGIN
    -- 1. Update area_settings
    UPDATE public.area_settings
    SET
      area_name = setting_json->>'area_name',
      area_name_en = setting_json->>'area_name_en',
      capacity_usage = (setting_json->>'capacity_usage')::FLOAT,
      highlight = setting_json->>'highlight',
      hidden_name = (setting_json->>'hidden_name')::BOOLEAN,
      hidden_absolute = (setting_json->>'hidden_absolute')::BOOLEAN,
      hidden_percentage = (setting_json->>'hidden_percentage')::BOOLEAN,
      coordinates = (setting_json->> 'coordinates')::jsonb,
      status = setting_json->> 'status'
    WHERE id = area_id;

    -- 3. Loop over incoming threshold array
    input_ids := ARRAY[]::INTEGER[];
    FOR threshold IN SELECT * FROM jsonb_array_elements(setting_json->'thresholds')
    LOOP
        -- Set upper_val to infinity if null or empty
        IF (threshold->>'upper_threshold') IS NULL OR (threshold->>'upper_threshold') = '' THEN
            upper_val := 'infinity'::DOUBLE PRECISION;
        ELSE
            upper_val := (threshold->>'upper_threshold')::DOUBLE PRECISION;
        END IF;

        IF (threshold->>'id') IS NULL OR (threshold->>'id')::FLOAT < 0 THEN
            -- New threshold: insert
            INSERT INTO public.thresholds (setting_id, upper_threshold, color, alert, alert_message_control, alert_message, type)
            VALUES (
                area_id,
                upper_val,
                threshold->>'color',
                (threshold->>'alert')::BOOLEAN,
                (threshold->>'alert_message_control')::BOOLEAN,
                threshold->>'alert_message',
                threshold->>'type'
            )
            RETURNING id INTO STRICT threshold_id;

            input_ids := input_ids || threshold_id;
        ELSE
            -- Existing threshold: update
            UPDATE public.thresholds
            SET
                upper_threshold = upper_val,
                color = threshold->>'color',
                alert = (threshold->>'alert')::BOOLEAN,
                alert_message_control=(threshold->>'alert_message_control')::BOOLEAN,
                alert_message = threshold->>'alert_message'
            WHERE id = (threshold->>'id')::INTEGER AND setting_id = area_id;

            input_ids := input_ids || (threshold->>'id')::INTEGER;
        END IF;
    END LOOP;

    -- 4. Delete thresholds that are not in input
    DELETE FROM public.thresholds
    WHERE setting_id = area_id AND NOT (id = ANY(input_ids));

END;
$$;


