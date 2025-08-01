-- function to create a new area 

DROP FUNCTION public.create_new_area;
CREATE OR REPLACE FUNCTION create_new_area(type_input TEXT)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  a area_settings;
BEGIN
  -- Insert new area_settings row using the provided type
  INSERT INTO area_settings (
    area_name,
    area_name_en,
    capacity_usage,
    coordinates,
    highlight,
    hidden_name,
    hidden_absolute,
    hidden_percentage,
    type,
    status
  ) VALUES (
    'Neuer Bereich',         -- area_name
    NULL,                    -- area_name_en
    0,                       -- capacity_usage
    '[{"x": 30, "y": 20}, {"x": 300, "y": 20}, {"x": 300, "y": 150}, {"x": 30, "y": 150}]',                    -- coordinates (as empty JSON array)
    NULL,                    -- highlight
    false,                   -- hidden_name
    false,                   -- hidden_absolute
    false,                   -- hidden_percentage
    type_input,              -- type (from function parameter)
    'inactive'               -- status
  )
  RETURNING * INTO a;

  -- Return the inserted row as a flat JSON matching AreaStatus interface
  RETURN to_jsonb(a) || jsonb_build_object(
    'amount_visitors', 0,
    'thresholds', '[]'::jsonb
  );
END;
$$;
