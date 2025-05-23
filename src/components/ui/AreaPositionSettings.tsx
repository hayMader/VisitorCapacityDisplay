import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AreaStatus } from '@/types';

interface AreaPositionSettingsProps {
  formData: Partial<AreaStatus>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, field: keyof AreaStatus) => void;
}

const AreaPositionSettings: React.FC<AreaPositionSettingsProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="x-position">X-Position</Label>
          <Input
            id="x-position"
            type="number"
            value={formData.x}
            onChange={(e) => onChange(e, 'x')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="y-position">Y-Position</Label>
          <Input
            id="y-position"
            type="number"
            value={formData.y}
            onChange={(e) => onChange(e, 'y')}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Breite</Label>
          <Input
            id="width"
            type="number"
            value={formData.width}
            onChange={(e) => onChange(e, 'width')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Höhe</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => onChange(e, 'height')}
          />
        </div>
      </div>
    </div>
  );
};

export default AreaPositionSettings;