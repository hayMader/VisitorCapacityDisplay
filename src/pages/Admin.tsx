
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

const Admin = () => {
  const [areas, setAreas] = useState<AreaStatus[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaStatus>(null);
  const [timeFilter, setTimeFilter] = useState(1440);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
                <h3>Aktueller Besucherfüllstand</h3>
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
                timeFilter={timeFilter}
              />
            </div>
            <div>
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
                <span>Jetzt</span>
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
