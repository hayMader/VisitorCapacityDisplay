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
import { updateAreaSettings } from "@/utils/api";

/* ─────────────────────   props   ───────────────────── */
export interface AreaConfiguratorProps {
  selectedArea?: AreaStatus;
  onSave: (updated: AreaStatus) => void;
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
  onSave,
  onClose,
}) => {

  const [nameDe, setNameDe] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [coords, setCoords] = useState<{ x: number; y: number }[]>([]);

  // Whenever selectedArea changes, update local state:
  useEffect(() => {
    setNameDe(selectedArea?.area_name ?? "");
    setNameEn(selectedArea?.area_name_en ?? "");
    setCoords(
      selectedArea?.coordinates?.length
        ? selectedArea.coordinates
        : [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ]
    );
  }, [selectedArea]);


  const updateCoord = (idx: number, axis: "x" | "y", value: string) => {
    const c = [...coords];
    c[idx][axis] = Number(value) || 0;
    setCoords(c);
  };

  const addPoint = () => setCoords([...coords, { x: 0, y: 0 }]);

  const handleSave = async () => {
    if (!nameDe.trim() || !nameEn.trim() || !selectedArea) return;

    try {
      const updated: AreaStatus = {
        ...selectedArea,
        area_name: nameDe,
        area_name_en: nameEn,
        coordinates: coords,
    };

    await updateAreaSettings(updated.id, updated);

    toast({
      title: "Erfolgreich gespeichert",
      description: `Die Änderungen für ${updated.area_name} wurden übernommen.`,
    });

    onSave(updated);
  
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };


  return (
    <Accordion type="single" collapsible defaultValue="config" className="w-full">
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
                value={nameDe}
                placeholder="Bereichsname (DE)"
                onChange={(e) => setNameDe(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Bereichsname (Englisch)
              </label>
              <Input
                value={nameEn}
                placeholder="Bereichsname (EN)"
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-4" />


          <p className="font-medium mb-2">Koordinaten</p>
          {coords.map((c, i) => (
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
                onChange={(e) => updateCoord(i, "x", e.target.value)}
                placeholder={`X${i + 1}`}
              />

              {/* Y Label */}
              <span>Y:</span>

              {/* Y Input */}
              <Input
                type="number"
                value={c.y}
                onChange={(e) => updateCoord(i, "y", e.target.value)}
                placeholder={`Y${i + 1}`}
              />

              {/* Delete Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updated = [...coords];
                  updated.splice(i, 1);
                  setCoords(updated);
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
            onClick={addPoint}
          >
            <Plus className="mr-1 h-4 w-4" />
            Koordinate&nbsp;hinzufügen
          </Button>


          <div className="mt-6 flex justify-end gap-3">
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
              disabled={!nameDe.trim() || !nameEn.trim()}
            >
              <Save className="mr-1 h-4 w-4" />
              Speichern
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AreaConfigurator;