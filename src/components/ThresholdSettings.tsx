import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Bell, Copy, Mail } from "lucide-react";
import ThresholdItemActions from "@/components/ui/ThresholdItemActions";
import NewThresholdForm from "@/components/ui/NewThresholdForm";
import { Threshold, AreaStatus } from "@/types";

interface ThresholdSettingsProps {
  formData: AreaStatus;
  setFormData: React.Dispatch<React.SetStateAction<AreaStatus>>;
  newThreshold: Partial<Threshold>;
  setNewThreshold: React.Dispatch<React.SetStateAction<Partial<Threshold>>>;
  type: "security" | "management";
  onCopyThresholds: () => void;
}

const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({
  formData,
  setFormData,
  newThreshold,
  setNewThreshold,
  type,
  onCopyThresholds,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edited, setEdited] = useState<Partial<Threshold>>({
    upper_threshold: -1,
    color: "#cccccc",
    alert: false,
    alert_message: "",
    alert_message_control: false, // Default to false
  });

  const handleAddThreshold = () => {

    //If infinity treshhold check if it is already set
    if (newThreshold.upper_threshold === -1 || newThreshold.upper_threshold === 0) {
      const existing = formData.thresholds.find((t) => t.type === type && t.upper_threshold === -1);
      if (existing) {
        toast({
          title: "Höchster Schwellenwert bereits gesetzt",
          description: `Der Schwellenwert für ${type} ist bereits auf unendlich gesetzt.`,
          variant: "destructive",
        });
        return;
      }
    }

    const maxSoFar = Math.max(0, ...formData.thresholds.filter((t) => t.type === type).map((t) => t.upper_threshold));

    if (newThreshold.upper_threshold <= maxSoFar && newThreshold.upper_threshold !== -1 && newThreshold.upper_threshold !== 0) {
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
      upper_threshold: newThreshold.upper_threshold ? newThreshold.upper_threshold : -1,
      color: newThreshold.color,
      alert: newThreshold.alert,
      type: type,
      alert_message_control: newThreshold.alert_message_control,
      alert_message: newThreshold.alert_message,
    };

    setFormData((p) => ({ ...p, thresholds: [...p.thresholds, threshold] }));
    setNewThreshold({ upper_threshold: -1, color: "#cccccc", alert: false, alert_message: "" });
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

    const toggleAlertMessage = (id: number) => {
    setFormData((p) => ({
      ...p,
      thresholds: p.thresholds.map((t) =>
        t.id === id ? { ...t, alert_message_control: !t.alert_message_control } : t
      ),
    }));
  };

  const deleteThreshold = (id: number) => {
    setFormData((p) => ({
      ...p,
      thresholds: p.thresholds.filter((t) => t.id !== id),
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
              .sort((a, b) => {
                const upperA = a.upper_threshold === -1 ? Infinity : a.upper_threshold;
                const upperB = b.upper_threshold === -1 ? Infinity : b.upper_threshold;
                return upperA - upperB;
              })
              .map((t, idx, arr) => {
                const lower = idx === 0 ? 0 : (arr[idx - 1].upper_threshold === -1 ? Infinity : arr[idx - 1].upper_threshold) + 1;
                const isEditing = editingId === t.id;

                return (
                  <>
                    <div
                      key={t.id}
                      className="grid grid-cols-[24px_72px_24px_72px_auto_auto_auto_auto] items-center gap-2 p-2 border-b last:border-0"
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
                        value={lower === Infinity ? "∞" : lower}
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
                          value={edited.upper_threshold === -1 ? "" : edited.upper_threshold}
                          onChange={(e) =>
                            setEdited((p) => ({
                              ...p,
                              upper_threshold: e.target.value === "" ? -1 : parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-16"
                        />
                      ) : (
                        <Input
                          type="text"
                          value={t.upper_threshold === -1 ? "∞" : t.upper_threshold}
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
                      {/* Message Icon */}
                      {type === "security" && (
                      
                      <button
                        type="button"
                        onClick={() => toggleAlertMessage(t.id)}
                        className={`h-6 w-6 flex items-center justify-center rounded border ${
                          t.alert_message_control ? "text-red-500" : "text-gray-400"
                        }`}
                        title={t.alert ? `Nachricht: ${t.alert_message || "Keine Nachricht definiert."}` : ""}
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      )}

                      {/* Alert Icon */}
                      {type === "security" && (
                      <button
                        type="button"
                        onClick={() => toggleAlert(t.id)}
                        className={`h-6 w-6 flex items-center justify-center rounded border ${
                          t.alert ? "text-red-500" : "text-gray-400"
                        }`}
                        title={t.alert ? "Alarm aktiviert" : "Alarm deaktiviert"}
                      >
                        <Bell className="h-4 w-4" />
                      </button>
                      )}
                    </div>
                    {isEditing && type === "security" && (
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
        type={type}
        lowerBound={lowerBound}
      />
    </div>
  );
};

export default ThresholdSettings;