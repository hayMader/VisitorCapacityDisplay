import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Threshold } from '@/types';

interface NewThresholdFormProps {
  newThreshold: Partial<Threshold>;
  onChange: (changes: Partial<Threshold>) => void;
  onAdd: () => void;
  /** optional – set to true when the parent already has 4 thresholds */
  disabled?: boolean;
  type?: 'security' | 'management';
}

const NewThresholdForm: React.FC<NewThresholdFormProps> = ({
  newThreshold,
  onChange,
  onAdd,
  disabled = false,
  type = 'management',
}) => {
  return (
    <div className="pt-4 border-t">
      <Label className="mb-2 block">Neuer Schwellenwert</Label>

      <div className="flex gap-2 items-center">
        {/* numeric upper-threshold input */}
        <Input
          type="number"
          placeholder="Schwellenwert"
          className="flex-1"
          value={newThreshold.upper_threshold || ''}
          onChange={(e) =>
            onChange({ upper_threshold: parseInt(e.target.value, 10) || 0 })
          }
          min={0}
          disabled={disabled}
        />

        {/* colour picker */}
        <Input
          type="color"
          className="w-12 p-0"
          value={newThreshold.color}
          onChange={(e) => onChange({ color: e.target.value })}
          disabled={disabled}
        />

        {/* add button */}
        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus className="mr-1 h-4 w-4" />
          Hinzufügen
        </Button>
      </div>
      {type === 'security' && (
        <>
          {/* warnhinweis checkbox */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="warnhinweis"
              checked={newThreshold.alert}
            onChange={(e) => onChange({ alert: e.target.checked })}
            disabled={disabled}
            className="h-4 w-4"
          />
          <Label htmlFor="warnhinweis" className="text-sm">
            Alarm bei Überschreitung des Schwellenwerts aktivieren
          </Label>
        </div>

        {/* alert_message input field */}
        {newThreshold.alert && (
          <div className="mt-2">
            <Label htmlFor="alert_message" className="text-sm">
              Warnhinweis Nachricht
            </Label>
            <Input
              type="text"
              id="alert_message"
              placeholder="Warnhinweis Nachricht"
              className="mt-1 w-full"
              value={newThreshold.alert_message || ''}
              onChange={(e) => onChange({ alert_message: e.target.value })}
              disabled={disabled}
            />
          </div>
        )}

        {/* helper text when max levels reached */}
        {disabled && (
          <p className="mt-2 text-xs text-muted-foreground">
            Maximal 4 Levels erlaubt.
          </p>
        )}
      </>
      )}
    </div>
  );
};

export default NewThresholdForm;
