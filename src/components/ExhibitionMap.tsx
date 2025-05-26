/* ============================================================================
   ExhibitionMap.tsx
   – Hallenplan mit Live-Belegungsanzeige, 4-Level-Palette & Hot-Reload –
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { AreaStatus, Threshold } from '@/types';
import { getAreaSettings } from '@/utils/api';
import { RefreshCw } from 'lucide-react';

interface ExhibitionMapProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onDataUpdate?: (areas: AreaStatus[]) => void;
  onAreaSelect?: (area: AreaStatus) => void;
  selectedArea?: AreaStatus | null;
}

/* Hilfs­funktion: liefert Level (1-basiert) + zugehöriges Threshold-Objekt */
const getLevel = (visitors: number, ths: Threshold[]) => {
  const sorted = [...ths].sort((a, b) => a.upper_threshold - b.upper_threshold);
  const idx = sorted.findIndex(t => visitors <= t.upper_threshold);
  return {
    level: idx === -1 ? sorted.length + 1 : idx + 1,
    threshold: idx === -1 ? null : sorted[idx],
  };
};

const ExhibitionMap: React.FC<ExhibitionMapProps> = ({
  autoRefresh = true,
  refreshInterval = 60_000,
  onDataUpdate,
  onAreaSelect,
  selectedArea = null,
}) => {
  const [areas, setAreas] = useState<AreaStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ------------------------------------------------------------------ */
  /*  Daten holen + CSS-Variablen initialisieren                         */
  /* ------------------------------------------------------------------ */
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const data = await getAreaSettings();
      setAreas(data);
      onDataUpdate?.(data);

      /* --- CSS-Vars setzen (nimmt Palette des 1. Areals als Default) --- */
      const paletteSrc = data[0]?.thresholds ?? [];
      paletteSrc
        .sort((a, b) => a.upper_threshold - b.upper_threshold)
        .slice(0, 4) // bis zu 4 Farben
        .forEach((t, i) =>
          document.documentElement.style.setProperty(`--heat-${i + 1}`, t.color),
        );
    } catch (err) {
      console.error(err);
      toast({
        title: 'Fehler',
        description: 'Die Daten konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /* Initial-Load */
  useEffect(() => {
    fetchData();
  }, []);

  /* Auto-Reload */
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchData, refreshInterval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Daten werden geladen …</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden">
      {/* manueller Refresh-Button */}
      <button
        onClick={fetchData}
        disabled={isRefreshing}
        className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors"
        aria-label="Aktualisieren"
      >
        <RefreshCw className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      {/* Hintergrundplan + SVG-Overlay */}
      <div className="relative max-h-full max-w-full">
        <img
          src="/plan-exhibtion-area.jpg"
          alt="MMG Messegelände"
          className="max-h-[85vh] w-auto object-contain"
        />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 2050 1248"
          preserveAspectRatio="xMidYMid meet"
        >
          {areas.map(area => {
            const { level, threshold } = getLevel(area.amount_visitors, area.thresholds);

            /* Farbwahl mit Hot-Reload + Fallback */
            const fillColor =
              area.highlight ??
              `var(--heat-${Math.min(level, 4)})` ??
              threshold?.color ??
              'lightgray';

            const isSelected = selectedArea?.id === area.id;

            return (
              <g key={area.id} className="cursor-pointer" onClick={() => onAreaSelect?.(area)}>
                <rect
                  x={area.x}
                  y={area.y}
                  width={area.width}
                  height={area.height}
                  fill={fillColor}
                  fillOpacity={0.7}
                  stroke={isSelected ? '#000' : '#667080'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                {/* Hallenname */}
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
                {/* Besucherzahl */}
                <text
                  x={area.x + area.width / 2}
                  y={area.y + area.height / 2 + 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#1e293b"
                  fontSize="12"
                >
                  {area.amount_visitors}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ExhibitionMap;
