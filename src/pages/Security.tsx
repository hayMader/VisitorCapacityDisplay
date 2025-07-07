import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { getAreaSettings } from '@/utils/api';
import { AreaStatus } from '@/types';
import AreaSettingsAccordion from '@/components/AreaSettingsAccordion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { refreshLegend, getLegend } from "@/utils/api";
import { LegendRow } from "@/types";
import { Label } from '@/components/ui/label';
import { Trash, Save, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const Security = () => {
  const [areas, setAreas] = useState<AreaStatus[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaStatus>(null);
  const [timeFilter, setTimeFilter] = useState(1440);
  const [showGermanTitle, setShowGermanTitle] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hideAbsolute, setHideAbsolute] = useState(false);
  const [hidePercentage, setHidePercentage] = useState(false);

  const [legendRows, setLegendRows] = useState<Partial<LegendRow>[]>([
    { object: "", description_de: "", description_en: "" }
  ])

  // Filter states for warnings
  const [warningSearchTerm, setWarningSearchTerm] = useState("");
  const [showEntrances, setShowEntrances] = useState(true);
  const [showHalls, setShowHalls] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const areaData = await getAreaSettings();
        console.log("Fetched area data:", areaData);
        const legendData = await getLegend();
        setLegendRows(legendData);
        setAreas(areaData);
        if (areaData.length > 0) {
          setSelectedArea(areaData[0]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: 'Fehler',
          description: 'Die Einstellungen konnten nicht geladen werden.',
          variant: 'destructive',
        });
      }
    };
    
    fetchInitialData();
  }, []);

  useEffect(() => {
      const intervalId = setInterval(() => {
      setShowGermanTitle((prev) => !prev);
    }, 8000);
    
    return () => clearInterval (intervalId);
  }, []);
  

  const handleAreaUpdate = (updatedArea: AreaStatus) => {
    setAreas(areas.map(area => 
      area.id === updatedArea.id ? updatedArea : area
    ));
  };

  const handleDataUpdate = (newAreaStatus: AreaStatus[]) => {
    setAreas(newAreaStatus);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet."
    });
  };

  const handleLegendRefresh = async () => {
    try {
      await refreshLegend(legendRows)
      toast({
        title: "Legende aktualisiert",
        description: "Die Schwellenwerte für die Legende wurden erfolgreich aktualisiert.",
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Aktualisierung der Legende fehlgeschlagen.",
        variant: "destructive",
      })
    }
  }

  // Filter function for warnings
  const filterWarnings = (area: AreaStatus) => {
    // Check if area has active warnings
    const hasWarning = area.thresholds.some(threshold => 
      threshold.type === "security" &&
      threshold.alert &&
      area.amount_visitors > threshold.upper_threshold
    );

    if (!hasWarning) return false;

    // Filter by search term
    if (warningSearchTerm && !area.area_name.toLowerCase().includes(warningSearchTerm.toLowerCase())) {
      return false;
    }

    // Filter by area type
    const isEntrance = area.area_name.toLowerCase().includes("eingang");
    const isHall = area.area_name.toLowerCase().includes("halle");

    if (!showEntrances && isEntrance) return false;
    if (!showHalls && isHall) return false;

    return true;
  };

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
                onDataUpdate={handleDataUpdate} 
                onAreaSelect={setSelectedArea}
                showGermanLabels={showGermanTitle}
                selectedArea={selectedArea}
                timeFilter={timeFilter}
                showNumbers={!hideAbsolute}
                showPercentage={!hidePercentage}
                currentPage='security'
              />

              <div className="flex gap-6 mb-2 mt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="master-absolute"
                    checked={hideAbsolute}
                    onCheckedChange={checked => setHideAbsolute(!!checked)}
                  />
                  <Label htmlFor="master-absolute">Absolute Besucherzahl ausblenden</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="master-percentage"
                    checked={hidePercentage}
                    onCheckedChange={checked => setHidePercentage(!!checked)}
                  />
                  <Label htmlFor="master-percentage">Prozentuale Auslastung ausblenden</Label>
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
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Warnungen</h3>
                
                {/* Filter Controls */}
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Bereich suchen..."
                      value={warningSearchTerm}
                      onChange={(e) => setWarningSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  
                </div>

                <Separator className="mb-4" />
                
                {/* Warnings List */}
                {areas.filter(filterWarnings)
                  .sort((a, b) => {
                    // Natural alphanumerical sort that handles numbers properly
                    return a.area_name.localeCompare(b.area_name, 'de-DE', { 
                      numeric: true, 
                      sensitivity: 'base' 
                    });
                  })
                  .map(area => (
                    <div key={area.id} className="border p-4 rounded-lg mb-4 bg-red-50">
                      <h4 className="font-bold text-red-600">{area.area_name}</h4>
                      {area.thresholds
                        .filter(threshold => 
                          threshold.type === "security" &&
                          threshold.alert_message &&
                          area.amount_visitors > threshold.upper_threshold
                        )
                        .map((threshold, index) => (
                          <p key={index} className="text-sm text-red-700">
                            {threshold.alert_message}
                          </p>
                        ))}
                    </div>
                  ))}
                {areas.filter(filterWarnings).length === 0 && (
                  <p className="text-sm text-gray-500">
                    {warningSearchTerm || !showEntrances || !showHalls 
                      ? "Keine Warnungen gefunden mit den aktuellen Filtereinstellungen."
                      : "Keine Warnungen vorhanden."}
                  </p>
                )}
              </div>
              
            </div>
            
            
          </div>
          
          {/* Right column: Area settings */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span>Bereichseinstellungen</span>
              </div>
              <Separator className="mb-4" />
              
              {selectedArea !== null ? (
                <AreaSettingsAccordion
                  area={selectedArea}
                  onUpdate={handleAreaUpdate}
                  allAreas={areas}
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
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MMG-Messegelände München Riem - Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default Security;