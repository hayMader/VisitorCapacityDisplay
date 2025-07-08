import React, { createContext, useContext, useState, useEffect } from "react";
import { AreaStatus } from "@/types";
import { getAreaSettings, updateAreaSettings } from "@/utils/api";
import { toast } from "@/components/ui/use-toast";

interface AreaStatusContextProps {
  areaStatus: AreaStatus[];
  refreshAreaStatus: () => Promise<void>;
  updateAreaStatus: (updatedArea: AreaStatus) => void;
  isRefreshing: boolean;
  selectedArea: AreaStatus | null;
  setSelectedArea: React.Dispatch<React.SetStateAction<AreaStatus | null>>;
}

const AreaStatusContext = createContext<AreaStatusContextProps | undefined>(undefined);

export const AreaStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [areaStatus, setAreaStatus] = useState<AreaStatus[]>([]);
  const [isRefreshing, setRefreshing] = useState(false);
const [selectedArea, setSelectedArea] = useState<AreaStatus | null>(null);

  // Fetch initial data
  const refreshAreaStatus = async () => {
    try {
      setRefreshing(true);
      const data = await getAreaSettings();
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
  }, []);

  return (
    <AreaStatusContext.Provider value={{ areaStatus, selectedArea, setSelectedArea, refreshAreaStatus, isRefreshing, updateAreaStatus }}>
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