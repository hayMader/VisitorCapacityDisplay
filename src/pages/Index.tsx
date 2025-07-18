import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import { formatDateTime } from '@/utils/formatDatetime';
import { getLegend } from '@/utils/api';
import Footer from '@/components/Footer';

const getLocalizedTimeSuffix = (isUSFormat: boolean): string => {
  return isUSFormat ? '' : 'Uhr';
};

const Index = () => {
  const [latestTimestamp, setLatestTimestamp] = useState<string>('');
  const [latestTimestampISO, setLatestTimestampISO] = useState<string>('');
  const [showGermanTitle, setShowGermanTitle] = useState<boolean>(false);
  const [legendRows, setLegendRows] = useState<any[]>([]);
  const isUSFormat = !showGermanTitle;
 
  useEffect(() => {
    // get legend data
    const fetchLegend = async () => {
      const data = await getLegend();
      setLegendRows(data);
    };

    fetchLegend();

    const intervalId = setInterval(() => {
      setShowGermanTitle((prev) => !prev);
    }, 20000);
  
    return () => clearInterval(intervalId);
  }, []);

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
