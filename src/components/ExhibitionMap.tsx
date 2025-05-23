import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { AreaStatus, Threshold } from '@/types';
import { getAreaSettings } from '@/utils/api';
import { RefreshCw } from 'lucide-react';
import { Area } from 'recharts';

interface ExhibitionMapProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onDataUpdate?: (areaStatus: AreaStatus[]) => void;
  onAreaSelect?: (areaNumber: AreaStatus) => void;
  selectedArea?: AreaStatus | null;
}

const ExhibitionMap: React.FC<ExhibitionMapProps> = ({ 
  autoRefresh = true, 
  refreshInterval = 60000, // 1 minute by default
  onDataUpdate,
  onAreaSelect,
  selectedArea = null
}) => {
  const [areaStatus, setAreaStatus] = useState<AreaStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Function to fetch the latest data
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const newAreaStatus = await getAreaSettings();
      
      setAreaStatus(newAreaStatus);
      setLastRefreshed(new Date());
      
      if (onDataUpdate) {
        onDataUpdate(newAreaStatus);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Fehler',
        description: 'Die Daten konnten nicht aktualisiert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Set up auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchData();
  };
  
  // Handle area click
  const handleAreaClick = (area: AreaStatus) => {
    if (onAreaSelect) {
      onAreaSelect(area);
    }
  };

  // Function to determine occupancy level based on visitor count and thresholds
  const getOccupancyLevel = (visitorCount: number, thresholds: Threshold[]) => {
    // Get the highest threshold that is less than or equal to the visitor count
    const activeThreshold = thresholds.find(threshold => visitorCount <= threshold.upper_threshold);
    return activeThreshold
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Daten werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors"
          aria-label="Aktualisieren"
        >
          <RefreshCw 
            className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
      
      {/* Map container with responsive scaling */}
      <div className="relative h-full w-full flex items-center justify-center">
        {/* Floor plan background image */}
        <div className="relative max-h-full max-w-full">
          <img 
            src="/plan-exhibtion-area.jpg" 
            alt="MMG Messegelände" 
            className="max-h-[85vh] w-auto object-contain"
          />
          
          {/* SVG overlay positioned absolutely on top of the image */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 2050 1248" 
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Exhibition halls */}
            {areaStatus.map((area) => {
              const visitorCount = area.amount_visitors;
              const thresholds = area.thresholds;
              const activeTreshold = getOccupancyLevel(visitorCount, thresholds);
              const isSelected = selectedArea === area;
              
              return (
                <g key={area.id}>
                  <rect
                    x={area.x}
                    y={area.y}
                    width={area.width}
                    height={area.height}
                    fill={area.highlight || activeTreshold?.color || 'lightgray'}
                    fillOpacity={0.7}
                    stroke={isSelected ? "#000" : "#667080"}
                    strokeWidth={isSelected ? 2 : 1}
                    className="exhibition-hall cursor-pointer"
                    onClick={() => handleAreaClick(area)}
                  />
                  <text
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#1e293b"
                    fontWeight="bold"
                    fontSize="14"
                  >
                    {area.area_name}
                  </text>
                  <text
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2 + 20}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#1e293b"
                    fontSize="12"
                  >
                    {visitorCount}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionMap;
