import React, { useEffect, useRef, useState } from "react";
import { AreaStatus, AreaType, Threshold } from "@/types";
import { RefreshCw, Pencil, SquarePlus } from "lucide-react";
import { useAreaStatus } from "@/contexts/AreaStatusContext";
import { createNewArea } from "@/utils/api"; // Import the function to create a new area

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
  dashboard?: boolean; // If true, the map is used in a dashboard context
  handleUpdate?: () => void; // Function to handle refresh, can be passed from parent
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
  dashboard = false, // If true, the map is used in a dashboard context
  handleUpdate = () => {}, // Function to handle refresh, can be passed from parent
}) => {
  const { areaStatus, legendRows, refreshAreaStatusAndLegend, refreshAreaStatus, isRefreshing, selectedArea } = useAreaStatus(); // Use the areastatus context
  
  // State to manage the size of the container and whether to show the area type selector
  const [isMediumSize, setIsMediumSize] = useState(false);
  const [showAreaTypeSelector, setShowAreaTypeSelector] = useState(false); // State to toggle the selector
  const [typeList] = useState<{ id: AreaType; name: string }[]>([
    { id: "entrance", name: "Eingang" },
    { id: "hall", name: "Halle" },
    { id: "other", name: "Sonstiges" },
  ]); // area types

  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to fetch area status and legend on initial load
  useEffect(() => {
    // Initial fetch of area status
    refreshAreaStatusAndLegend();
  }, []);

  //scale container size on change
  useEffect(() => {
    checkContainerSize();
    window.addEventListener("resize", checkContainerSize);

    return () => {
      window.removeEventListener("resize", checkContainerSize);
    };
  }, [containerRef.current]);

  //autorefresh data every interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if( dashboard ) {
        refreshAreaStatusAndLegend(); // Refresh both area status and legend
      } else {
       refreshAreaStatus(); // Refresh only area status, because else legendeditor would be reset
     }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Function to handle creating a new area based on the selected type
  const handleCreateNewArea = async (type: AreaType) => {
    const newArea = await createNewArea(type); // Pass the selected type to the API
    refreshAreaStatus(); // Refresh area status after creating a new area
    if (newArea) {
      onAreaSelect(newArea);
    }
    setShowAreaTypeSelector(false); // Close the selector after creating the area
  };

  // Function to handle refreshing the area status and legend
  const handleRefresh = async () => {
    handleUpdate();
    if( dashboard ) {  // depending on the dashboard context, refresh different elements
      refreshAreaStatusAndLegend(); // Refresh both area status and legend
    } else {
      refreshAreaStatus(); // Refresh only area status, because else legendeditor would be reset
    }
  };

  /* ---- Helper Functions ---- */

  // HelperFunction to check the container size and set the isMediumSize state
  const checkContainerSize = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setIsMediumSize(width >= 640 && width <= 900);
    }
  };

  // Function to get the occupancy level based on visitor count and thresholds
  const getOccupancyLevel = (visitorCount: number, thresholds: Threshold[]) => {
    return thresholds.reduce(
      (min, t) => {
      const upperThreshold = t.upper_threshold === -1 ? Infinity : t.upper_threshold;
      return visitorCount <= upperThreshold && upperThreshold <= min.upper_threshold
        ? { ...t, upper_threshold: upperThreshold }
        : min;
      },
      { upper_threshold: Infinity } as Threshold
    );
  };

  // Function to get the previous threshold based on visitor count and thresholds
  const getPreviousThreshold = (visitorCount: number, thresholds: Threshold[]) => {
    const sortedThresholds = thresholds
            .sort((a, b) =>
                (b.upper_threshold === -1 ? Infinity : b.upper_threshold) -
                (a.upper_threshold === -1 ? Infinity : a.upper_threshold)
            );

        for (let i = 0; i < sortedThresholds.length; i++) {
            const currentThreshold = sortedThresholds[i];
            const nextLowerThreshold = sortedThresholds[i + 1];
            const lowerBound = nextLowerThreshold ? nextLowerThreshold.upper_threshold : -Infinity;

            if (visitorCount >= lowerBound && currentThreshold.alert) {
                return currentThreshold;
            }
        }

        return null;
  };

  return (
    <>
      <style>
        {/* CSS for blinking effect */}
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
              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors `}
                aria-label="Aktualisieren"
              >
                <RefreshCw className={`h-5 w-5 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              {/* Edit Area Button */}
              {currentPage === "management" && !dashboard && ( // Show edit button only in management page and not in dashboard
                <>
                  {selectedArea != null ? ( // If an area is selected, show the edit button
                    <button
                      onClick={() => {
                        setShowConfigurator?.(true);
                      }}
                      className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors ml-2"
                      aria-label="Bereich bearbeiten"
                      title="Klicke um Fläche zu bearbeiten"
                    >
                      <Pencil className="h-5 w-5 text-primary" />
                    </button>
                  ) : ( // If no area is selected, show the create new area button
                    <>

                      <button
                        onClick={() => setShowAreaTypeSelector(!showAreaTypeSelector)} // Toggle the selector
                        className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors ml-2"
                        aria-label="Bereich erstellen"
                        title="Klicke um eine Neue Fläche zu erstellen"
                      >
                        <SquarePlus className="h-5 w-5 text-primary" />
                      </button>
                      {/* Show area type selector when button is clicked */}
                      <div className="relative">
                        {showAreaTypeSelector && (
                          <div className="absolute top-full mt-2 right-0 bg-white shadow-lg rounded p-2 z-20">
        
                            {typeList.map((typeitem) => (
                              <button
                                key={typeitem.id}
                                onClick={() => handleCreateNewArea(typeitem.id)} // Pass the selected type
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                              >
                                {typeitem.name}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                    </>
                  )}
                </>
              )}
            </div>
            {/* Background image */}
            <img
              src="/plan-exhibtion-area.jpg"
              alt="MMG Messegelände"
              className="max-h-[85vh] w-auto object-contain cursor-pointer"
              
            />
            {/* SVG overlay for areas */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 2050 1248" // Adjust viewBox to match the image dimensions, needs to be changed if the image size changes
              preserveAspectRatio="xMidYMid meet"

            >
              {/* Overlay to enable click events on the entire SVG area, e.g. Deselect areas */}
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="transparent" // Transparent background
                pointerEvents="all" // Ensure it captures click events
                onClick={() => onAreaSelect(null)}
              />
              {/* Show areas */}
              {areaStatus
                .filter(area => (dashboard ? area.status !== "inactive" : true)) // Show only active areas in dashboard, otherwise show all
                .map((area) => {
                  // Calculate properties for each area
                  const visitorCount = area.amount_visitors;
                  const thresholds = area.thresholds.filter(
                    (t) => t.type === (currentPage || "management")
                  ); // Default to 'management' if currentPage is empty
                  const activeTreshold = getOccupancyLevel(visitorCount, thresholds); // Get the active threshold based on visitor count
                  const previousThreshold = getPreviousThreshold(visitorCount, thresholds); // Get the previous threshold based on visitor count
                  const isSelected = selectedArea?.id === area.id; // Check if the area is selected
                  // Calculate percentage of capacity usage
                  const pct = area.capacity_usage
                    ? Math.round((area.amount_visitors / area.capacity_usage) * 100)
                    : 0;

                  let shouldBlink = false;
                  if(previousThreshold){
                    shouldBlink = previousThreshold.alert; // Check if the previous threshold has an alert
                  }
                  

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
                  const cx = (minX + maxX) / 2;
                  const cy = (minY + maxY) / 2;

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

                  const lineHeight = 22; // adjust as needed
                  const totalHeight = lines.length ? lines.length * lineHeight : 0; // Total height of all lines
                  const availableHeight = maxY - minY; // Available height of the area polygon

                  // Determine if horizontal alignment is needed
                  const useHorizontalAlignment = totalHeight > availableHeight;

                  // Calculate horizontal alignment
                  const lineSpacing = 70; // Adjust spacing between lines
                  const totalWidth = lines.length * lineSpacing - lineSpacing; // Total width of all lines
                  const startX = cx - totalWidth / 2; // Start position for horizontal alignment

                  const startY = cy - totalHeight / 2 + lineHeight / 2;

                  // Handle inactive status
                  if (area.status === "inactive" && !currentPage) {
                    return null; // Don't render the polygon if inactive and no currentPage
                  }

                  // Determine fill color and stroke style based on status and thresholds
                  const fillColor =
                    area.status === "inactive"
                      ? "lightgray"
                      : shouldBlink
                      ? activeTreshold?.color || "lightgray"
                      : activeTreshold?.color || "lightgray";
                  const strokeStyle = area.status === "inactive" ? "4,4" : "none"; // Dashed border for inactive areas

                  // Render the area polygon with text
                  return (
                      <g key={area.id} onClick={() => onAreaSelect(area)} className="cursor-pointer">
                      <polygon
                        points={area.coordinates
                        .map((point: { x: number; y: number }) => `${point.x},${point.y}`)
                        .join(" ")}
                        fill={fillColor}
                        fillOpacity={1}
                        stroke={isSelected && !dashboard ? "#000" : "#667080"}
                        strokeWidth={isSelected && !dashboard ? 3 : 0} // Increased stroke width for selected areas
                        strokeDasharray={isSelected && !dashboard ? "none" : strokeStyle} // Solid border for selected areas
                        className={`exhibition-hall ${shouldBlink && area.status !== "inactive" ? "blink" : ""}`}
                        style={isSelected && !dashboard ? { filter: "drop-shadow(0 0 10px #000)" } : {}} // Add shadow effect for selected areas
                      />
                      {area.status === "inactive" ? ( // Render text for inactive areas
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
                      ) : ( // Render text for active areas
                        <g>
                          {useHorizontalAlignment // If horizontal alignment is needed
                            ? lines.map((line, index) => (
                                <text
                                  key={index}
                                  x={startX + index * lineSpacing} // Adjust spacing between lines
                                  y={cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill="#1e293b"
                                  fontWeight={index === 0 ? "bold" : "normal"}
                                  fontSize={line.fontSize}
                                >
                                  {line.text}
                                </text>
                              ))
                            : lines.map((line, index) => (
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
                              ))}
                        </g>
                      )}
                    </g>
                  );
              })}
            </svg>
          </div>
        </div>
        {/* Display Legend */}
        <div 
          className={`flex absolute bottom-4 right-4 z-10 bg-white p-4 rounded shadow-xl items-right mr-4`}
          style={{minWidth: "20%", flexGrow: 1 }}
        >
          <div className="space-y-1">
            {legendRows
            .filter(row => row.type === currentPage) // Filter rows based on the current page type
            .map((row) => (
              <div key={row.id} className={`grid grid-cols-[auto,1fr] gap-2 items-center `} style={{ width: 'fit-content' }}>
                {/^#[0-9A-Fa-f]{6}$/.test(row.object) ? ( // Check if the object is a valid hex color code
                  // If the object is a valid hex color code, display a colored circle
                  <div
                    className={`w-5 h-5 rounded-full `}
                    style={{ backgroundColor: row.object }}
                  />
                  
                ) : ( // If the object is not a hex color code, display the object text
                  (!/^\d+$/.test(row.object) || showNumbers) && ( // Show the object text only if it's not a number or if showNumbers is true
                  <span
                    className={`font-bold whitespace-nowrap`} 
                    style={{ 
                    width: 'fit-content', 
                    fontSize: isMediumSize ? '1rem' : '1.25rem' 
                    }}
                  >
                    {showGermanLabels ? row.object : row.object_en}
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
      </div>
    </>
  );
};

export default ExhibitionMap;
