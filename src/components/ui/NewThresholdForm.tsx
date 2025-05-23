import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface NewThresholdFormProps {
  newThreshold: { upper_threshold: number; color: string };
  onChange: (changes: Partial<{ upper_threshold: number; color: string }>) => void;
  onAdd: () => void;
}

const NewThresholdForm: React.FC<NewThresholdFormProps> = ({
  newThreshold,
  onChange,
  onAdd,
}) => {
  return (
    <div className="pt-4 border-t">
      <Label className="mb-2 block">Neuer Grenzwert</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Schwellenwert"
          className="flex-1"
          value={newThreshold.upper_threshold || ''}
          onChange={(e) => onChange({ upper_threshold: parseInt(e.target.value) || 0 })}
        />
        <Input
          type="color"
          className="w-12 p-0"
          value={newThreshold.color}
          onChange={(e) => onChange({ color: e.target.value })}
        />
        <Button 
          type="button" 
          variant="outline"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4 mr-1" />
          Hinzufügen
        </Button>
      </div>
    </div>
  );
};

export default NewThresholdForm;