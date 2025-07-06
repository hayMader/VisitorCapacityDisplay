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
  lowerBound: number;
}

const NewThresholdForm: React.FC<NewThresholdFormProps> = ({
  newThreshold,
  onChange,
  onAdd,
  disabled = false,
  type = 'management',
  lowerBound,
}) => {
  return (
    <div className="pt-4 border-t">
      <Label className="mb-2 block">Neuer Grenzwert</Label>

      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">

        {/* Lower bound of new threshold (read-only) */}
        <div>
          <Label htmlFor="lower_bound" className="text-sm">Von</Label>
          <Input
            id="lower_bound"
            type="number"
            value={lowerBound}
            readOnly
            disabled
            className="bg-transparent border-none p-0 text-right text-muted-foreground cursor-default"
          />
        </div>

        {/* Upper bound of new threshold (editable) */}
        <div>
          <Label htmlFor="upper_threshold" className="text-sm">Bis</Label>
          <Input
            id="upper_threshold"
            type="number"
            placeholder="Schwellenwert"
            className="w-full"
            value={newThreshold.upper_threshold || ''}
            onChange={(e) =>
              onChange({ upper_threshold: parseInt(e.target.value, 10) || 0 })
              }
            min={0}
            disabled={disabled}
          />
        </div>

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
