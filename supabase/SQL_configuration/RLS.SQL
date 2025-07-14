-- Enable RLS for all tables
ALTER TABLE area_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_data ENABLE ROW LEVEL SECURITY;

-- Create policies for area_settings
CREATE POLICY select_area_settings ON area_settings
FOR SELECT
USING (true); -- Everyone can read

CREATE POLICY alter_area_settings ON area_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM roles WHERE roles.user_id = auth.uid() AND roles.role = 'admin' -- Only admins can alter
  )
);


-- Create policies for legend
CREATE POLICY select_legend ON legend
FOR SELECT
USING (true); -- Everyone can read

CREATE POLICY alter_legend ON legend
FOR ALL
USING (
  
  EXISTS (
    SELECT 1 FROM roles WHERE roles.user_id = auth.uid()
  )
);

-- Create policies for roles
CREATE POLICY select_roles ON roles
FOR SELECT
USING (auth.uid() IS NOT NULL); -- Only authenticated users can read

CREATE POLICY no_alter_roles ON roles
FOR ALL
USING (false); -- Nobody can alter the roles table

-- Create policies for thresholds
CREATE POLICY public_select_thresholds ON thresholds
FOR SELECT
USING (type != 'security'); -- Non-authenticated users cannot read rows with type='security'

CREATE POLICY security_select_thresholds ON thresholds
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM roles WHERE roles.user_id = auth.uid() AND roles.role = 'security' -- Only security can read
  )
);

CREATE POLICY insert_thresholds ON thresholds
FOR ALL
USING (
  (type = 'management' AND EXISTS (
    SELECT 1 FROM roles WHERE roles.user_id = auth.uid() AND roles.role = 'admin'
  )) OR
  (type = 'security' AND EXISTS (
    SELECT 1 FROM roles WHERE roles.user_id = auth.uid() AND roles.role = 'security'
  ))
);

-- Create policies for visitor_data
CREATE POLICY select_visitor_data ON visitor_data
FOR SELECT
USING (true); -- Everyone can read

CREATE POLICY no_alter_visitor_data ON visitor_data
FOR ALL
USING (false); -- Nobody can alter visitor_data