import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AreaStatus } from "@/types";
import { useAreaStatus } from "@/contexts/AreaStatusContext";

// Define the props for the CopyThresholdsModal component
interface CopyThresholdsModalProps {
  open: boolean;
  onClose: () => void;
  sourceArea: AreaStatus;
  onApply: (targetAreaIds: number[]) => void;
}

const CopyThresholdsModal: React.FC<CopyThresholdsModalProps> = ({
  open,
  onClose,
  sourceArea,
  onApply,
}) => {
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]); //Array to hold the IDs of selected areas
  const { areaStatus } = useAreaStatus();

  // Reset selectedAreaIds when the modal is closed
  useEffect(() => {
    if (!open) {
      setSelectedAreaIds([]);
    }
  }, [open]);

  // Function to toggle the selection of an area (if area is already selected, it will be removed from the array; if not, it will be added)
  const toggleArea = (id: number) => {
    setSelectedAreaIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Function to pass the selected areas to the parent component and close the modal
  const handleApply = () => {
    onApply(selectedAreaIds);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Bitte wählen Sie die Areale aus, auf die die Einstellungen angewendet werden sollen
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 py-4 max-h-[300px] overflow-y-auto">
          {areaStatus
            .filter((a) => a.id !== sourceArea.id) // Exclude the source area from the list
            .sort((a, b) => a.area_name.localeCompare(b.area_name)) // Sort areas by name
            .map((a) => (
              <Button
                key={a.id}
                variant={selectedAreaIds.includes(a.id) ? "default" : "outline"}
                onClick={() => toggleArea(a.id)}
              >
                {a.area_name}
              </Button>
            ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleApply} disabled={!selectedAreaIds.length}>
            Anwenden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyThresholdsModal;