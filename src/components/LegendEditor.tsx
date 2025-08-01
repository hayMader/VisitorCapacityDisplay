import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash, Save } from 'lucide-react';
import { useAreaStatus } from '@/contexts/AreaStatusContext';

interface LegendEditorProps {
  currentPage: "security" | "management";
}

const LegendEditor: React.FC<LegendEditorProps> = ({ currentPage }) => {

    const { updateLegendRows, refreshLegends, setLegendRows, legendRows} = useAreaStatus(); // Access legend rows and update function from context

    // Function to handle updating legend rows
    const handleLegendUpdate = async () => {
      await updateLegendRows(legendRows)
    }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <span>Legenden Einstellungen</span>
      <p className="text-muted-foreground mb-4">
        Fügen Sie der Legende einen neuen, eindeutigen Wert hinzu, um Unklarheiten zu vermeiden.
      </p>

      <div className="grid grid-cols-[2fr,2fr,0.5fr,2fr,2fr,0.5fr] gap-4 items-center mb-4">
        <Label className="col-span-1">Abkürzung (Deutsch)</Label>
        <Label className="col-span-1">Abkürzung (Englisch)</Label>
        <Label className="col-span-1">Farbe</Label>
        <Label className="col-span-1">Beschreibung (Deutsch)</Label>
        <Label className="col-span-1">Beschreibung (Englisch)</Label>
      </div>

      <div className="space-y-6">
        {legendRows.map((row, index) => ( // Map through legend rows and render input controls
          <>
          {row.type == currentPage && ( // Ensure the row type matches the current page
            <>
              <div
                key={row.id}
                className="grid grid-cols-[2fr,2fr,0.5fr,2fr,2fr,0.5fr] gap-4 items-center"
              >
                {/* Input for Object (DE) */}
                <Input
                  type="text"
                  value={row.object}
                  onChange={(e) => {
                    const updatedRows = [...legendRows];
                    updatedRows[index].object = e.target.value;
                    setLegendRows((updatedRows));
                  }}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Abkürzung / #RRGGBB"
                />

                {/* Input for Object (EN) */}
                <Input
                  type="text"
                  value={row.object_en}
                  onChange={(e) => {
                    const updatedRows = [...legendRows];
                    updatedRows[index].object_en = e.target.value;
                    setLegendRows(updatedRows);
                  }}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Abkürzung"
                  disabled={/^#[0-9A-Fa-f]{6}$/.test(row.object)}
                />

                {/* Color picker for hex color */}
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(row.object) ? row.object : '#000000'}
                  onChange={(e) => {
                    const updatedRows = [...legendRows];
                    updatedRows[index].object = e.target.value;
                    console.log('Updated color:', updatedRows[index], e.target.value);
                    setLegendRows(updatedRows);
                  }}
                  className="w-8 h-8 p-0 border rounded-md"
                />

                {/* Input field description_de */}
                <Input
                  type="text"
                  value={row.description_de}
                  onChange={(e) => {
                    const updatedRows = [...legendRows];
                    updatedRows[index].description_de = e.target.value;
                    setLegendRows(updatedRows);
                  }}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Beschreibung"
                />

                {/* Input field description_en */}
                <Input
                  type="text"
                  value={row.description_en}
                  onChange={(e) => {
                    const updatedRows = [...legendRows];
                    updatedRows[index].description_en = e.target.value;
                    setLegendRows(updatedRows);
                  }}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Beschreibung"
                />

                <button
                  onClick={() => {
                    const updatedRows = legendRows.filter((_, i) => i !== index);
                    setLegendRows(updatedRows);
                  }}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
          </>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-end mt-6 gap-3">
        <button
          onClick={refreshLegends}
          className="text-sm text-accent-foreground focus:outline-none"
        >
          Zurücksetzen
        </button>
        <Button
          variant="outline"
          onClick={() =>
            // Add a new legend row with default values
            setLegendRows([
              ...legendRows,
              { id: Date.now(), object: '', object_en: '', description_de: '', description_en: '', type: currentPage},
            ])
          }
        >
          + Hinzufügen
        </Button>
        <Button variant="default" onClick={handleLegendUpdate}>
          <Save className="h-4 w-4" />
          Speichern
        </Button>
      </div>
    </div>
  );
};

export default LegendEditor;