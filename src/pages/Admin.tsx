import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import { Separator } from '@/components/ui/separator';
import { AreaStatus } from '@/types';
import AreaSettingsAccordion from '@/components/AreaSettingsAccordion';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAreaStatus } from "@/contexts/AreaStatusContext";
import LegendEditor from '@/components/LegendEditor';
import Footer from '@/components/Footer';


// Admin page for managing area settings and visitor capacity display
const Admin = () => {
  const { selectedArea, setSelectedArea, refreshAreaStatus, refreshAreaStatusAndLegend } = useAreaStatus();

  const [showGermanTitle, setShowGermanTitle] = useState<boolean>(false); // Toggle for German title
  const [showAbsolute, setShowAbsolute] = useState(true); // Toggle for absolute visitor count
  const [showPercentage, setShowPercentage] = useState(true); // Toggle for percentage display
  const [showConfigurator, setShowConfigurator] = useState(false); // Toggle for showing configurator
  const [isHighlighted, setIsHighlighted] = useState(false); // Highlight selected area
  const [hasUserSelectedArea, setHasUserSelectedArea] = useState(false); // Track if user has selected an area
  const [timeFilter, setTimeFilter] = useState(0); // Default to 0 hours

  // Effect to handle initial load and interval for toggling German title
  useEffect(() => {
    //inital load of area settings
    refreshAreaStatusAndLegend(timeFilter);

    // Set up interval to toggle German title every 8 seconds
    const intervalId = setInterval(() => {
      setShowGermanTitle((prev) => !prev);
    }, 20000);
    
    return () => clearInterval (intervalId);

  }, []);

  // Fetch area settings on initial load and when time filter changes
  useEffect(() => {
    refreshAreaStatus(timeFilter);
  }, [timeFilter]);

  // Highlight selected area for 3 seconds after selection
  useEffect(() => {
    if (selectedArea && hasUserSelectedArea) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedArea, hasUserSelectedArea]);

  // Handle area selection from the map
  const handleAreaSelect = (area: AreaStatus) => {
    setHasUserSelectedArea(true);
    setSelectedArea(area);
  };




  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title="Willkommen in der Management Console"
        isAdmin={true} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Map + Timeslider + Legend editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3>Besucherfüllstand</h3>
                <div className="text-muted-foreground">
                  {/* Show date and time in German format */}
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
                showGermanLabels={showGermanTitle}
                showNumbers={showAbsolute}
                showPercentage={showPercentage}
                onAreaSelect={handleAreaSelect}
                currentPage='management'
                setShowConfigurator={setShowConfigurator}
              />
              {/* Control of showing numbers and percentage */}
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
              {/* Filter HDM data by sliding the datetime */}
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700">
                Zeitbereich (vor 24 Stunden bis jetzt)
              </label>
              <input
                id="timeRange"
                type="range"
                min="0"
                max="1440"
                step="10"
                onChange={(e) => {
                  const minutesAgo = 1440 - parseInt(e.target.value, 10); // Convert to minutes ago
                  setTimeFilter(minutesAgo);
                }}
                defaultValue={1440}
                className="w-full mt-2"
                style={{ appearance: 'none', height: '4px', background: '#ddd', borderRadius: '2px' }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Vor 24 Stunden</span>
                <span>
                  {new Date(Date.now() - timeFilter * 60000).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                  })} Uhr
                </span>
                <span>Jetzt</span>
              </div>
              <div className="text-sm text-gray-700 mt-2">

              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              {/* Legend editor */}
              <LegendEditor currentPage="management" />
            </div>
            
            
          </div>
          
          {/* Right column: Area settings */}
          <div className="lg:col-span-1">
            <div className={`bg-white p-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out
              ${isHighlighted ? 'ring-2 ring-primary-400 ring-opacity-50 shadow-lg shadow-primary-100' : ''}`}>
              <div className="items-center mb-4">
                <span>Bereichseinstellungen: {selectedArea?.area_name || ''}</span>
                <p className="text-muted-foreground"> Konfigurieren Sie Ihre Besucherfüllstandsanzeige</p>
              </div>
              <Separator className="mb-4" />
              {/* Show a message when no area is selected */}
              {selectedArea !== null ? (
                <>
                <AreaSettingsAccordion
                  area={selectedArea}
                  showConfigurator={showConfigurator}
                  onCloseConfigurator={() => setShowConfigurator(false)}
                  currentPage='management'
                />
                  <Separator className="my-4" />
                  </>
                  ): (
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

export default Admin;