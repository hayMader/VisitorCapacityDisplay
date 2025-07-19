import { VisitorData, AreaSettings, OccupancyLevel, AreaStatus, Threshold, LegendRow, AreaType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Function to get the latest visitor data
export const getVisitorData = async (): Promise<VisitorData[]> => {
  try {
    const { data, error } = await supabase
      .from('visitor_data')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return (data || []).map((item: any) => ({
      ...item,
      alert: item.alert || false,
      alert_message: item.alert_message || '',
    }));
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    return [];
  }
};

// Function to get area settings
export const getAreaSettings = async (filter_minutes?: number): Promise<AreaStatus[]> => {
  try {
    const { data, error } = await supabase.rpc("get_area_status_filtered", { filter_minutes: filter_minutes || 0 });

    console.log('Fetched area settings:', data);
    if (error) throw error;
    
    return data
  } catch (error) {
    console.error('Error fetching area settings:', error);
    return [];
  }
};

// function to create new Area

export const createNewArea = async (type: AreaType = "hall") => {
  try {
    const { data, error } = await supabase.rpc("create_new_area", { type_input: type });
    if (error) throw error;
    toast({
      title: "Erfolg",
      description: "Ein neuer Bereich wurde erfolgreich angelegt",
      variant: "default",
    });
    return data;
  } catch (error) {
    toast({
      title: "Fehler",
      description: "Ein neuer Bereich konnte nicht angelegt werden",
      variant: "destructive",
    });
  }
};

export const deleteArea = async (areaId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('area_settings')
      .delete()
      .eq('id', areaId);
    
    if (error) throw error;
    toast({
      title: "Erfolg",
      description: "Der Bereich wurde erfolgreich gelöscht.",
      variant: "default",
    });
    return true;
  } catch (error) {
    console.error('Error deleting area:', error);
    toast({
      title: "Fehler",
      description: "Der Bereich konnte nicht gelöscht werden.",
      variant: "destructive",
    });
    return false;
  }
}

// Function to get thresholds for a specific area
export const getThresholds = async (areaId: number): Promise<Threshold[]> => {
  try {
    const { data, error } = await supabase
      .from('thresholds')
      .select('*')
      .eq('setting_id', areaId)
      .order('upper_threshold', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching thresholds:', error);
    return [];
  }
};

// Function to update area settings
export const updateAreaSettings = async (areaId: number, settings: Partial<AreaSettings>): Promise<AreaSettings | null> => {
  try {
    console.log('Updating area settings:', areaId, settings);
    const { data, error } = await supabase.rpc('update_area_settings', {area_id: areaId, setting_json: settings});
    console.log('Updated area settings:', areaId, data);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating area settings:', error);
    return null;
  }
};

// Function to update threshold
export const updateThreshold = async (thresholdId: number, threshold: Partial<Threshold>): Promise<Threshold | null> => {
  try {
    const { data, error } = await supabase
      .from('thresholds')
      .update(threshold)
      .eq('id', thresholdId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating threshold:', error);
    return null;
  }
};

// Function to create a new threshold
export const createThreshold = async (threshold: Partial<Threshold>): Promise<Threshold | null> => {
  try {
    const { data, error } = await supabase
      .from('thresholds')
      .insert(threshold)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating threshold:', error);
    return null;
  }
};

// Function to delete a threshold
export const deleteThreshold = async (thresholdId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('thresholds')
      .delete()
      .eq('id', thresholdId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting threshold:', error);
    return false;
  }
};

//Function to copy thresholds from one area to multiple target areas
export const copyThresholdsToAreas = async (sourceAreaId: number, targetAreaIds: number[], thresholdtype: "management"| "security") => {
  try {
    
    const { error } = await supabase.rpc('copy_thresholds_to_areas_by_type', {source_area_id: sourceAreaId, target_area_ids: targetAreaIds, threshold_type: thresholdtype});

    if (error) throw error;

  } catch (error) {
    console.error('Error copying thresholds:', error);
    throw error;
  }
};

// Function to add visitor data
export const addVisitorData = async (visitorData: Omit<VisitorData, 'id' | 'timestamp'>): Promise<VisitorData | null> => {
  try {
    const { data, error } = await supabase
      .from('visitor_data')
      .insert(visitorData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding visitor data:', error);
    return null;
  }
};

// Function to determine occupancy level based on visitor count and thresholds
export const getOccupancyLevel = (visitorCount: number, thresholds: Threshold[]) => {
  // Sort thresholds by upper_threshold in ascending order
  const sortedThresholds = [...thresholds].sort((a, b) => a.upper_threshold - b.upper_threshold);
  
  // Find the first threshold that has an upper_threshold greater than or equal to visitorCount
  return sortedThresholds.find(threshold => visitorCount <= threshold.upper_threshold);
};

// Function to get color based on occupancy level
export const getOccupancyColor = (threshold?: Threshold): string => {
  if (!threshold) return '#cccccc'; // Default gray color if no threshold applies
  return threshold.color;
};


export const updateLegend = async (LegendRows: Partial<LegendRow>[]) => {
  try {
    console.log('Updating legend rows:', LegendRows); 
    const { data, error } = await supabase.rpc('update_legend', { legend_rows: LegendRows });
    if (error) throw error;

     toast({
        title: "Erfolg",
        description: "Die Legende wurde erfolgreich aktualisiert.",
        variant: "default",
      });
    return data;
  } catch (error) {
    console.error('Error updating legend:', error);
    toast({
        title: "Fehler",
        description: "Die Legende konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
  }
}

export const getLegend = async (): Promise<LegendRow[]> => {
  try {
    const { data, error } = await supabase
      .from('legend')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching legend:', error);
    return [];
  }
}