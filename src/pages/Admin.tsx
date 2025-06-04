
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { getAreaSettings } from '@/utils/api';
import { AreaStatus } from '@/types';
import AreaSettingsAccordion from '@/components/AreaSettingsAccordion';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [areas, setAreas] = useState<AreaStatus[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaStatus>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  // Filter areas based on search text
  const filteredAreas = areas.filter(area => 
    filterText === '' || area.area_name.toLowerCase().includes(filterText.toLowerCase())
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
                <h2 className="text-xl font-medium">Aktueller Besucherfüllstand</h2>
                <div className="text-gray-500">
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-lg">Hallen und Gelände</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Suchen..."
                    className="pl-9 h-10"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
              </div>
              <Separator className="mb-4" />
              
              <div className="flex flex-wrap gap-2">
                {halls.map(area => (
                  <Button
                    key={area.id}
                    variant={selectedArea === area ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedArea(area)}
                  >
                    {area.area_name}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {entrances.map(area => (
                  <Button
                    key={area.id}
                    variant={selectedArea === area ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedArea(area)}
                  >
                    {area.area_name}
                  </Button>
                ))}
              </div>
              
              {other.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {other.map(area => (
                    <Button
                      key={area.id}
                      variant={selectedArea === area ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedArea(area)}
                    >
                      {area.area_name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Area settings */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Bereichseinstellungen</h3>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Separator className="mb-4" />
              
              {selectedArea !== null ? (
                <AreaSettingsAccordion
                  area={selectedArea}
                  onUpdate={handleAreaUpdate}
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
