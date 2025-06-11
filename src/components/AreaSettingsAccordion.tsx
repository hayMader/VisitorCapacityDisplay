import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Settings,
  SlidersHorizontal,
  Copy,
  Save,
} from "lucide-react";

import ThresholdItemActions from "@/components/ui/ThresholdItemActions";
import NewThresholdForm from "@/components/ui/NewThresholdForm";
import AreaGeneralSettings from "@/components/ui/AreaGeneralSettings";
import AreaPositionSettings from "@/components/ui/AreaPositionSettings";
import CopyThresholdsModal from "@/components/ui/CopyThresholdsModal";
import { AreaStatus, Threshold } from "@/types";
import { updateAreaSettings, copyThresholdsToAreas } from "@/utils/api";

import { isEqual } from "lodash";

export const MAX_LEVELS = 4; // ab jetzt 4 Stufen möglich

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface Props {
  area: AreaStatus;
  onUpdate: (a: AreaStatus) => void;
  allAreas: AreaStatus[]; // List of all areas for copying thresholds
}

const AreaSettingsAccordion: React.FC<Props> = ({ area, onUpdate, allAreas }) => {
  /* ---------------------------------------------------------------- */
  /*  State                                                           */
  /* ---------------------------------------------------------------- */
  const [originalData, setOriginalData] = useState<AreaStatus>(area);
  const [formData, setFormData] = useState<AreaStatus>(area);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const [newThreshold, setNewThreshold] = useState({
    upper_threshold: 0,
    color: "#cccccc",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [edited, setEdited] = useState<{ upper_threshold: number; color: string }>({
    upper_threshold: 0,
    color: "#cccccc",
  });

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false); // Modal for copying thresholds

  /* ---------------------------------------------------------------- */
  /*  Sync incoming area → local state                                 */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    setOriginalData(area);
    console.log(area);
    console.log(formData);
    setFormData(area);
  }, [area]);

  useEffect(() => {
    setIsLoading(!originalData);
    if (!formData) setFormData(originalData);
    setHasChanges(!isEqual(formData, originalData));
  }, [formData, originalData]);

  /* ---------------------------------------------------------------- */
  /*  Field-Change Handler (Name, Capacity, Display Options)           */
  /* ---------------------------------------------------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof AreaStatus
  ) => {
    const value = e.target.value;
    
    // Handle different field types
    let parsed: any;
    if (field === 'hidden_name' || field === 'hidden_absolute' || field === 'hidden_percentage') {
      // Boolean fields
      parsed = Boolean(value);
    } else if (typeof area[field] === "number") {
      // Numeric fields
      parsed = parseInt(value, 10) || 0;
    } else {
      // String fields
      parsed = value;
    }

    setFormData((p) => ({ ...p, [field]: parsed }));
  };

  /* ---------------------------------------------------------------- */
  /*  Threshold Add / Edit / Delete                                    */
  /* ---------------------------------------------------------------- */
  const handleAddThreshold = () => {
    if (newThreshold.upper_threshold <= 0) {
      toast({
        title: "Ungültiger Grenzwert",
        description: "Der Grenzwert muss größer als 0 sein.",
        variant: "destructive",
      });
      return;
    }
    if (formData.thresholds.length >= MAX_LEVELS) {
      toast({
        title: "Limit erreicht",
        description: `Maximal ${MAX_LEVELS} Grenzwerte erlaubt.`,
        variant: "destructive",
      });
      return;
    }

    const maxSoFar = Math.max(0, ...formData.thresholds.map((t) => t.upper_threshold));
    if (newThreshold.upper_threshold <= maxSoFar) {
      toast({
        title: "Grenzwert zu niedrig",
        description: `Er muss größer sein als ${maxSoFar}.`,
        variant: "destructive",
      });
      return;
    }

    const tempId = -Date.now();
    const threshold: Threshold = {
      id: tempId,
      setting_id: area.id,
      upper_threshold: newThreshold.upper_threshold,
      color: newThreshold.color,
      alert: false,
      alert_message: "",
    };

    setFormData((p) => ({ ...p, thresholds: [...p.thresholds, threshold] }));
    setNewThreshold({ upper_threshold: 0, color: "#cccccc" });
  };

  const beginEdit = (t: Threshold) => {
    setEditingId(t.id);
    setEdited({ upper_threshold: t.upper_threshold, color: t.color });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: number) => {
    const idx = formData.thresholds.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const prev = idx === 0 ? 0 : formData.thresholds[idx - 1].upper_threshold;
    const next =
      idx === formData.thresholds.length - 1
        ? Infinity
        : formData.thresholds[idx + 1].upper_threshold;

    if (edited.upper_threshold <= prev || edited.upper_threshold >= next) {
      toast({
        title: "Ungültiger Grenzwert",
        description: `Er muss zwischen ${prev + 1} und ${
          next === Infinity ? "∞" : next - 1
        } liegen.`,
        variant: "destructive",
      });
      return;
    }

    setFormData((p) => ({
      ...p,
      thresholds: p.thresholds.map((t) =>
        t.id === id ? { ...t, ...edited } : t
      ),
    }));
    setEditingId(null);
  };

  const deleteThreshold = (id: number) => {
    setFormData((p) => ({
      ...p,
      thresholds: p.thresholds.filter((t) => t.id !== id),
    }));
  };

  /* ---------------------------------------------------------------- */
  /*  Submit                                                          */
  /* ---------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let updatedArea = null;
      if (!isEqual(formData, originalData)) {    
        updatedArea = await updateAreaSettings(area.id, formData);
      }
      
      
      // If any changes were made, refetch the latest data
      if (hasChanges) {        
        setOriginalData(formData);
        
        // Notify parent
        onUpdate(formData);
        
        toast({
          title: 'Einstellungen aktualisiert',
          description: `Die Einstellungen für ${area.area_name} wurden erfolgreich aktualisiert.`,
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Fehler',
        description: 'Die Einstellungen konnten nicht aktualisiert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Copy Thresholds                                                 */
  /* ---------------------------------------------------------------- */

  const handleCopyThresholds = async (targetAreaIds: number[]) => {
    try {
      await copyThresholdsToAreas(area.id, targetAreaIds);
      toast({
        title: "Erfolgreich kopiert",
        description: "Die Schwellenwerte wurden erfolgreich auf die ausgewählten Areale übertragen.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler",
        description: "Kopieren der Schwellenwerte fehlgeschlagen.",
        variant: "destructive",
      });
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Einstellungen werden geladen …</p>
      </div>
    );
  }

  return (
    <div>
    <form onSubmit={handleSubmit}>
      <Accordion type="single" collapsible defaultValue="general" className="w-full">
        {/* ---------------- allgemeine Einstellungen ---------------- */}
        <AccordionItem value="general">
          <AccordionTrigger className="py-4">
            <div className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              <span className='text'>Allgemeine Einstellungen</span>
            </div>            
          </AccordionTrigger>
          <AccordionContent>
            <AreaGeneralSettings formData={formData} onChange={handleChange} />
          </AccordionContent>
        </AccordionItem>

        {/* ---------------- Grenzwerte ---------------- */}
        <AccordionItem value="thresholds">
          <AccordionTrigger className="py-4">
            <div className="flex items-center">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              <span className='text'>Grenzwerte Besucherzahl</span>
            </div>     
          </AccordionTrigger>

          <AccordionContent>
            <div className="space-y-4 py-2">
              {/* Liste bestehender Schwellen */}
              {formData.thresholds.length ? (
                <div className="space-y-2">
                  <Label>Aktuelle Grenzwerte</Label>
                  <div className="border rounded-md">
                    {formData.thresholds
                      .sort((a, b) => a.upper_threshold - b.upper_threshold)
                      .map((t, idx, arr) => {
                        const lower = idx === 0 ? 0 : arr[idx - 1].upper_threshold + 1;
                        const isEditing = editingId === t.id;

                        return (
                          <div
                            key={t.id}
                            className="grid grid-cols-[24px_72px_24px_72px_auto] items-center gap-2 p-2 border-b last:border-0"
                          >
                            {/* Farbe */}
                            {isEditing ? (
                              <input
                                type="color"
                                value={edited.color}
                                onChange={(e) =>
                                  setEdited((p) => ({ ...p, color: e.target.value }))
                                }
                                className="h-6 w-6 p-0 border rounded"
                              />
                            ) : (
                              <div
                                className="h-4 w-4 rounded-full border"
                                style={{ background: t.color }}
                              />
                            )}

                            {/* von */}
                            <Input
                              type="number"
                              value={lower}
                              readOnly
                              disabled
                              className="w-16 bg-transparent border-none p-0 text-right
                                         focus-visible:ring-0 cursor-default select-none"
                            />

                            <span className="text-xs text-muted-foreground">bis</span>

                            {/* bis */}
                            {isEditing ? (
                              <Input
                                type="number"
                                value={edited.upper_threshold}
                                onChange={(e) =>
                                  setEdited((p) => ({
                                    ...p,
                                    upper_threshold: parseInt(e.target.value, 10) || 0,
                                  }))
                                }
                                className="w-16"
                              />
                            ) : (
                              <Input
                                type="number"
                                value={t.upper_threshold}
                                readOnly
                                disabled
                                className="w-16 bg-transparent border-none p-0 text-right
                                           focus-visible:ring-0 cursor-default"
                              />
                            )}

                            {/* Action Icons */}
                            <ThresholdItemActions
                              isEditing={isEditing}
                              onEdit={() => beginEdit(t)}
                              onSave={() => saveEdit(t.id)}
                              onCancel={cancelEdit}
                              onDelete={() => deleteThreshold(t.id)}
                            />
                            
                          </div>
                        );
                      })}
                      {/* Copy Thresholds Button */}
                
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCopyModalOpen(true)}
                    className="flex items-center"
                    >
                    <Copy className="h-4 w-4" />
                    Schwellenwerte kopieren
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Keine Grenzwerte definiert.</p>
              )}

              {/* Neuer Schwellenwert */}
              <NewThresholdForm
                newThreshold={newThreshold}
                onChange={(c) => setNewThreshold((p) => ({ ...p, ...c }))}
                onAdd={handleAddThreshold}
                disabled={formData.thresholds.length >= MAX_LEVELS}
              />

              

            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Area Position Settings */}
        {/* <AccordionItem value="position">
          <AccordionTrigger className="py-4">
            <div className="flex items-center">
              <Move className="mr-2 h-5 w-5" />
              <span className='text'>Anpassung Areal</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AreaPositionSettings formData={formData} onChange={handleChange} />
          </AccordionContent>
        </AccordionItem> */}
      </Accordion>

      {/* ---------- Footer (Speichern) ---------- */}
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting || !hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Speichern …" : "Speichern"}
        </Button>
      </div>
    </form>

    {/*Model for copying thresholds*/}
    <CopyThresholdsModal
      open={isCopyModalOpen}
      onClose={() => setIsCopyModalOpen(false)}
      sourceArea={formData}
      allAreas={allAreas}
      onApply={handleCopyThresholds}
    />
  </div>
  );
};

export default AreaSettingsAccordion;