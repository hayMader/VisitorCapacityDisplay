/* ------------------------------------------------------------------
   Area-Configurator   (styled like AreaSettingsAccordion)
------------------------------------------------------------------- */
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

/* ─────────────────────   props   ───────────────────── */
export interface AreaConfiguratorProps {
  /** currently selected hall (or undefined for “new hall”) */
  selectedArea?: AreaStatus;
  /** propagate changes back to parent (admin.tsx) */
  onSave: (updated: AreaStatus) => void;
  onClose?: () => void;
}

/* ───────────────────── component ───────────────────── */
const AreaConfigurator: React.FC<AreaConfiguratorProps> = ({
  selectedArea,
  onSave,
}) => {
  /* initial state ------------------------------------------------- */
  const [nameDe, setNameDe] = useState(selectedArea?.area_name ?? "");
  const [nameEn, setNameEn] = useState(selectedArea?.area_name_en ?? "");
  const [coords, setCoords] = useState<
    { x: number; y: number }[]
  >(
    selectedArea?.coordinates?.length
      ? selectedArea.coordinates
      : [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
  );

  /* handlers ------------------------------------------------------- */
  const updateCoord = (
    idx: number,
    axis: "x" | "y",
    value: string,
  ) => {
    const c = [...coords];
    c[idx][axis] = Number(value) || 0;
    setCoords(c);
  };

  const addPoint = () =>
    setCoords([...coords, { x: 0, y: 0 }]);

  const reset = () => {
    setNameDe("");
    setNameEn("");
    setCoords([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  };

  const handleSave = () => {
    if (!nameDe.trim() || !nameEn.trim()) return;
    const base: AreaStatus =
      selectedArea ??
      ({
        id: Date.now(), // temp id for new hall
        area_name: "",
        area_name_en: "",
        coordinates: [],
        /* + the other AreaStatus fields with sensible defaults */
      } as unknown as AreaStatus);

    onSave({
      ...base,
      area_name: nameDe,
      area_name_en: nameEn,
      coordinates: coords,
    });
  };

  /* ─────────────────── UI ─────────────────── */
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="config"
      className="w-full"
    >
      <AccordionItem value="config">
        <AccordionTrigger className="py-4">
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            <span className="text">Areal-Koordinaten</span>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          {/* names -------------------------------------------------- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Bereichsname (DE)
              </label>
              <Input
                value={nameDe}
                placeholder="z. B. B3"
                onChange={(e) => setNameDe(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Bereichsname (EN)
              </label>
              <Input
                value={nameEn}
                placeholder="e.g. B3"
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-4" />

          {/* coordinates ------------------------------------------- */}
          <p className="font-medium mb-2">Koordinaten</p>
          {coords.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-4 mb-2"
            >
              <Input
                type="number"
                value={c.x}
                onChange={(e) =>
                  updateCoord(i, "x", e.target.value)
                }
                placeholder={`X${i + 1}`}
              />
              <Input
                type="number"
                value={c.y}
                onChange={(e) =>
                  updateCoord(i, "y", e.target.value)
                }
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
            Hinzufügen
          </Button>

          {/* footer buttons ---------------------------------------- */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={reset}
            >
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
