import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { AreaStatus, Threshold } from '@/types';
import { getAreaSettings } from '@/utils/api';
import { RefreshCw } from 'lucide-react';
import { getLegend } from '@/utils/api';
import { LegendRow } from '@/types';

interface ExhibitionMapProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onDataUpdate?: (areaStatus: AreaStatus[]) => void;
  onAreaSelect?: (areaNumber: AreaStatus) => void;
  setShowConfigurator: React.Dispatch<React.SetStateAction<boolean>>;
  selectedArea?: AreaStatus | null;
  timeFilter?: number; // in minutes, default to 1440 (24 hours)
  showGermanLabels?: boolean; //
  showNumbers?: boolean;
  showPercentage?: boolean;
  currentPage?: 'security' | 'management';
}

const ExhibitionMap: React.FC<ExhibitionMapProps> = ({ 
  autoRefresh = true, 
  refreshInterval = 60000, // 1 minute by default
  onDataUpdate,
  onAreaSelect,
  showGermanLabels,
  timeFilter,
  selectedArea = null,
  showNumbers = false,
  showPercentage = false,
  currentPage = 'management', // default to 'management'
}) => {
  const [areaStatus, setAreaStatus] = useState<AreaStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [legendRows, setLegendRows] = useState<LegendRow[]>([]);
  const [isEnglish, setIsEnglish] = useState(false);
  const [isMediumSize, setIsMediumSize] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const newAreaStatus = await getAreaSettings(timeFilter);
      const newLegendRows = await getLegend();
      setLegendRows(newLegendRows);
      
      setAreaStatus(newAreaStatus);
      setLastRefreshed(new Date());

      checkContainerSize();

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

  useEffect(() => {
    console.log('Fetching data with time filter:', timeFilter);
    fetchData();
  }, [timeFilter]);

  useEffect(() => {
    // Initial check for container size
    checkContainerSize();
  }, []);

  // Detect parent container width
  useEffect(() => {
    checkContainerSize();
    window.addEventListener('resize', checkContainerSize);

    return () => {
      window.removeEventListener('resize', checkContainerSize);
    };
  }
, [containerRef.current]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    fetchData();
  };
  
  function handleAreaClick(area: AreaStatus) {
    if (onAreaSelect) {
      onAreaSelect(area);
    }
  }

  const getOccupancyLevel = (visitorCount: number, thresholds: Threshold[]) => {
    return thresholds.reduce((min, t) =>
      visitorCount <= t.upper_threshold && t.upper_threshold < min.upper_threshold ? t : min,
      { upper_threshold: Infinity } as Threshold
    );
  };

  const getPreviousThreshold = (visitorCount: number, thresholds: Threshold[]) => {
    return thresholds.reduce((max, t) =>
      visitorCount > t.upper_threshold && t.upper_threshold > max.upper_threshold ? t : max,
      { upper_threshold: -Infinity } as Threshold
    );
  };

  const checkContainerSize = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setIsMediumSize(width >= 640 && width <= 900);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full m-auto">
        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Daten werden geladen...</p>
      </div>
    );
  }

  function setShowConfigurator(arg0: boolean): void {
    throw new Error('Function not implemented.');
  }

  return (
    <>
    <style>
        {`
          .blink {
            animation: blink-animation 1s infinite;
          }

          @keyframes blink-animation {
            0% {
              fill-opacity: 0.4;
            }
            50% {
              fill-opacity: 1;
            }
            100% {
              fill-opacity: 0.4;
            }
          }
        `}
    </style>
    <div 
      ref={containerRef} 
      className={`flex sm:flex-row flex-col h-full w-full items-center justify-center overflow-hidden ${isMediumSize ? 'relative' : ''}`}
    >
      <div className={`flex ${isMediumSize ? 'relative' : ''} h-full w-full flex items-center justify-center`}>
        <div className="relative max-h-full max-w-full">
          <div className={`absolute top-4 right-4 z-10`}>
            <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors `}
                aria-label="Aktualisieren"
                  >
                <RefreshCw 
                  className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''} `}
                />
            </button>
            {/* Edit Area Button */}
              <button
                  onClick={() => setShowConfigurator(true)}
                  className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors"
                  aria-label="Edit Area"
                    >
                    ✎
                </button>
              </div>
          <img 
            src="/plan-exhibtion-area.jpg" 
            alt="MMG Messegelände" 
            className="max-h-[85vh] w-auto object-contain"
          />
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 2050 1248" 
            preserveAspectRatio="xMidYMid meet"
          >
            {areaStatus.map((area) => {
              const visitorCount = area.amount_visitors;
              const thresholds = area.thresholds.filter(t => t.type === currentPage); // Filter thresholds based on the page type
              const activeTreshold = getOccupancyLevel(visitorCount, thresholds);
              const previousThreshold = getPreviousThreshold(visitorCount, thresholds);
              const isSelected = selectedArea === area;
              const pct = area.capacity_usage
                ? Math.round((area.amount_visitors / area.capacity_usage) * 100)
                : 0;
              const shouldBlink = previousThreshold.alert;
              const isInactive = area.active === false; 
              const hallFill   = isInactive                        
                  ? "#d1d5db"                                       
                  : shouldBlink
                        ? activeTreshold?.color || "lightgray"
                        : activeTreshold?.color || "lightgray";

              return (
                <g key={area.id}>
                  <polygon
                    points={area.coordinates.map((point: { x: number; y: number }) => `${point.x},${point.y}`).join(' ')}
                    fill={hallFill}
                    fillOpacity={0.4}
                    stroke={isSelected ? "#000" : "#667080"}
                    strokeWidth={isSelected ? 2 : 0}
                    className={`exhibition-hall cursor-pointer ${shouldBlink ? 'blink' : ''}`}
                    onClick={() => handleAreaClick(area)}
                  />
                  {(() => {
                    const pts = area.coordinates;
                    const n = pts.length;
                    let cx = 0, cy = 0;
                    for (let i = 0; i < n; i++) {
                      cx += pts[i].x;
                      cy += pts[i].y;
                    }
                    cx /= n;
                    cy /= n;

                    return (
                      <>
                        {!area.hidden_name && (
                            <text
                            x={cx}
                            y={cy - (!area.hidden_absolute && !area.hidden_percentage ? 22 : 0)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#1e293b"
                            fontWeight="bold"
                            fontSize={isMediumSize ? "20" : "26"}
                            >
                            {showGermanLabels ? area.area_name : area.area_name_en}
                            </text>
                        )}

                        {showNumbers &&!area.hidden_absolute && (
                            <text
                            x={cx}
                            y={cy + (!area.hidden_percentage ? 11 : 22)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#1e293b"
                            fontSize={isMediumSize ? "18" : "24"}
                            >
                            {area.amount_visitors}
                            </text>
                        )}

                        {showPercentage &&!area.hidden_percentage && (
                          <text
                            x={cx}
                            y={cy + (!area.hidden_absolute ? 44 : 22)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#1e293b"
                            fontSize={isMediumSize ? "16" : "22"}
                          >
                            {pct} %
                          </text>
                        )}
                      </>
                    );
                  })()}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {currentPage === 'management' && (
      <div ref={containerRef} className={`flex ${isMediumSize ? 'absolute' : ''} bottom-4 right-4 z-10 bg-white p-4 rounded sm:shadow-xl items-right mr-4`} style={{minWidth: "20%", flexGrow: 1 }}>
        <div className="space-y-1">
          {legendRows.map((row) => (
            <div key={row.id} className={`grid grid-cols-[auto,1fr] gap-2 items-center `} style={{ width: 'fit-content' }}>
              {/^#[0-9A-Fa-f]{6}$/.test(row.object) ? (
                <div
                  className={`w-9 h-9 rounded-full `}
                  style={{ backgroundColor: row.object }}
                />
                
              ) : (
                (!/^\d+$/.test(row.object) || showNumbers) && (
                <span
                  className={`font-bold whitespace-nowrap`} 
                  style={{ 
                  width: 'fit-content', 
                  fontSize: isMediumSize ? '1rem' : '1.25rem' 
                  }}
                >
                  {row.object}
                </span>
                )
                )}
                <span 
                style={{ 
                  textAlign: 'left', 
                  minWidth: `${Math.max(
                  showGermanLabels ? row.description_de.length : 0,
                  showGermanLabels ? 0 : row.description_en.length
                  )}ch`,
                  fontSize: isMediumSize ? '1rem' : '1.25rem'
                }}
                >
                {showGermanLabels ? row.description_de : row.description_en}
                </span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
    </>
  );
};

export default ExhibitionMap;
