import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import { Separator } from '@/components/ui/separator';
import AreaSettingsAccordion from '@/components/AreaSettingsAccordion';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAreaStatus } from "@/contexts/AreaStatusContext";
import TimeSlider from '@/components/TimeSlider';
import WarningList from '@/components/WarningList';
import LegendEditor from '@/components/LegendEditor';
import Footer from '@/components/Footer';

const Security = () => {
  const { selectedArea, setSelectedArea, refreshAreaStatus, refreshAreaStatusAndLegend, areaStatus } = useAreaStatus();
  const [showGermanTitle, setShowGermanTitle] = useState<boolean>(true);
  const [showAbsolute, setShowAbsolute] = useState(true);
  const [showPercentage, setShowPercentage] = useState(true);
  const [timeFilter, setTimeFilter] = useState(0); // Default to 0 hours
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    refreshAreaStatus(timeFilter);
  }, [timeFilter]);

  useEffect(() => {
    //inital load of area settings
    refreshAreaStatusAndLegend(timeFilter);

      const intervalId = setInterval(() => {
    }, 20000);
    
    return () => clearInterval (intervalId);
  }, []);

  useEffect(() => {
    if (selectedArea) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedArea]);
  

  

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title="Willkommen im Security Dashboard"
        isAdmin={true} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Map + Areas list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3>Besucherfüllstand</h3>
                <div className="text-muted-foreground">
                  {new Date().toLocaleDateString('de-DE', {
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}Uhr
                </div>
              </div>
              
              <ExhibitionMap 
                autoRefresh={true} 
                refreshInterval={60000}
                onAreaSelect={setSelectedArea}
                showGermanLabels={showGermanTitle}
                timeFilter={timeFilter}
                showNumbers={showAbsolute}
                showPercentage={showPercentage}
                currentPage='security'
              />

              <div className="flex gap-6 mb-2 mt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="master-absolute"
                    checked={showAbsolute}
                    onCheckedChange={checked => setShowAbsolute(!!checked)}
                  />
                  <Label htmlFor="master-absolute">Absolute Besucherzahl anzeigen</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="master-percentage"
                    checked={showPercentage}
                    onCheckedChange={checked => setShowPercentage(!!checked)}
                  />
                  <Label htmlFor="master-percentage">Prozentuale Auslastung anzeigen</Label>
                </div>
              </div>

            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <TimeSlider
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <LegendEditor currentPage='security' />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <WarningList areaStatus={areaStatus} />
            </div>
          </div>
          
          {/* Right column: Area settings */}
          <div className="lg:col-span-1">
            <div className={`bg-white p-4 rounded-lg shadow-sm ${
              isHighlighted ? 'ring-2 ring-primary-400 ring-opacity-50 shadow-lg shadow-primary-100' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <span>Bereichseinstellungen {selectedArea ? selectedArea.area_name : ''}</span>
              </div>
              <Separator className="mb-4" />
              
              {selectedArea !== null ? (
                <AreaSettingsAccordion
                  area={selectedArea}
                  currentPage='security'
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Bitte wählen Sie einen Bereich aus, um die Einstellungen zu bearbeiten.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Security;