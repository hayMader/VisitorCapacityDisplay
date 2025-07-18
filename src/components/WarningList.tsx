import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { AreaStatus } from '@/types';
import { Threshold } from '@/types';
import { DoorOpen, Warehouse } from 'lucide-react';

const WarningList = ({ areaStatus, hideControls, dashboard=true }: { areaStatus: AreaStatus[]; hideControls?: boolean; dashboard?: boolean }) => {
    const [warningSearchTerm, setWarningSearchTerm] = useState("");
    const [showEntrances, setShowEntrances] = useState(true);
    const [showHalls, setShowHalls] = useState(true);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const listElement = listRef.current;
        if (!listElement) return;

        const scrollHeight = listElement.scrollHeight;
        const clientHeight = listElement.clientHeight;

        // Ensure scrolling only starts if the content exceeds the container height
        if (scrollHeight > clientHeight) {
            let scrollDirection = 1; // 1 for down, -1 for up
            let scrollPosition = 0;

            const scrollInterval = setInterval(() => {
                scrollPosition += scrollDirection;
                listElement.scrollTop = scrollPosition;

                // Adjust logic to ensure the last element is fully visible
                if (scrollPosition + clientHeight >= scrollHeight+50) {
                    scrollDirection = -1; // Reverse to scroll up
                } else if (scrollPosition <= 0) {
                    scrollDirection = 1; // Reverse to scroll down
                }
            }, 30); // Adjust speed by changing the interval time

            return () => clearInterval(scrollInterval);
        }
    }, [areaStatus]);

    const getActiveThreshold = (visitorCount: number, thresholds: Threshold[]): Threshold | null => {
        const sortedThresholds = thresholds
            .filter(threshold => threshold.type === "security")
            .sort((a, b) =>
                (b.upper_threshold === -1 ? Infinity : b.upper_threshold) -
                (a.upper_threshold === -1 ? Infinity : a.upper_threshold)
            );

        for (let i = 0; i < sortedThresholds.length; i++) {
            const currentThreshold = sortedThresholds[i];
            const nextLowerThreshold = sortedThresholds[i + 1];
            const lowerBound = nextLowerThreshold ? nextLowerThreshold.upper_threshold : -Infinity;

            if (visitorCount >= lowerBound && currentThreshold.alert_message_control) {
                return currentThreshold;
            }
        }

        return null;
    };

    const filteredAreas = (area: AreaStatus) => {
        const matchesSearch = area.area_name.toLowerCase().includes(warningSearchTerm.toLowerCase());
        const isEntrance = area.type == "entrance";
        const isHall = area.type != "entrance";

        return (
            (showEntrances && isEntrance) ||
            (showHalls && isHall)
        ) && matchesSearch;
    };

    return (
        <>
            <h3 className="text-lg font-semibold mb-4">Warnungen</h3>

            {/* Filter Controls */}
            {!hideControls && (
                <div className="mb-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Bereich suchen..."
                            value={warningSearchTerm}
                            onChange={(e) => setWarningSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="show-entrances"
                                checked={showEntrances}
                                onCheckedChange={(checked) => setShowEntrances(!!checked)}
                            />
                            <label htmlFor="show-entrances" className="text-sm">
                                Eingänge anzeigen
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="show-halls"
                                checked={showHalls}
                                onCheckedChange={(checked) => setShowHalls(!!checked)}
                            />
                            <label htmlFor="show-halls" className="text-sm">
                                Hallen anzeigen
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <Separator className="mb-4" />

            {/* Warnings List */}
            <div ref={listRef} className="overflow-hidden relative" style={{height: 'inherit'}}>
                {areaStatus
                    .sort((a, b) => a.area_name.localeCompare(b.area_name, 'de-DE', { numeric: true, sensitivity: 'base' }))
                    .filter(area => getActiveThreshold(area.amount_visitors, area.thresholds) !== null)
                    .filter(area => filteredAreas(area))
                    .concat([
                        // Adding a default "Empty Area" to ensure its scrolled down completly
                        { 
                            id: -1, 
                            area_name: "Empty Area", 
                            amount_visitors: 0, 
                            thresholds: [], 
                            capacity_usage: 0, 
                            coordinates: null, 
                            highlight: "", // Ensure this matches the expected string type
                            hidden_name: false, // Ensure this matches the expected boolean type
                            type: "hall" ,
                            status: "active", // Ensure this matches the expected string type
                        } // Fully defined AreaStatus
                    ]).filter(area => (area.id !== -1 || !dashboard)) // Exclude the default "Empty Area"
                    .map(area => {
                        const activeThreshold = getActiveThreshold(area.amount_visitors, area.thresholds);
                        const isEntrance = area.area_name?.toLowerCase().includes("e");
                        return (
                            <div
                                key={area.id}
                                className="border p-4 rounded-lg mb-4 flex items-center gap-4"
                                style={{ backgroundColor: `${activeThreshold?.color || '#ffffff'}40` }} // Adding opacity
                            >
                                {/* Icon */}
                                {isEntrance ? (
                                    <DoorOpen className="text-blue-500 w-6 h-6" /> // Icon for entrances
                                ) : (
                                    <Warehouse className="text-green-500 w-6 h-6" /> // Icon for halls
                                )}
                                {/* Warning Details */}
                                <div>
                                    <h4 className="font-bold text-red-600">{area.area_name || "Unbekannter Bereich"}</h4>
                                    <p className="text-sm text-red-700">
                                        {activeThreshold?.alert_message || "Keine Warnung verfügbar."}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                {areaStatus.filter(area => getActiveThreshold(area.amount_visitors, area.thresholds) !== null).length === 0 && (
                    <p className="text-sm text-gray-500">
                        {warningSearchTerm || !showEntrances || !showHalls
                            ? "Keine Warnungen gefunden mit den aktuellen Filtereinstellungen."
                            : "Keine Warnungen vorhanden."}
                    </p>
                )}
            </div>
        </>
    );
};

export default WarningList;