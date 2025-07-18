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

  const { areaStatus } = useAreaStatus(); // Use the context

  const [latestTimestamp, setLatestTimestamp] = useState<string>('');
  const [latestTimestampISO, setLatestTimestampISO] = useState<string>('');
  const [showGermanTitle, setShowGermanTitle] = useState<boolean>(true);
  const isUSFormat = !showGermanTitle;


  useEffect(() => {
    if (!latestTimestampISO) return;
    setLatestTimestamp(formatDateTime(latestTimestampISO, isUSFormat));
  }, [isUSFormat, latestTimestampISO]);

  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date().toISOString();
      setLatestTimestampISO(now);
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  const handleDataUpdate = () => {
    const iso = new Date().toISOString();
    setLatestTimestampISO(iso);
    setLatestTimestamp(formatDateTime(iso, isUSFormat));
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title={showGermanTitle ? "Besucherfüllstand" : "Visitor count"} 
        subtitle={latestTimestamp
          ? `${latestTimestamp} ${getLocalizedTimeSuffix(isUSFormat)}`
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
            showGermanLabels={showGermanTitle}
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
