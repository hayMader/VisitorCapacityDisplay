DROP FUNCTION copy_thresholds_to_areas_by_type(integer, integer[], text);
CREATE OR REPLACE FUNCTION copy_thresholds_to_areas_by_type(
  source_area_id INTEGER,
  target_area_ids INTEGER[],
  threshold_type TEXT
)
RETURNS VOID AS $$
DECLARE
  source_rec RECORD;
  target_id INTEGER;
BEGIN
  -- Step 1: Delete thresholds of the given type from the target areas
  DELETE FROM thresholds
  WHERE setting_id = ANY(target_area_ids)
    AND type = threshold_type;

  -- Step 2: Loop over each threshold of the given type in the source area
  FOR source_rec IN
    SELECT * FROM thresholds
    WHERE setting_id = source_area_id
      AND type = threshold_type
  LOOP
    -- Step 3: Insert a copy into each target area
    FOREACH target_id IN ARRAY target_area_ids
    LOOP
      INSERT INTO thresholds (
        setting_id,
        upper_threshold,
        color,
        type,
        alert,
        alert_message,
        alert_message_control
      )
      VALUES (
        target_id,
        source_rec.upper_threshold,
        source_rec.color,
        source_rec.type,
        source_rec.alert,
        source_rec.alert_message,
        source_rec.alert_message_control
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
