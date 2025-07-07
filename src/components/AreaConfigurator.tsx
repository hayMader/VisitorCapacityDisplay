import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, Undo2, MapPin } from "lucide-react";
import { AreaStatus } from "@/types";


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
}) => {
  const [nameDe, setNameDe] = useState(selectedArea?.area_name ?? "");
  const [nameEn, setNameEn] = useState(selectedArea?.area_name_en ?? "");
  const [coords, setCoords] = useState<{ x: number; y: number }[]>(
    selectedArea?.coordinates?.length ? selectedArea.coordinates : emptyCoords,
  );


  const updateCoord = (idx: number, axis: "x" | "y", value: string) => {
    const c = [...coords];
    c[idx][axis] = Number(value) || 0;
    setCoords(c);
  };

  const addPoint = () => setCoords([...coords, { x: 0, y: 0 }]);

  const reset = () => {
    setNameDe("");
    setNameEn("");
    setCoords(emptyCoords);
  };


  const newArea = () => reset();

  const handleSave = () => {
    if (!nameDe.trim() || !nameEn.trim()) return;

    const base: AreaStatus =
      selectedArea ??
      ({
        id: Date.now(),            
        area_name: "",
        area_name_en: "",
        coordinates: [],
        thresholds: [],
        amount_visitors: 0,
        capacity_usage: 0,
        hidden_name: false,
        hidden_absolute: false,
        hidden_percentage: false,
      } as unknown as AreaStatus);

    onSave({
      ...base,
      area_name: nameDe,
      area_name_en: nameEn,
      coordinates: coords,
    });
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
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={newArea}>
              <Plus className="mr-1 h-4 w-4" />
              Neues&nbsp;Areal
            </Button>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Bereichsname&nbsp;(DE)
              </label>
              <Input
                value={nameDe}
                placeholder="z. B. B3"
                onChange={(e) => setNameDe(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Bereichsname&nbsp;(EN)
              </label>
              <Input
                value={nameEn}
                placeholder="e.g. B3"
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-4" />


          <p className="font-medium mb-2">Koordinaten</p>
          {coords.map((c, i) => (
            <div key={i} className="grid grid-cols-2 gap-4 mb-2">
              <Input
                type="number"
                value={c.x}
                onChange={(e) => updateCoord(i, "x", e.target.value)}
                placeholder={`X${i + 1}`}
              />
              <Input
                type="number"
                value={c.y}
                onChange={(e) => updateCoord(i, "y", e.target.value)}
                placeholder={`Y${i + 1}`}
              />
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
            <Button type="button" variant="outline" onClick={reset}>
              <Undo2 className="mr-1 h-4 w-4" />
              Zurücksetzen
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
