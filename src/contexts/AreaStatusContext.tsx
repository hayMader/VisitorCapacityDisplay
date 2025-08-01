import React, { createContext, useContext, useState, useEffect } from "react";
import { AreaStatus, LegendRow } from "@/types";
import { getAreaSettings, getLegend, updateLegend, updateAreaSettings } from "@/utils/api";
import { toast } from "@/components/ui/use-toast";

interface AreaStatusContextProps {
  areaStatus: AreaStatus[];
  refreshAreaStatusAndLegend: (timefilter?: number) => Promise<void>;
  refreshAreaStatus: (timefilter?: number) => Promise<void>;
  updateAreaStatus: (updatedArea: AreaStatus) => void;
  isRefreshing: boolean;
  selectedArea: AreaStatus | null;
  setSelectedArea: React.Dispatch<React.SetStateAction<AreaStatus | null>>;
  legendRows: Partial<LegendRow>[];
  setLegendRows: React.Dispatch<React.SetStateAction<Partial<LegendRow>[]>>;
  setAreaStatus: React.Dispatch<React.SetStateAction<AreaStatus[]>>;
  updateLegendRows: (updatedLegend: Partial<LegendRow>[]) => Promise<void>;
  refreshLegends: () => Promise<void>;
}

/*---- 
  Context to provide all data and interaction functions surrounding area_status and legend data 
  used in different parts of the project where interaction with this data is necessary
----*/

const AreaStatusContext = createContext<AreaStatusContextProps | undefined>(undefined);

export const AreaStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [areaStatus, setAreaStatus] = useState<AreaStatus[]>([]);
  const [isRefreshing, setRefreshing] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaStatus | null>(null);
  const [legendRows, setLegendRows] = useState<Partial<LegendRow>[]>([{ object: "", object_en: "", description_de: "", description_en: "" }]);

  // Fetch initial data area status and legend
  const refreshAreaStatusAndLegend = async (timefilter?: number) => {
    try {
      setRefreshing(true);
      const data = await getAreaSettings(timefilter);
      const data2 = await getLegend();
      setLegendRows(data2)
      setAreaStatus(data);
      setRefreshing(false);
    } catch (error) {
      console.error("Error refreshing area status:", error);
      toast({
        title: "Fehler",
        description: "Die Bereichsdaten konnten nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  // Refresh only area status
  const refreshAreaStatus = async (timefilter?: number) => {
    try {
      setRefreshing(true);
      const data = await getAreaSettings(timefilter);
      setAreaStatus(data);
      setRefreshing(false);
    } catch (error) {
      console.error("Error refreshing area status:", error);
      toast({
        title: "Fehler",
        description: "Die Bereichsdaten konnten nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  //refresh only legends
  const refreshLegends = async () => {
    try {
      const data = await getLegend();
      setLegendRows(data);
    } catch (error) {
      console.error("Error refreshing legend rows:", error);
      toast({
        title: "Fehler",
        description: "Die Legende konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  // update the legend rows
  const updateLegendRows = async (updatedLegend: Partial<LegendRow>[]) => {
      setLegendRows(updatedLegend);
      await updateLegend(updatedLegend);
  };

  // Update a specific area in the state
  const updateAreaStatus = async (updatedArea: AreaStatus) => {
    setAreaStatus((prev) =>
      prev.map((area) => (area.id === updatedArea.id ? updatedArea : area))
    );
    await updateAreaSettings(updatedArea.id, updatedArea);
    refreshAreaStatus(); // Optionally refresh the entire list after an update
  };

  return (
    // wraps children with attributes as context
    <AreaStatusContext.Provider value={{ areaStatus, selectedArea, legendRows, setLegendRows, updateLegendRows, refreshLegends, setSelectedArea, refreshAreaStatus, refreshAreaStatusAndLegend, isRefreshing, updateAreaStatus, setAreaStatus }}>
      {children}
    </AreaStatusContext.Provider>
  );
};

export const useAreaStatus = (): AreaStatusContextProps => {
  const context = useContext(AreaStatusContext);
  if (!context) {
    throw new Error("useAreaStatus must be used within an AreaStatusProvider");
  }
  return context;
};