import React, { createContext, useContext, useState, useEffect } from "react";
import { AreaStatus, LegendRow } from "@/types";
import { getAreaSettings, getLegend, refreshLegend, updateAreaSettings } from "@/utils/api";
import { toast } from "@/components/ui/use-toast";

interface AreaStatusContextProps {
  areaStatus: AreaStatus[];
  refreshAreaStatus: () => Promise<void>;
  updateAreaStatus: (updatedArea: AreaStatus) => void;
  isRefreshing: boolean;
  selectedArea: AreaStatus | null;
  setSelectedArea: React.Dispatch<React.SetStateAction<AreaStatus | null>>;
  legendRows: Partial<LegendRow>[];
  setLegendRows: React.Dispatch<React.SetStateAction<Partial<LegendRow>[]>>;
  setTimeFilter: React.Dispatch<React.SetStateAction<number>>;
  timeFilter: number;
}

const AreaStatusContext = createContext<AreaStatusContextProps | undefined>(undefined);

export const AreaStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [areaStatus, setAreaStatus] = useState<AreaStatus[]>([]);
  const [isRefreshing, setRefreshing] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaStatus | null>(null);
  const [legendRows, setLegendRowsState] = useState<Partial<LegendRow>[]>([{ object: "", object_en: "", description_de: "", description_en: "" }]);
  const [timeFilter, setTimeFilter] = useState(1440);

  // Fetch initial data
  const refreshAreaStatus = async () => {
    try {
      setRefreshing(true);
      const data = await getAreaSettings(timeFilter);
      const data2 = await getLegend();
      setLegendRows(data2)
      console.log("Fetched area settings:", data2);
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

  // Refresh the legend rows
  const setLegendRows = async (updatedLegend: Partial<LegendRow>[]) => {
    try {
      setLegendRowsState(updatedLegend);
      const data = await refreshLegend(updatedLegend);
      console.log("Legend rows refreshed:", data);
    } catch (error) {
      console.error("Error refreshing legend rows:", error);
      toast({
        title: "Fehler",
        description: "Die Legende konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  // Update a specific area in the state
  const updateAreaStatus = (updatedArea: AreaStatus) => {
    setAreaStatus((prev) =>
      prev.map((area) => (area.id === updatedArea.id ? updatedArea : area))
    );
    updateAreaSettings(updatedArea.id, updatedArea);
    refreshAreaStatus(); // Optionally refresh the entire list after an update
  };

  useEffect(() => {
    refreshAreaStatus();
  }, [timeFilter]);

  return (
    <AreaStatusContext.Provider value={{ areaStatus, selectedArea, legendRows, setLegendRows, setTimeFilter, timeFilter, setSelectedArea, refreshAreaStatus, isRefreshing, updateAreaStatus }}>
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