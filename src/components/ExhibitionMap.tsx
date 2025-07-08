import React, { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { AreaStatus, Threshold } from "@/types";
import { RefreshCw, Pencil } from "lucide-react";
import { useAreaStatus } from "@/contexts/AreaStatusContext";

interface ExhibitionMapProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onAreaSelect?: (area: AreaStatus) => void;
  setShowConfigurator?: React.Dispatch<React.SetStateAction<boolean>>;
  timeFilter?: number; // in minutes, default to 1440 (24 hours)
  showGermanLabels?: boolean;
  showNumbers?: boolean;
  showPercentage?: boolean;
  currentPage?: "security" | "management";
}

const ExhibitionMap: React.FC<ExhibitionMapProps> = ({
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute by default
  onAreaSelect,
  setShowConfigurator,
  showGermanLabels,
  showNumbers = false,
  showPercentage = false,
  currentPage,
}) => {
  const { areaStatus, refreshAreaStatus, isRefreshing, selectedArea } = useAreaStatus(); // Use the context
  const [isMediumSize, setIsMediumSize] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    await refreshAreaStatus();
  };

  const handleAreaClick = (area: AreaStatus) => {
    if (onAreaSelect) {
      onAreaSelect(area);
    }
  };

  const checkContainerSize = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setIsMediumSize(width >= 640 && width <= 900);
    }
  };

  useEffect(() => {
    checkContainerSize();
    window.addEventListener("resize", checkContainerSize);

    return () => {
      window.removeEventListener("resize", checkContainerSize);
    };
  }, [containerRef.current]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAreaStatus();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getOccupancyLevel = (visitorCount: number, thresholds: Threshold[]) => {
    return thresholds.reduce(
      (min, t) =>
        visitorCount <= t.upper_threshold && t.upper_threshold < min.upper_threshold
          ? t
          : min,
      { upper_threshold: Infinity } as Threshold
    );
  };

  const getPreviousThreshold = (visitorCount: number, thresholds: Threshold[]) => {
    return thresholds.reduce(
      (max, t) =>
        visitorCount > t.upper_threshold && t.upper_threshold > max.upper_threshold
          ? t
          : max,
      { upper_threshold: -Infinity } as Threshold
    );
  };

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
        className={`flex sm:flex-row flex-col h-full w-full items-center justify-center overflow-hidden ${
          isMediumSize ? "relative" : ""
        }`}
      >
        <div className={`flex ${isMediumSize ? "relative" : ""} h-full w-full flex items-center justify-center`}>
          <div className="relative max-h-full max-w-full">
            <div className={`absolute top-4 right-4 z-10`}>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors `}
                aria-label="Aktualisieren"
              >
                <RefreshCw className={`h-5 w-5 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              {/* Edit Area Button */}
              {currentPage === "management" && (
                <button
                  onClick={() => {
                    if (selectedArea) {
                      setShowConfigurator?.(true);
                    } else {
                      toast({
                        title: "Kein Bereich ausgewählt",
                        description: "Bitte wählen Sie zuerst einen Bereich aus.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors ml-2"
                  aria-label="Bereich bearbeiten"
                >
                  <Pencil className="h-5 w-5 text-primary" />
                </button>
              )}
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
                const thresholds = area.thresholds.filter(
                  (t) => t.type === (currentPage || "management")
                ); // Default to 'management' if currentPage is empty
                const activeTreshold = getOccupancyLevel(visitorCount, thresholds);
                const previousThreshold = getPreviousThreshold(visitorCount, thresholds);
                const isSelected = selectedArea === area;
                const pct = area.capacity_usage
                  ? Math.round((area.amount_visitors / area.capacity_usage) * 100)
                  : 0;
                const shouldBlink = previousThreshold.alert;

                // Calculate the centroid and bounding box center
                const pts = area.coordinates;
                const n = pts.length;
                let sumX = 0,
                  sumY = 0;
                let minX = Infinity,
                  maxX = -Infinity;
                let minY = Infinity,
                  maxY = -Infinity;

                for (let i = 0; i < n; i++) {
                  const { x, y } = pts[i];
                  sumX += x;
                  sumY += y;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }

                const centroidX = sumX / n;
                const centroidY = sumY / n;
                const bboxCenterX = (minX + maxX) / 2;
                const bboxCenterY = (minY + maxY) / 2;

                // Choose horizontal center from bounding box for better horizontal fit
                const cx = bboxCenterX;

                // We'll still use centroidY for vertical alignment (optionally adjust lower)
                let cy = centroidY;

                // Prepare lines of text to render
                const lines: { text: string; fontSize: number }[] = [];

                const titleText = showGermanLabels ? area.area_name : area.area_name_en;
                if (!area.hidden_name) {
                  lines.push({
                    text: titleText,
                    fontSize: isMediumSize ? 20 : 26,
                  });
                }

                if (showNumbers && !area.hidden_absolute) {
                  lines.push({
                    text: `${area.amount_visitors}`,
                    fontSize: isMediumSize ? 18 : 24,
                  });
                }

                if (showPercentage && !area.hidden_percentage) {
                  lines.push({
                    text: `${pct} %`,
                    fontSize: isMediumSize ? 16 : 22,
                  });
                }

                const lineHeight = 28; // adjust as needed
                const totalHeight = lines.length * lineHeight;
                const startY = cy - totalHeight / 2 + lineHeight / 2;

                // Handle inactive status
                if (area.status === "inactive" && !currentPage) {
                  return null; // Don't render the polygon if inactive and no currentPage
                }

                const fillColor =
                  area.status === "inactive"
                    ? "lightgray"
                    : shouldBlink
                    ? activeTreshold?.color || "lightgray"
                    : activeTreshold?.color || "lightgray";
                const strokeStyle = area.status === "inactive" ? "4,4" : "none"; // Dashed border for inactive areas

                return (
                  <g key={area.id}>
                    <polygon
                      points={area.coordinates
                        .map((point: { x: number; y: number }) => `${point.x},${point.y}`)
                        .join(" ")}
                      fill={fillColor}
                      fillOpacity={0.4}
                      stroke={isSelected ? "#000" : "#667080"}
                      strokeWidth={isSelected ? 2 : 0}
                      strokeDasharray={strokeStyle}
                      className={`exhibition-hall cursor-pointer ${
                        shouldBlink && area.status !== "inactive" ? "blink" : ""
                      }`}
                      onClick={() => handleAreaClick(area)}
                    />
                    {area.status === "inactive" ? (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#6b7280" // Gray color for inactive text
                        fontWeight="bold"
                        fontSize={isMediumSize ? 18 : 24}
                      >
                        inactive
                      </text>
                    ) : (
                      lines.map((line, index) => (
                        <text
                          key={index}
                          x={cx}
                          y={startY + index * lineHeight}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#1e293b"
                          fontWeight={index === 0 ? "bold" : "normal"}
                          fontSize={line.fontSize}
                        >
                          {line.text}
                        </text>
                      ))
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExhibitionMap;
