import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Plus, Save, MapPin, Trash, X } from "lucide-react";
import { AreaStatus } from "@/types";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { deleteArea } from "@/utils/api";
import { useAreaStatus } from "@/contexts/AreaStatusContext";

/* ─────────────────────   props   ───────────────────── */
export interface AreaConfiguratorProps {
  selectedArea?: AreaStatus;
  setFormData: (data: AreaStatus) => void;
  onSave: () => void;
  onClose?: () => void;
}


const emptyCoords = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
];

const AreaConfigurator: React.FC<AreaConfiguratorProps> = ({
  selectedArea,
  setFormData,
  onSave,
  onClose,
}) => {

  const { refreshAreaStatus } = useAreaStatus();

  const handleSave = async () => {
    onSave()
  };

  const handleDeleteArea = async () => {
    if (!selectedArea) return;

    try {
      // Call API to delete area
      await deleteArea(selectedArea.id);
      setFormData(null); // Clear selected area
      refreshAreaStatus(); // Refresh area status context
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);


  return (
    <>
    <Accordion type="single" defaultValue="config" className="w-full">
      <AccordionItem value="config">
        <AccordionTrigger className="py-4">
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            <span className="text">Areal-Koordinaten</span>
          </div>
        </AccordionTrigger>

        <AccordionContent>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Bereichsname (Deutsch)
              </label>
              <Input
                value={selectedArea?.area_name || ""}
                placeholder="Bereichsname (DE)"
                onChange={(e) => setFormData({ ...selectedArea, area_name: e.target.value })} // Update form data directly
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Bereichsname (Englisch)
              </label>
              <Input
                value={selectedArea?.area_name_en || ""}
                placeholder="Bereichsname (EN)"
                onChange={(e) => setFormData({ ...selectedArea, area_name_en: e.target.value })} // Update form data directly
              />
            </div>
          </div>

          <Separator className="my-4" />


          <p className="font-medium mb-2">Koordinaten</p>
          {selectedArea?.coordinates.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-[32px_1fr_32px_1fr_auto] items-center gap-2 mb-2"
            >
              {/* X Label */}
              <span>X:</span>

              {/* X Input */}
              <Input
                type="number"
                value={c.x}
                onChange={(e) => setFormData({ ...selectedArea, coordinates: selectedArea?.coordinates.map((coord, idx) => idx === i ? { ...coord, x: Number(e.target.value) || 0 } : coord) })}	
                placeholder={`X${i + 1}`}
              />

              {/* Y Label */}
              <span>Y:</span>

              {/* Y Input */}
              <Input
                type="number"
                value={c.y}
                onChange={(e) => setFormData({ ...selectedArea, coordinates: selectedArea?.coordinates.map((coord, idy) => idy === i ? { ...coord, y: Number(e.target.value) || 0 } : coord) })}
                placeholder={`Y${i + 1}`}
              />

              {/* Delete Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updated = [...selectedArea?.coordinates];
                  updated.splice(i, 1);
                  setFormData({ ...selectedArea, coordinates: updated });
                }}
                className="text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setFormData({ ...selectedArea, coordinates: [...(selectedArea?.coordinates || emptyCoords), { x: 0, y: 0 }] })} // Add a new coordinate
          >
            <Plus className="mr-1 h-4 w-4" />
            Koordinate&nbsp;hinzufügen
          </Button>


          <div className="mt-6 flex justify-end gap-3">
            <button className="text-destructive"
              onClick={() => setIsConfirmDialogOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4"/>
            </button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              <X className="mr-1 h-4 w-4" />
              Schließen
            </Button>

            <Button
              type="button"
              onClick={handleSave}
            >
              <Save className="mr-1 h-4 w-4" />
              Speichern
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    {/* Confirmation Dialog */}
    <ConfirmationDialog
      open={isConfirmDialogOpen}
      title="Bereich löschen"
      description={`Sind Sie sicher, dass Sie den Bereich "${selectedArea?.area_name}" löschen möchten?`}
      onConfirm={() => {
        handleDeleteArea();
        setIsConfirmDialogOpen(false); // Close dialog after confirming
      }}
      onCancel={() => setIsConfirmDialogOpen(false)} // Close dialog on cancel
    />
    </>
  );
};

export default AreaConfigurator;