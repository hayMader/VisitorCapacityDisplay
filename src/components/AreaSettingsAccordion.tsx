import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Save,
  Eye,
  EyeOff,
  Trash,
} from "lucide-react";

import AreaGeneralSettings from "@/components/ui/AreaGeneralSettings";
import CopyThresholdsModal from "@/components/ui/CopyThresholdsModal";
import ThresholdSettings from "@/components/ThresholdSettings";
import AreaConfigurator from "./AreaConfigurator";
import { AreaStatus } from "@/types";
import { copyThresholdsToAreas, deleteArea } from "@/utils/api";
import { useAreaStatus } from "@/contexts/AreaStatusContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";

import { isEqual } from "lodash";
import { set } from "date-fns";

export const MAX_LEVELS = 4; // ab jetzt 4 Stufen möglich

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface Props {
  area: AreaStatus | null; // Area data to be managed
  currentPage?: "management" | "security"; // Current page context
  showConfigurator?: boolean;
  onCloseConfigurator?: () => void;
}

const AreaSettingsAccordion: React.FC<Props> = ({ area = null, currentPage, showConfigurator, onCloseConfigurator }) => {
  const { updateAreaStatus, setAreaStatus, setSelectedArea, refreshAreaStatus } = useAreaStatus();

  /* ---------------------------------------------------------------- */
  /*  State                                                           */
  /* ---------------------------------------------------------------- */
  const [originalData, setOriginalData] = useState<AreaStatus | null>(area);
  const [formData, setFormData] = useState<AreaStatus | null>(area);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const [newThreshold, setNewThreshold] = useState({
    upper_threshold: -1,
    color: "#cccccc",
  });

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false); // Modal for copying thresholds
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // State for confirmation dialog

  const [accordionValue, setAccordionValue] = useState<string | null>("general");
  /* ---------------------------------------------------------------- */
  /*  Sync incoming area → local state                                 */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    setOriginalData(area);
    setFormData(area);
    setAccordionValue("general");
  }, [area]);

  useEffect(() => {
    setIsLoading(!originalData);
    if (!formData) setFormData(originalData);
    const hasUnsavedChanges = !isEqual(formData, originalData);
    setHasChanges(hasUnsavedChanges);
    if (hasUnsavedChanges) {
      setAreaStatus((prev) =>
        prev.map((a) => (a.id === formData?.id ? formData : a))
      );
    }
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



  const handleDeleteArea = async () => {
    if (!formData) return;

    try {
      // Call API to delete area
      await deleteArea(formData.id);
      setSelectedArea(null); // Clear selected area
      refreshAreaStatus(); // Refresh area status context
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Submit                                                          */
  /* ---------------------------------------------------------------- */
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      updateAreaStatus(formData);

      setOriginalData(formData);
  
      toast({
        title: 'Einstellungen aktualisiert',
        description: `Die Einstellungen für ${area.area_name} wurden erfolgreich aktualisiert.`,
      });
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
      await copyThresholdsToAreas(area.id, targetAreaIds, currentPage || "management");
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

  if (!area) {
    return (
      <div className="p-4 text-center">
        <p>Kein Bereich ausgewählt.</p>
      </div>
    );
  }

  if (showConfigurator) {
    return (
      <AreaConfigurator
        selectedArea={formData}
        setFormData={setFormData}
        onSave={handleSubmit}
        onClose={onCloseConfigurator}
      />
    );
  }

  return (
    <div>
      {currentPage !== "security" ? (
      <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue} className="w-full">
        {/* ---------------- allgemeine Einstellungen ---------------- */}
        <AccordionItem value="general">
        <AccordionTrigger className="py-4">
          <div className="flex items-start flex-col" style={{textAlign: "left"}}>
            <div className="flex items-center mb-1">
            <Settings className="mr-2 h-5 w-5" />
            <span className="text">Allgemeine Einstellungen</span>
            </div>
            <p className="text-muted-foreground">Setzen Sie einen Namen und maximale Kapazität</p>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <AreaGeneralSettings formData={formData} onChange={handleChange} />
        </AccordionContent>
        </AccordionItem>

        {/* ---------------- Schwellenwert Management ---------------- */}
        <AccordionItem value="thresholds">
          <AccordionTrigger className="py-4">
            <div className="flex items-start flex-col" style={{textAlign: "left"}}>
              <div className="flex items-center mb-1">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              <span className="text">Schwellenwerte Besucherzahl</span>
              </div>
              <p className="text-muted-foreground">Definieren Sie bis zu 4 Schwellenwerte</p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ThresholdSettings
              formData={formData}
              setFormData={setFormData}
              newThreshold={newThreshold}
              setNewThreshold={setNewThreshold}
              type={currentPage}
              onCopyThresholds={() => setIsCopyModalOpen(true)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      ) : (
        <div className="w-full">
          {/* ---------------- Schwellenwert Management ---------------- */}
          <div className="flex items-center mb-1">
          <SlidersHorizontal className="mr-2 h-5 w-5" />
          <span className="text">Schwellenwerte Besucherzahl</span>
          </div>
          <ThresholdSettings
            formData={formData}
            setFormData={setFormData}
            newThreshold={newThreshold}
            setNewThreshold={setNewThreshold}
            type={currentPage}
            onCopyThresholds={() => setIsCopyModalOpen(true)}
          />
        </div>
      )}

      {/* ---------- Footer (Speichern) ---------- */}
      <div className="mt-6 flex justify-between">
        { formData.status === "active" ? (
          <>
            {currentPage === "management" && (
              <>
              <Button disabled={isSubmitting}
                variant="destructive"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, status: "inactive" }));
                }}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                {isSubmitting ? "Deaktiviere …" : "Deaktivieren"}
              </Button>
              <button className="text-destructive"
                onClick={() => setIsConfirmDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4"/>
              </button>
              </>
            )}
            <Button type="submit" disabled={isSubmitting || !hasChanges}
              onClick={handleSubmit}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Speichern …" : "Speichern"}
            </Button>
          </>
        ) : (
          <>
            {currentPage === "management" && (
              <>
              <Button disabled={isSubmitting}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, status: "active" }));
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Aktivieren
              </Button>
              <button className="text-destructive"
                onClick={() => setIsConfirmDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4"/>
              </button>
              </>
            )}
            <Button type="submit" disabled={isSubmitting || !hasChanges}
              onClick={handleSubmit}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Speichern …" : "Speichern"}
            </Button>
          </>
        )}
        
      </div>

    {/*Model for copying thresholds*/}
    <CopyThresholdsModal
      open={isCopyModalOpen}
      onClose={() => setIsCopyModalOpen(false)}
      sourceArea={formData}
      onApply={handleCopyThresholds}
    />

    {/* Confirmation Dialog */}
    <ConfirmationDialog
      open={isConfirmDialogOpen}
      title="Bereich löschen"
      description={`Sind Sie sicher, dass Sie den Bereich "${formData?.area_name}" löschen möchten?`}
      onConfirm={() => {
        handleDeleteArea();
        setIsConfirmDialogOpen(false); // Close dialog after confirming
      }}
      onCancel={() => setIsConfirmDialogOpen(false)} // Close dialog on cancel
    />
  </div>
  );
};

export default AreaSettingsAccordion;