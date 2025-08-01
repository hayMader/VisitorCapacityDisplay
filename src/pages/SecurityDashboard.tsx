import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import { formatDateTime } from '@/utils/formatDatetime';
import { useAreaStatus } from '@/contexts/AreaStatusContext';
import WarningList from '@/components/WarningList'; // Import the WarningList component
import Footer from '@/components/Footer';

const getLocalizedTimeSuffix = (isUSFormat: boolean): string => {
  return isUSFormat ? '' : 'Uhr';
};

const SecurityDashboard = () => {

  const { areaStatus } = useAreaStatus(); // Use the status from context

  // State variables for managing timestamps and display options
  const [latestTimestamp, setLatestTimestamp] = useState<string>('');

  useEffect(() => {
    // Set the latest timestamp when the component mounts
    const now = new Date().toISOString();
    setLatestTimestamp(formatDateTime(now, false)); // Use false for German format
  }, []);

  // Update the time display when data is refreshed
  const handleDataUpdate = () => {
    const iso = new Date().toISOString();
    setLatestTimestamp(formatDateTime(iso, false));
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title={"Besucherfüllstand"} 
        subtitle={latestTimestamp
          ? `${latestTimestamp} ${getLocalizedTimeSuffix(false)}`
          : undefined}
      />
      
      <main className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 10vh)' }}>
        {/* Warning List Section */}
        <div className="flex-grow bg-white p-4 rounded-lg shadow-sm" style={{ height: 'inherit' }}>
          <WarningList areaStatus={areaStatus} hideControls={true} dashboard={false} />
        </div>
        
        {/* Map Section */}
        <div >
          <ExhibitionMap 
            autoRefresh={true}
            refreshInterval={60000} // 60 seconds
            handleUpdate={handleDataUpdate}
            showGermanLabels={true}
            currentPage='security'
            showNumbers={false}
            dashboard={true}
            setShowConfigurator={function (value: React.SetStateAction<boolean>): void {
              throw new Error('Function not implemented.');
            }}
          />
        </div>

        
      </main>
      
      <Footer />
    </div>
  );
};

export default SecurityDashboard;
