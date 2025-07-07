import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import AreaConfigurator from "@/components/Areaconfigurator";
import { AreaStatus } from "@/types";

type Props = {
  area: AreaStatus | null;
  onUpdate: (updated: AreaStatus) => void;
  onClose: () => void;
};

const AreaConfiguratorAccordion: React.FC<Props> = ({ area, onUpdate, onClose }) => {
  if (!area) return null;

  return (
    <Accordion type="single" collapsible defaultValue="area-configurator">
      <AccordionItem value="area-configurator">
        <AccordionTrigger>
          <span className="text-base font-medium">Koordinaten Bearbeiten</span>
        </AccordionTrigger>
        <AccordionContent>
          <AreaConfigurator
            selectedArea={area}
            onSave={onUpdate}
            onClose={onClose}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AreaConfiguratorAccordion;
