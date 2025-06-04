/* ThresholdItemActions.tsx */
import React from 'react';
import { Check, X, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}
const ThresholdItemActions: React.FC<Props> = ({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) =>
  isEditing ? (
    <div className="flex gap-2">
      <Button variant="ghost" size="icon" onClick={onSave}>
        <Check className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
export default ThresholdItemActions;
