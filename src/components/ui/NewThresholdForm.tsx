import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface NewThresholdFormProps {
  newThreshold: { upper_threshold: number; color: string };
  onChange: (changes: Partial<{ upper_threshold: number; color: string }>) => void;
  onAdd: () => void;
  /** optional – set to true when the parent already has 4 thresholds */
  disabled?: boolean;
}

const NewThresholdForm: React.FC<NewThresholdFormProps> = ({
  newThreshold,
  onChange,
  onAdd,
  disabled = false,
}) => {
  return (
    <div className="pt-4 border-t">
      <Label className="mb-2 block">Neuer Grenzwert</Label>

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

      {/* helper text when max levels reached */}
      {disabled && (
        <p className="mt-2 text-xs text-muted-foreground">
    Maximal 4 Levels erlaubt.
        </p>
      )}
    </div>
  );
};

export default NewThresholdForm;
