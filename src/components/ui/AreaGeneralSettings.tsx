import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AreaStatus } from '@/types';

interface AreaGeneralSettingsProps {
  formData: Partial<AreaStatus>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, field: keyof AreaStatus) => void;
}

const AreaGeneralSettings: React.FC<AreaGeneralSettingsProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <div className="space-y-1">
        <Label htmlFor="area-name">Bereichsname (Deutsch)</Label>
        <Input
          id="area-name"
          value={formData.area_name}
          onChange={(e) => onChange(e, 'area_name')}
        />
        </div>
        <div className="space-y-1">
        <Label htmlFor="area-name-en">Bereichsname (Englisch)</Label>
        <Input
          id="area-name-en"
          value={formData.area_name_en || ''}
          onChange={(e) => onChange(e, 'area_name_en')}
        />
        </div>
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox
            id="hide-name"
            checked={formData.hidden_name}
            onCheckedChange={(checked: boolean) =>
              onChange(
                // Create a synthetic event to match the expected signature
                {
                  target: { value: checked, name: 'hidden_name' }
                } as unknown as React.ChangeEvent<HTMLInputElement>,
                'hidden_name'
              )
            }
          />
          <Label htmlFor="hide-name">Bereichsname ausblenden</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Kapazität</Label>
        <Input
          id="capacity"
          type="number"
          value={formData.capacity_usage}
          onChange={(e) => onChange(e, 'capacity_usage')}
        />
      </div>

   {/*    <div className="space-y-2">
        <Label htmlFor="highlight">Hervorhebungsfarbe (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="highlight"
            value={formData.highlight || ''}
            onChange={(e) => onChange(e, 'highlight')}
            placeholder="#RRGGBB"
          />
          <Input
            type="color"
            value={formData.highlight || '#ffffff'}
            onChange={(e) => onChange(e, 'highlight')}
            className="w-12 p-0 h-10"
          />
        </div>
      </div> */}
    </div>
  );
};

export default AreaGeneralSettings;