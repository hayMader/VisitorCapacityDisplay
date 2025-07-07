import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Bell, Copy } from "lucide-react";
import ThresholdItemActions from "@/components/ui/ThresholdItemActions";
import NewThresholdForm from "@/components/ui/NewThresholdForm";
import { Threshold, AreaStatus } from "@/types";

interface ThresholdSettingsProps {
  formData: AreaStatus;
  setFormData: React.Dispatch<React.SetStateAction<AreaStatus>>;
  newThreshold: Partial<Threshold>;
  setNewThreshold: React.Dispatch<React.SetStateAction<Partial<Threshold>>>;
  type: "security" | "management";
  MAX_LEVELS: number;
  onCopyThresholds: () => void;
}

const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({
  formData,
  setFormData,
  newThreshold,
  setNewThreshold,
  type,
  MAX_LEVELS,
  onCopyThresholds,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edited, setEdited] = useState<Partial<Threshold>>({
    upper_threshold: 0,
    color: "#cccccc",
    alert: false,
    alert_message: "",
  });

  const handleAddThreshold = () => {
    if (newThreshold.upper_threshold <= 0) {
      toast({
        title: "Ungültiger Schwellenwert",
        description: "Der Schwellenwert muss größer als 0 sein.",
        variant: "destructive",
      });
      return;
    }
    if (formData.thresholds.filter((t) => t.type === type).length >= MAX_LEVELS) {
      toast({
        title: "Limit erreicht",
        description: `Maximal ${MAX_LEVELS} Schwellenwerte erlaubt.`,
        variant: "destructive",
      });
      return;
    }

    const maxSoFar = Math.max(0, ...formData.thresholds.filter((t) => t.type === type).map((t) => t.upper_threshold));
    if (newThreshold.upper_threshold <= maxSoFar) {
      toast({
        title: "Schwellenwert zu niedrig",
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
      alert: newThreshold.alert,
      type: type,
      alert_message: newThreshold.alert_message,
    };

    setFormData((p) => ({ ...p, thresholds: [...p.thresholds, threshold] }));
    setNewThreshold({ upper_threshold: 0, color: "#cccccc", alert: false, alert_message: "" });
  };

  const beginEdit = (t: Threshold) => {
    setEditingId(t.id);
    setEdited({
      upper_threshold: t.upper_threshold,
      color: t.color,
      alert: t.alert,
      alert_message: t.alert_message,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: number) => {
    setFormData((p) => ({
      ...p,
      thresholds: p.thresholds.map((t) =>
        t.id === id ? { ...t, ...edited } : t
      ),
    }));
    setEditingId(null);
  };

  const toggleAlert = (id: number) => {
      setFormData((p) => ({
        ...p,
        thresholds: p.thresholds.map((t) =>
          t.id === id ? { ...t, alert: !t.alert } : t
        ),
      }));
    };
  
  const deleteThreshold = (id: number) => {
      setFormData((p) => ({
        ...p,
        thresholds: p.thresholds.filter((t) => t.id !== id),
      }));
    };

  const updateAlertMessage = (id: number, message: string) => {
    setFormData((p) => ({
      ...p,
      thresholds: p.thresholds.map((t) =>
        t.id === id ? { ...t, alert_message: message } : t
      ),
    }));
  };

  // Filter and sort thresholds of the specified type
  const thresholdsOfType = formData.thresholds
    .filter((t) => t.type === type)
    .sort((a, b) => a.upper_threshold - b.upper_threshold);

  // Calculate the lower bound for new thresholds
  const lowerBound = thresholdsOfType.length
    ? thresholdsOfType[thresholdsOfType.length - 1].upper_threshold + 1
    : 1;

  return (
    <div className="space-y-4 py-2">
      {/* List of Existing Thresholds */}
      {formData.thresholds.filter((t) => t.type === type).length ? (
        <div className="space-y-2">
          <Label>Aktuelle Schwellenwerte</Label>
          <div className="border rounded-md">
            {formData.thresholds
              .filter((t) => t.type === type)
              .sort((a, b) => a.upper_threshold - b.upper_threshold)
              .map((t, idx, arr) => {
                const lower = idx === 0 ? 0 : arr[idx - 1].upper_threshold + 1;
                const isEditing = editingId === t.id;

                return (
                <>
                  <div
                    key={t.id}
                    className="grid grid-cols-[24px_72px_24px_72px_auto] items-center gap-2 p-2 border-b last:border-0 relative"
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
                    {/* Alert Icon */}
                    {type === "security" && (
                    
                    <div
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-2 group"
                      onClick={() => toggleAlert(t.id)}
                    >
                      <span
                        className={`cursor-pointer ${t.alert ? "text-red-500" : "text-gray-400"}`}
                        title={t.alert ? "Nachricht: " + (t.alert_message || "Keine Nachricht definiert.") : ""}
                      >
                        <Bell className="h-4 w-4" />
                      </span>
                    </div>
                    )}
                  </div>
                  {                    isEditing && (
                    <div className="p-2 bg-gray-50 border-t">
                      <Label className="text-sm">Warnhinweis Nachricht</Label>
                      <Input
                        type="text"
                        value={edited.alert_message}
                        onChange={(e) =>
                          setEdited((p) => ({ ...p, alert_message: e.target.value }))
                        }
                        className="w-full"
                      />
                    </div>

                  )}
                  </>
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
        <p className="text-muted-foreground">Aktuell keine Schwellenwerte definiert.</p>
      )}

      {/* New Threshold */}
      <NewThresholdForm
        newThreshold={newThreshold}
        onChange={(c) => setNewThreshold((p) => ({ ...p, ...c }))}
        onAdd={handleAddThreshold}
        disabled={formData.thresholds.filter((t) => t.type === type).length >= MAX_LEVELS}
        type={type}
        lowerBound={lowerBound}
      />
    </div>
  );
};

export default ThresholdSettings;