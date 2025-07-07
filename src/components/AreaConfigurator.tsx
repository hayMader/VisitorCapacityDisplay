// src/components/AreaConfigurator.tsx

import React, { useState } from "react";
import { AreaStatus } from "@/types";
import { Coordinate } from "recharts/types/util/types";

type AreaConfiguratorProps = {
  selectedArea?: AreaStatus | null;
  onSave: (updatedArea: AreaStatus) => void;
  onClose: () => void;
};

const AreaConfigurator: React.FC<AreaConfiguratorProps> = ({ selectedArea, onSave, onClose }) => {
  const [nameDe, setNameDe] = useState(selectedArea?.area_name || "");
  const [nameEn, setNameEn] = useState(selectedArea?.area_name_en || "");
  const [coordinates, setCoordinates] = useState<Coordinate[]>(
    selectedArea?.coordinates || Array(4).fill({ x: 0, y: 0 })
  );

  const handleCoordChange = (index: number, key: "x" | "y", value: number) => {
    const updated = [...coordinates];
    updated[index][key] = value;
    setCoordinates(updated);
  };

  const handleAddCoord = () => {
    setCoordinates([...coordinates, { x: 0, y: 0 }]);
  };

  const handleReset = () => {
    setNameDe("");
    setNameEn("");
    setCoordinates(Array(4).fill({ x: 0, y: 0 }));
  };

  const handleSave = () => {
    if (!selectedArea) return;
    onSave({
      ...selectedArea,
      area_name: nameDe,
      area_name_en: nameEn,
      coordinates,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Anpassung Areal</h3>
        <button
          className="text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
          onClick={() => { onClose(); }}
        >
          + Neues Areal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Bereichsname (Deutsch)</label>
          <input
            value={nameDe}
            onChange={(e) => setNameDe(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="B3"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Bereichsname (Englisch)</label>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="B3"
          />
        </div>
      </div>

      <div>
        <label className="font-medium block mb-2">Koordinaten</label>
        {coordinates.map((coord, index) => (
          <div className="grid grid-cols-2 gap-4 mb-2" key={index}>
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder={`X${index + 1}`}
              value={coord.x}
              onChange={(e) => handleCoordChange(index, "x", parseInt(e.target.value) || 0)}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder={`Y${index + 1}`}
              value={coord.y}
              onChange={(e) => handleCoordChange(index, "y", parseInt(e.target.value) || 0)}
            />
          </div>
        ))}

        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={handleAddCoord}
        >
          + Hinzufügen
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <span className="inline-block mr-1">🞁</span>
        Oder nutzen Sie das Fadenkreuz, um den Wert für die aktuelle Koordinate auf der Karte auszuwählen.
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={handleReset} className="text-sm px-4 py-2 border rounded">
          Zurücksetzen
        </button>
        <button
          onClick={handleSave}
          className="text-sm px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Speichern
        </button>
      </div>
    </div>
  );
};

export default AreaConfigurator;
