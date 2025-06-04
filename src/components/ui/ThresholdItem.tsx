import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Edit, Trash } from 'lucide-react';
import { Threshold } from '@/types';

interface ThresholdItemProps {
  threshold: Threshold;
  isEditing: boolean;
  editedThreshold: { upper_threshold: number; color: string };
  onEdit: (threshold: Threshold) => void;
  onSave: (thresholdId: number) => void;
  onCancel: () => void;
  onDelete: (thresholdId: number) => void;
  onEditChange: (changes: Partial<{ upper_threshold: number; color: string }>) => void;
}

const ThresholdItem: React.FC<ThresholdItemProps> = ({
  threshold,
  isEditing,
  editedThreshold,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditChange,
}) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2 w-full">
        <Input
          type="number"
          className="w-24"
          value={editedThreshold.upper_threshold}
          onChange={(e) => onEditChange({ upper_threshold: parseInt(e.target.value) || 0 })}
        />
        <Input
          type="color"
          className="w-12 p-0"
          value={editedThreshold.color}
          onChange={(e) => onEditChange({ color: e.target.value })}
        />
        <div className="ml-auto flex gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            type="button"
            onClick={() => onSave(threshold.id)}
          >
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            type="button"
            onClick={onCancel}
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex items-center">
        <div 
          className="w-4 h-4 rounded-full mr-3" 
          style={{ backgroundColor: threshold.color }}
        ></div>
        <span className="font-medium">{threshold.upper_threshold}</span>
      </div>
      <div className="flex gap-1">
        <Button 
          size="icon" 
          variant="ghost" 
          type="button"
          onClick={() => onEdit(threshold)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-destructive"
          type="button"
          onClick={() => onDelete(threshold.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default ThresholdItem;