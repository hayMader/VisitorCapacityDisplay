import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { AreaStatus } from '@/types';
import { Threshold } from '@/types';
import { DoorOpen, Warehouse } from 'lucide-react';

const WarningList = ({ areaStatus }: { areaStatus: AreaStatus[] }) => {
    // Filter states for warnings
    const [warningSearchTerm, setWarningSearchTerm] = useState("");
    const [showEntrances, setShowEntrances] = useState(true);
    const [showHalls, setShowHalls] = useState(true)


    const getActiveMessage = (visitorCount: number, thresholds: Threshold[]): string | null => {
        // Sort thresholds by upper_threshold in descending order, treating -1 as Infinity
        const sortedThresholds = thresholds
            .filter(threshold => threshold.type === "security") // Only consider thresholds with active messages
            .sort((a, b) => 
                (b.upper_threshold === -1 ? Infinity : b.upper_threshold) - 
                (a.upper_threshold === -1 ? Infinity : a.upper_threshold)
            );

        for (let i = 0; i < sortedThresholds.length; i++) {
            const currentThreshold = sortedThresholds[i];
            const nextLowerThreshold = sortedThresholds[i + 1]; // The next lower threshold

            const lowerBound = nextLowerThreshold ? nextLowerThreshold.upper_threshold : -Infinity;

            // Check if the visitor count is within the bounds of the current threshold
            if (visitorCount >= lowerBound && currentThreshold.alert_message_control) {
                if (currentThreshold.alert_message) {
                    return currentThreshold.alert_message; // Return the active message for the current threshold
                }else{
                    return `Warnung: Besucheranzahl ${visitorCount} überschreitet den Schwellenwert von ${lowerBound}.`;
                }
            }
        }

        return null; // No active message found
    };

    // Filter areas based on search term and checkbox states
    const filteredAreas = (area) => {
        const matchesSearch = area.area_name.toLowerCase().includes(warningSearchTerm.toLowerCase());
        const isEntrance = area.area_name.toLowerCase().includes("eingang");
        const isHall = !area.area_name.toLowerCase().includes("eingang");

        return (
            (showEntrances && isEntrance) ||
            (showHalls && isHall) ||
            (!showEntrances && !showHalls)
        ) && matchesSearch;
    }; 

    return (
        <>
            <h3 className="text-lg font-semibold mb-4">Warnungen</h3>

            {/* Filter Controls */}
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

            <Separator className="mb-4" />

            {/* Warnings List */}
            {areaStatus
                .sort((a, b) => {
                    // Natural alphanumerical sort that handles numbers properly
                    return a.area_name.localeCompare(b.area_name, 'de-DE', {
                        numeric: true,
                        sensitivity: 'base'
                    });
                })
                .filter(area => getActiveMessage(area.amount_visitors, area.thresholds) !== null)
                .filter(area => filteredAreas(area))
                .map(area => {
                    const isEntrance = area.area_name.toLowerCase().includes("eingang");
                    return (
                        <div key={area.id} className="border p-4 rounded-lg mb-4 bg-red-50 flex items-center gap-4">
                            {/* Icon */}
                            {isEntrance ? (
                                <DoorOpen className="text-blue-500 w-6 h-6" /> // Icon for entrances
                            ) : (
                                <Warehouse className="text-green-500 w-6 h-6" /> // Icon for halls
                            )}
                            {/* Warning Details */}
                            <div>
                                <h4 className="font-bold text-red-600">{area.area_name}</h4>
                                <p className="text-sm text-red-700">
                                    {getActiveMessage(area.amount_visitors, area.thresholds)}
                                </p>
                            </div>
                        </div>
                    );
            })}
            {areaStatus.filter(area => getActiveMessage(area.amount_visitors, area.thresholds)).length === 0 && (
                <p className="text-sm text-gray-500">
                    {warningSearchTerm || !showEntrances || !showHalls
                        ? "Keine Warnungen gefunden mit den aktuellen Filtereinstellungen."
                        : "Keine Warnungen vorhanden."}
                </p>
            )}
        </>
    );
};

export default WarningList;