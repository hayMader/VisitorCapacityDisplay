import { VisitorData, AreaSettings, AreaStatus, Threshold, LegendRow, AreaType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";


/* ----- all interaction with supabase is defined here, functions can be reused across the application and routes can be exchanged when changing backend----*/

/**
 * Function to get area settings.
 * @param filter_minutes - Optional number of minutes to filter area settings.
 * @returns A promise that resolves to an array of `AreaStatus` objects.
 */
export const getAreaSettings = async (filter_minutes?: number): Promise<AreaStatus[]> => {
  try {
    const { data, error } = await supabase.rpc("get_area_status_filtered", { filter_minutes: filter_minutes || 0 });

    console.log('Fetched area settings:', data);
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching area settings:', error);
    return [];
  }
};

/**
 * Function to create a new area.
 * @param type - The type of area to create (default is "hall").
 * @returns A promise that resolves to the created `AreaStatus` object or `undefined` if an error occurs.
 */
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

/**
 * Function to delete an area.
 * @param areaId - The ID of the area to delete.
 * @returns A promise that resolves to `true` if the area was successfully deleted, or `false` if an error occurs.
 */
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
};

/**
 * Function to update area settings.
 * @param areaId - The ID of the area to update.
 * @param settings - Partial settings object containing the fields to update.
 * @returns A promise that resolves to the updated `AreaSettings` object or `null` if an error occurs.
 */
export const updateAreaSettings = async (areaId: number, settings: Partial<AreaSettings>): Promise<AreaSettings | null> => {
  try {
    console.log('Updating area settings:', areaId, settings);
    const { data, error } = await supabase.rpc('update_area_settings', { area_id: areaId, setting_json: settings });
    console.log('Updated area settings:', areaId, data);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating area settings:', error);
    return null;
  }
};

/**
 * Function to delete a threshold.
 * @param thresholdId - The ID of the threshold to delete.
 * @returns A promise that resolves to `true` if the threshold was successfully deleted, or `false` if an error occurs.
 */
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

/**
 * Function to copy thresholds from one area to multiple target areas.
 * @param sourceAreaId - The ID of the source area.
 * @param targetAreaIds - An array of IDs of the target areas.
 * @param thresholdtype - The type of threshold to copy ("management" or "security").
 * @returns A promise that resolves to `void`.
 */
export const copyThresholdsToAreas = async (sourceAreaId: number, targetAreaIds: number[], thresholdtype: "management" | "security") => {
  try {
    const { error } = await supabase.rpc('copy_thresholds_to_areas_by_type', { source_area_id: sourceAreaId, target_area_ids: targetAreaIds, threshold_type: thresholdtype });

    if (error) throw error;
  } catch (error) {
    console.error('Error copying thresholds:', error);
    throw error;
  }
};

/**
 * Function to update the legend.
 * @param LegendRows - An array of partial `LegendRow` objects to update.
 * @returns A promise that resolves to the updated legend data or `undefined` if an error occurs.
 */
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
};

/**
 * Function to fetch the legend.
 * @returns A promise that resolves to an array of `LegendRow` objects or an empty array if an error occurs.
 */
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
};