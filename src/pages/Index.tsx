import React, { useState } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import { formatDateTime } from '@/utils/formatDatetime';
import { AreaStatus } from '@/types';

const Index = () => {
  const [latestTimestamp, setLatestTimestamp] = useState<string>('');
  
  const handleDataUpdate = (areaStatus: AreaStatus[]) => {
    const timestamp = new Date().toISOString();
    setLatestTimestamp(formatDateTime(timestamp));
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title="Besucherfüllstand" 
        subtitle={latestTimestamp ? `${latestTimestamp} Uhr` : undefined}
      />
      
      <main className="flex-1 overflow-hidden flex items-center justify-center" style={{ maxHeight: '85vh' }}>
        <ExhibitionMap 
          autoRefresh={true}
          refreshInterval={60000} // 60 seconds
          onDataUpdate={handleDataUpdate}
        />
      </main>
      
      <footer className="bg-white border-t py-2 text-center text-sm text-muted-foreground" style={{ maxHeight: '5vh' }}>
        <p>© {new Date().getFullYear()} MMG-Messegelände München Riem</p>
      </footer>
    </div>
  );
};

export default Index;
