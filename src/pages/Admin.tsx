
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
import { refreshLegend } from "@/utils/api";
import { LegendRow } from "@/types";
import { Label } from '@/components/ui/label';
import { Trash, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Admin = () => {
  const [areas, setAreas] = useState<AreaStatus[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaStatus>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [legendRows, setLegendRows] = useState<Partial<LegendRow>[]>([
    { object: "", description_de: "", description_en: "" }
  ])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const areaData = await getAreaSettings();
        
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
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

  // Group areas by type (halls, parking, etc.)
  const halls = areas.filter(area => 
    area.area_name.startsWith('A') || 
    area.area_name.startsWith('B') || 
    area.area_name.startsWith('C')
  );
  
  const entrances = areas.filter(area => 
    area.area_name.toLowerCase().includes('eingang')
  );
  
  const other = areas.filter(area => 
    !area.area_name.startsWith('A') && 
    !area.area_name.startsWith('B') && 
    !area.area_name.startsWith('C') &&
    !area.area_name.toLowerCase().includes('eingang')
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title="Willkommen im Management Dashboard"
        subtitle={user?.name ? user.name : undefined}
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
                selectedArea={selectedArea}
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              {/* Legend editor */}
              <span>Legenden Einstellungen</span>
              <p className="text-muted-foreground mb-4">Fügen Sie der Legende einen neuen Wert hinzu:</p>

              <div className="grid grid-cols-[2fr,2.5fr,2.5fr,0.5fr] gap-6 items-center mb-4">
                <Label className="col-span-1">Abkürzung</Label>
                <Label className="col-span-1">Beschreibung (Deutsch)</Label>
                <Label className="col-span-1">Beschreibung (Englisch)</Label>
              </div>

               <div className="space-y-6">
                {legendRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[2fr,2.5fr,2.5fr,0.5fr] gap-6 items-center">
                    {/* Input für Object */}
                    <Input
                      type="text"
                      value={row.object}
                      onChange={(e) => {
                        const updatedRows = [...legendRows];
                        updatedRows[index].object = e.target.value;
                        setLegendRows(updatedRows);
                      }}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Abkürzung"
                    />

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
              
              {selectedArea !== null ? (
                <AreaSettingsAccordion
                  area={selectedArea}
                  onUpdate={handleAreaUpdate}
                  allAreas={areas}
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

export default Admin;
