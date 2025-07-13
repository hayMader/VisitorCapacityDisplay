
-- This function updates the legend table by first deleting all existing rows and then inserting new rows based on the provided JSONB array.

create or replace function update_legend(legend_rows jsonb)
returns void
language plpgsql
as $$
begin
  -- Delete all existing rows
  DELETE FROM legend WHERE true;

  -- Insert new rows from the passed JSONB array
  insert into legend("object", "object_en", "description_de", "description_en")
  select 
    value->>'object',
    value->>'object_en',
    value->>'description_de',
    value->>'description_en'
  from jsonb_array_elements(legend_rows) as value;
end;
$$;
