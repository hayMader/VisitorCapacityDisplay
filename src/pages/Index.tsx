import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import { formatDateTime } from '@/utils/formatDatetime';
import Footer from '@/components/Footer';

const getLocalizedTimeSuffix = (isUSFormat: boolean): string => {
  return isUSFormat ? '' : 'Uhr';
};

const Index = () => {
  const [latestTimestamp, setLatestTimestamp] = useState<string>('');
  const [latestTimestampISO, setLatestTimestampISO] = useState<string>('');
  const [showGermanTitle, setShowGermanTitle] = useState<boolean>(false); // Toggle for German title
  const isUSFormat = !showGermanTitle; // Determine format based on title language
 
  // Toggle German title every 20 seconds
  useEffect(() => {

    const intervalId = setInterval(() => {
      setShowGermanTitle((prev) => !prev);
    }, 20000);
  
    return () => clearInterval(intervalId);
  }, []);

  // Update latest timestamp when the component mounts or when the format changes
  useEffect(() => {
    if (!latestTimestampISO) return;
    setLatestTimestamp(formatDateTime(latestTimestampISO, isUSFormat));
  }, [isUSFormat, latestTimestampISO]);

  // Set the latest timestamp every second
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date().toISOString();
      setLatestTimestampISO(now);
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  // Function to handle data updates and set the latest timestamp
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
      
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row items-center justify-center lg:justify-between" style={{ maxHeight: '85vh' }}>
        <ExhibitionMap 
          autoRefresh={true}
          refreshInterval={60000} // 60 seconds
          handleUpdate={handleDataUpdate}
          showGermanLabels={showGermanTitle}
          dashboard={true}
          currentPage='management'
          showNumbers={false} setShowConfigurator={function (value: React.SetStateAction<boolean>): void {
            throw new Error('Function not implemented.');
          } }        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
