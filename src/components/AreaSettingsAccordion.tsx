import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { AreaStatus, Threshold } from '@/types';
import { updateAreaSettings } from '@/utils/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Settings, SlidersHorizontal, Move, Save } from 'lucide-react';
import ThresholdItemActions from '@/components/ui/ThresholdItemActions';   // ↓ new helper component
import NewThresholdForm from '@/components/ui/NewThresholdForm';
import AreaGeneralSettings from '@/components/ui/AreaGeneralSettings';
import AreaPositionSettings from '@/components/ui/AreaPositionSettings';
import { isEqual } from 'lodash';
   export const MAX_LEVELS = 4;   // <— NEU: jetzt vier Stufen erlaubt

interface AreaSettingsAccordionProps {
  area: AreaStatus;
  onUpdate: (updatedArea: AreaStatus) => void;
}

const AreaSettingsAccordion: React.FC<AreaSettingsAccordionProps> = ({
  area,
  onUpdate,
}) => {
  /* --------------------------------------------------------------------- */
  /*  state                                                                */
  /* --------------------------------------------------------------------- */
  const [originalData, setOriginalData] = useState<AreaStatus>(area);
  const [formData, setFormData] = useState<AreaStatus>(area);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const [newThreshold, setNewThreshold] = useState({
    upper_threshold: 0,
    color: '#cccccc',
  });

  /* threshold row currently in inline-edit mode (null = none) */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edited, setEdited] = useState<{ upper_threshold: number; color: string }>(
    { upper_threshold: 0, color: '#cccccc' }
  );

  /* --------------------------------------------------------------------- */
  /*  sync when area prop changes                                          */
  /* --------------------------------------------------------------------- */
  useEffect(() => {
    setOriginalData(area);
    setFormData(area);
  }, [area]);

  /* detect unsaved edits */
  useEffect(() => {
    setIsLoading(!originalData);
    if (!formData) setFormData(originalData);
    setHasChanges(!isEqual(formData, originalData));
  }, [formData, originalData]);

  /* --------------------------------------------------------------------- */
  /*  generic field change (name, capacity, coords …)                      */
  /* --------------------------------------------------------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof AreaStatus
  ) => {
    const v = e.target.value;
    const parsed =
      typeof area[field] === 'number' ? (parseInt(v, 10) || 0) : (v as any);

    setFormData((prev) => ({
      ...prev,
      [field]: parsed,
    }));
  };

  /* --------------------------------------------------------------------- */
  /*  add new threshold (client-side only until Save)                      */
  /* --------------------------------------------------------------------- */
  const handleAddThreshold = () => {
    if (newThreshold.upper_threshold <= 0) {
      toast({
        title: 'Ungültiger Grenzwert',
        description: 'Der Grenzwert muss größer als 0 sein.',
        variant: 'destructive',
      });
      return;
    }
     if (formData.thresholds.length >= MAX_LEVELS) {
      toast({
        title: 'Limit erreicht',
        description: `Maximal ${MAX_LEVELS} Grenzwerte sind erlaubt.`,
        variant: 'destructive',
      });
      return;
    }

    // contiguous validation
    const maxSoFar = Math.max(
      0,
      ...formData.thresholds.map((t) => t.upper_threshold)
    );
    if (newThreshold.upper_threshold <= maxSoFar) {
      toast({
        title: 'Grenzwert zu niedrig',
        description: `Er muss größer sein als ${maxSoFar}.`,
        variant: 'destructive',
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
      alert_message: '',
    };

    setFormData((prev) => ({
      ...prev,
      thresholds: [...prev.thresholds, threshold],
    }));
    setNewThreshold({ upper_threshold: 0, color: '#cccccc' });

    toast({
      title: 'Grenzwert hinzugefügt',
      description: `Neuer Grenzwert bei ${threshold.upper_threshold} wurde hinzugefügt.`,
    });
  };

  /* --------------------------------------------------------------------- */
  /*  inline edit helpers                                                  */
  /* --------------------------------------------------------------------- */
  const beginEdit = (t: Threshold) => {
    setEditingId(t.id);
    setEdited({ upper_threshold: t.upper_threshold, color: t.color });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: number) => {
    const idx = formData.thresholds.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const prevUpper = idx === 0 ? 0 : formData.thresholds[idx - 1].upper_threshold;
    const nextUpper =
      idx === formData.thresholds.length - 1
        ? Infinity
        : formData.thresholds[idx + 1].upper_threshold;

    /* validation */
    if (
      edited.upper_threshold <= prevUpper ||
      edited.upper_threshold >= nextUpper
    ) {
      toast({
        title: 'Ungültiger Grenzwert',
        description: `Er muss zwischen ${prevUpper + 1} und ${
          nextUpper === Infinity ? '∞' : nextUpper - 1
        } liegen.`,
        variant: 'destructive',
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      thresholds: prev.thresholds.map((t) =>
        t.id === id
          ? { ...t, upper_threshold: edited.upper_threshold, color: edited.color }
          : t
      ),
    }));
    setEditingId(null);
    toast({
      title: 'Grenzwert aktualisiert',
      description: 'Speichern Sie, um Änderungen zu übernehmen.',
    });
  };

  const deleteThreshold = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      thresholds: prev.thresholds.filter((t) => t.id !== id),
    }));
    toast({
      title: 'Grenzwert gelöscht',
      description: 'Speichern Sie, um Änderungen zu übernehmen.',
    });
  };

  /* --------------------------------------------------------------------- */
  /*  submit to backend                                                    */
  /* --------------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      /* palette = three hex codes sorted by upper_threshold */
      const palette = formData.thresholds
        .sort((a, b) => a.upper_threshold - b.upper_threshold)
        .slice(0, MAX_LEVELS)
        .map((t) => t.color);

      let updated: AreaStatus | null = null;
      if (!isEqual(formData, originalData)) {
        updated = await updateAreaSettings(area.id, {
          ...formData,
          palette,
        });
      }

      /* refresh CSS custom properties so public map re-colours instantly */
      palette.forEach((hex, i) => {
        document.documentElement.style.setProperty(`--heat-${i + 1}`, hex);
      });

      /* reflect new state locally & in parent */
      if (updated) {
        setOriginalData(updated);
        onUpdate(updated);
      } else {
        setOriginalData(formData);
        onUpdate(formData);
      }

      toast({
        title: 'Einstellungen aktualisiert',
        description: `Die Einstellungen für ${area.area_name} wurden erfolgreich aktualisiert.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Fehler',
        description: 'Die Einstellungen konnten nicht aktualisiert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --------------------------------------------------------------------- */
  /*  UI                                                                    */
  /* --------------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Einstellungen werden geladen …</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Accordion type="single" collapsible defaultValue="general" className="w-full">
        {/* ---------------------------------------------------------- */}
        {/* Allgemeine Einstellungen                                   */}
        {/* ---------------------------------------------------------- */}
        <AccordionItem value="general">
          <AccordionTrigger className="py-4">
            <Settings className="mr-2 h-5 w-5" />
            Allgemeine Einstellungen
          </AccordionTrigger>
          <AccordionContent>
            <AreaGeneralSettings formData={formData} onChange={handleChange} />
          </AccordionContent>
        </AccordionItem>

        {/* ---------------------------------------------------------- */}
        {/* Grenzwerte                                                 */}
        {/* ---------------------------------------------------------- */}
        <AccordionItem value="thresholds">
          <AccordionTrigger className="py-4">
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Grenzwerte Besucherzahl
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
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
                            className="grid grid-cols-[auto_auto_auto_1fr_auto] items-center gap-2 p-2 border-b last:border-0"
                          >
                            {/* colour dot / picker (simple <input type="color">) */}
                            {isEditing ? (
                              <input
                                type="color"
                                value={edited.color}
                                onChange={(e) =>
                                  setEdited((p) => ({ ...p, color: e.target.value }))
                                }
                                className="h-4 w-4"
                              />
                            ) : (
                              <div
                                className="h-4 w-4 rounded-full border"
                                style={{ background: t.color }}
                              />
                            )}

                            {/* lower bound (readonly) */}
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {lower}
                            </span>

                            {/* “bis” label */}
                            <span className="text-xs text-muted-foreground">bis</span>

                            {/* upper bound */}
                            {isEditing ? (
                              <input
                                type="number"
                                className="input w-20"
                                value={edited.upper_threshold}
                                onChange={(e) =>
                                  setEdited((p) => ({
                                    ...p,
                                    upper_threshold: parseInt(e.target.value, 10) || 0,
                                  }))
                                }
                              />
                            ) : (
                              <span className="w-20 text-right">{t.upper_threshold}</span>
                            )}

                            {/* action buttons */}
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
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Keine Grenzwerte definiert.</p>
              )}

              {/* -------------------------------------------------- */}
              {/* Neues Level hinzufügen                            */}
              {/* -------------------------------------------------- */}
              <NewThresholdForm
                newThreshold={newThreshold}
                onChange={(chg) =>
                  setNewThreshold((p) => ({ ...p, ...chg }))
                }
                onAdd={handleAddThreshold}
                disabled={formData.thresholds.length >= MAX_LEVELS}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ---------------------------------------------------------- */}
        {/* Position                                                  */}
        {/* ---------------------------------------------------------- */}
        <AccordionItem value="position">
          <AccordionTrigger className="py-4">
            <Move className="mr-2 h-5 w-5" />
            Anpassung Areal
          </AccordionTrigger>
          <AccordionContent>
            <AreaPositionSettings formData={formData} onChange={handleChange} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting || !hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Speichern …' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
};

export default AreaSettingsAccordion;
