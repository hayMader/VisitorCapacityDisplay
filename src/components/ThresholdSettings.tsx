import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Copy } from "lucide-react";
import ThresholdItemActions from "@/components/ui/ThresholdItemActions";
import NewThresholdForm from "@/components/ui/NewThresholdForm";
import { Threshold, AreaStatus } from "@/types";

interface ThresholdSettingsProps {
  formData: AreaStatus;
  setFormData: React.Dispatch<React.SetStateAction<AreaStatus>>;
  newThreshold: { upper_threshold: number; color: string };
  setNewThreshold: React.Dispatch<
    React.SetStateAction<{ upper_threshold: number; color: string }>
  >;
  MAX_LEVELS: number;
  onCopyThresholds: () => void;
}

const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({
  formData,
  setFormData,
  newThreshold,
  setNewThreshold,
  MAX_LEVELS,
  onCopyThresholds,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edited, setEdited] = useState<{ upper_threshold: number; color: string }>({
    upper_threshold: 0,
    color: "#cccccc",
  });

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
      setting_id: formData.id,
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

  return (
    <div className="space-y-4 py-2">
      {/* List of Existing Thresholds */}
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
                    {/* Color */}
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

                    {/* From */}
                    <Input
                      type="number"
                      value={lower}
                      readOnly
                      disabled
                      className="w-16 bg-transparent border-none p-0 text-right
                                 focus-visible:ring-0 cursor-default select-none"
                    />

                    <span className="text-xs text-muted-foreground">bis</span>

                    {/* To */}
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
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={onCopyThresholds}
            className="flex items-center"
          >
            <Copy className="h-4 w-4" />
            Schwellenwerte kopieren
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground">Keine Grenzwerte definiert.</p>
      )}

      {/* New Threshold */}
      <NewThresholdForm
        newThreshold={newThreshold}
        onChange={(c) => setNewThreshold((p) => ({ ...p, ...c }))}
        onAdd={handleAddThreshold}
        disabled={formData.thresholds.length >= MAX_LEVELS}
      />
    </div>
  );
};

export default ThresholdSettings;