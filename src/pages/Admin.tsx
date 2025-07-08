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
import { Trash, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const Admin = () => {
  const [areas, setAreas] = useState<AreaStatus[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaStatus>(null);
  const [timeFilter, setTimeFilter] = useState(1440);
  const [showGermanTitle, setShowGermanTitle] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hideAbsolute, setHideAbsolute] = useState(false);
  const [hidePercentage, setHidePercentage] = useState(false)
  const [showConfigurator, setShowConfigurator] = useState(false);

  const [legendRows, setLegendRows] = useState<Partial<LegendRow>[]>([
    { object: "", description_de: "", description_en: "" }
  ])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const areaData = await getAreaSettings();
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

  const handleEditClick = (area: AreaStatus) => {
    setSelectedArea(area);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title="Willkommen im Management Dashboard"
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
                onAreaSelect={handleEditClick}
                setShowConfigurator={setShowConfigurator}
                showGermanLabels={showGermanTitle}
                selectedArea={selectedArea}
                timeFilter={timeFilter}
                showNumbers={!hideAbsolute}
                showPercentage={!hidePercentage}
                currentPage='management'
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
              {/* Legend editor */}
              <span>Legenden Einstellungen</span>
              <p className="text-muted-foreground mb-4">Fügen Sie der Legende einen neuen Wert hinzu:</p>

              <div className="grid grid-cols-[2.5fr,2.5fr,2.5fr,0.5fr] gap-4 items-center mb-4">
                <Label className="col-span-1">Abkürzung</Label>
                <Label className="col-span-1">Beschreibung (Deutsch)</Label>
                <Label className="col-span-1">Beschreibung (Englisch)</Label>
              </div>

               <div className="space-y-6">
                {legendRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[2.5fr,2.5fr,2.5fr,0.5fr] gap-4 items-center">
                    {/* Input for Object */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={row.object}
                        onChange={(e) => {
                          const updatedRows = [...legendRows];
                          updatedRows[index].object = e.target.value;
                          setLegendRows(updatedRows);
                        }}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Abkürzung oder #RRGGBB"
                      />
                      {/* Color picker for hex color */}
                      <div className="relative">
                        <input
                          type="color"
                          value={/^#[0-9A-Fa-f]{6}$/.test(row.object) ? row.object : "#000000"}
                          onChange={(e) => {
                            const updatedRows = [...legendRows];
                            updatedRows[index].object = e.target.value;
                            setLegendRows(updatedRows);
                          }}
                          className="w-8 h-8 p-0 border rounded-md"
                        />
                      </div>
                    </div>

                    {/* Input field description_de */}
                    <Input
                      type="text"
                      value={row.description_de}
                      onChange={(e) => {
                        const updatedRows = [...legendRows];
                        updatedRows[index].description_de = e.target.value;
                        setLegendRows(updatedRows);
                      }}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Beschreibung (Deutsch)"
                    />

                    {/* Input field description_en */}
                    <Input
                      type="text"
                      value={row.description_en}
                      onChange={(e) => {
                        const updatedRows = [...legendRows];
                        updatedRows[index].description_en = e.target.value;
                        setLegendRows(updatedRows);
                      }}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Beschreibung (Englisch)"
                    />

                    <button
                      onClick={() => {
                        const updatedRows = legendRows.filter((_, i) => i !== index);
                        setLegendRows(updatedRows);
                      }}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-6 gap-3">
                <Button
                  variant="outline" onClick={() => setLegendRows([...legendRows,
                      { id: Date.now(), object: "", description_de: "", description_en: "" },
                    ])
                  }
                >
                  + Hinzufügen
                </Button>
                <Button variant="default" onClick={handleLegendRefresh}>
                  <Save className="h-4 w-4"/>
                  Speichern
            
                </Button>
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
              
              {selectedArea !== null && (
                <>
                <AreaSettingsAccordion
                  area={selectedArea}
                  onUpdate={handleAreaUpdate}
                  allAreas={areas}
                  showConfigurator={showConfigurator}
                  onCloseConfigurator={() => setShowConfigurator(false)}
                />
                  <Separator className="my-4" />
                  </>
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

export default Admin;