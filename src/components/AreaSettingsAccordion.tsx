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
import ThresholdItem from '@/components/ui/ThresholdItem';
import NewThresholdForm from '@/components/ui/NewThresholdForm';
import AreaGeneralSettings from '@/components/ui/AreaGeneralSettings';
import AreaPositionSettings from '@/components/ui/AreaPositionSettings';
import { isEqual } from 'lodash';

interface AreaSettingsAccordionProps {
  area: AreaStatus;
  onUpdate: (updatedArea: AreaStatus) => void;
}

const AreaSettingsAccordion: React.FC<AreaSettingsAccordionProps> = ({ area, onUpdate }) => {
  // Original data to compare against for change detection
  const [originalData, setOriginalData] = useState<AreaStatus>(area);
  
  // Current form data
  const [formData, setFormData] = useState<AreaStatus>(area);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [newThreshold, setNewThreshold] = useState({ upper_threshold: 0, color: '#cccccc' });
  const [editingThreshold, setEditingThreshold] = useState<number | null>(null);
  const [editedThreshold, setEditedThreshold] = useState<{ upper_threshold: number, color: string }>({ 
    upper_threshold: 0, 
    color: '#cccccc' 
  });

  useEffect(() => {
    // Set the original data when the area prop changes
    setOriginalData(area);
    setFormData(area);
  }, [area]);

  // Check for changes
  useEffect(() => {
    // When original data is null or undefined, show loading state
    setIsLoading(!originalData);

    // When formdata is null or undefined, set it to the original data
    if (!formData) {
      setFormData(originalData);
    }

    const formHasChanges = !isEqual(formData, originalData);
    
    setHasChanges(formHasChanges);


  }, [formData, originalData]);

  // Handle form field changes (except for thresholds)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>, // Event from submitted form
    field: keyof AreaStatus // Field name from the changed field in form
  ) => {
    const value = e.target.value; // Get the value from the event

    // Check if the field is a number by checking the type of the field
    if ( typeof area[field] === 'number') {
      setFormData(prev => ({
        ...prev,
        [field]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Submit form - only now we send data to the backend
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

  // Handle adding a threshold - only in client state until form submission
  const handleAddThreshold = () => {
    if (newThreshold.upper_threshold <= 0) {
      toast({
        title: 'Ungültiger Grenzwert',
        description: 'Der Grenzwert muss größer als 0 sein.',
        variant: 'destructive',
      });
      return;
    }

    // Create a temporary ID for client-side rendering
    const tempId = -Date.now(); // Negative to avoid collisions with real IDs
    
    // Create the new threshold object
    const thresholdData: Threshold = {
      id: tempId,
      setting_id: area.id,
      upper_threshold: newThreshold.upper_threshold,
      color: newThreshold.color,
      alert: false,
      alert_message: ''
    };
    
    // Add to local form state
    setFormData(prev => ({
      ...prev,
      thresholds: [...prev.thresholds, thresholdData]
    }));
    
    
    toast({
      title: 'Grenzwert hinzugefügt',
      description: `Neuer Grenzwert bei ${thresholdData.upper_threshold} wurde hinzugefügt.`,
    });
  };

  // Handle editing a threshold
  const handleEditThreshold = (threshold: Threshold) => {
    setEditingThreshold(threshold.id);
  };

  // Handle threshold edit changes
  const handleEditChange = (changes: Partial<{ upper_threshold: number; color: string }>) => {
    setEditedThreshold(prev => ({
      ...prev,
      ...changes
    }));
  };

  // Handle saving a threshold edit - only in client state until form submission
  const handleSaveEdit = (thresholdId: number) => {
    if (editedThreshold.upper_threshold <= 0) {
      toast({
        title: 'Ungültiger Grenzwert',
        description: 'Der Grenzwert muss größer als 0 sein.',
        variant: 'destructive',
      });
      return;
    }

    // Update the threshold in UI
    setFormData(prev => ({
      ...prev,
      thresholds: prev.thresholds.map(t => t.id === thresholdId ? {
        ...t, 
        upper_threshold: editedThreshold.upper_threshold,
        color: editedThreshold.color
      } : t)
    }));
    
    // Exit edit mode
    setEditingThreshold(null);
    
    toast({
      title: 'Grenzwert aktualisiert',
      description: `Grenzwert wurde aktualisiert. Speichern Sie, um die Änderungen zu übernehmen.`,
    });
  };

  // Handle deleting a threshold - only in client state until form submission
  const handleDeleteThreshold = (thresholdId: number) => {
    // Update areastatus object
    setFormData(prev => ({
      ...prev,
      thresholds: prev.thresholds.filter(t => t.id !== thresholdId)
    }));
    
    toast({
      title: 'Grenzwert gelöscht',
      description: 'Der Grenzwert wurde entfernt. Speichern Sie, um die Änderungen zu übernehmen.',
    });
  };

  // Handle cancelling an edit
  const cancelEdit = () => {
    setEditingThreshold(null);
  };

  // Handle changes to new threshold form
  const handleNewThresholdChange = (changes: Partial<{ upper_threshold: number; color: string }>) => {
    setNewThreshold(prev => ({
      ...prev,
      ...changes
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Einstellungen werden geladen...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Accordion type="single" collapsible defaultValue="general" className="w-full">
        {/* General Settings */}
        <AccordionItem value="general">
          <AccordionTrigger className="py-4">
            <div className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              <span>Allgemeine Einstellungen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AreaGeneralSettings
              formData={formData}
              onChange={handleChange}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Threshold Settings */}
        <AccordionItem value="thresholds">
          <AccordionTrigger className="py-4">
            <div className="flex items-center">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              <span>Grenzwerte Besucherzahl</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              {formData.thresholds.length > 0 ? (
                <div className="space-y-2">
                  <Label>Aktuelle Grenzwerte</Label>
                  <div className="border rounded-md">
                    {formData.thresholds
                      .sort((a, b) => a.upper_threshold - b.upper_threshold)
                      .map((threshold) => (
                        <div 
                          key={threshold.id}
                          className="flex items-center justify-between p-2 border-b last:border-0"
                        >
                          <ThresholdItem
                            threshold={threshold}
                            isEditing={editingThreshold === threshold.id}
                            editedThreshold={editedThreshold}
                            onEdit={handleEditThreshold}
                            onSave={handleSaveEdit}
                            onCancel={cancelEdit}
                            onDelete={handleDeleteThreshold}
                            onEditChange={handleEditChange}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Keine Grenzwerte definiert.</p>
              )}

              <NewThresholdForm
                newThreshold={newThreshold}
                onChange={handleNewThresholdChange}
                onAdd={handleAddThreshold}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Area Position Settings */}
        <AccordionItem value="position">
          <AccordionTrigger className="py-4">
            <div className="flex items-center">
              <Move className="mr-2 h-5 w-5" />
              <span>Anpassung Areal</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AreaPositionSettings
              formData={formData}
              onChange={handleChange}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !hasChanges}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
};

export default AreaSettingsAccordion;
