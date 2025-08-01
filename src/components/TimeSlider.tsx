import React from "react";

interface TimeSliderProps {
  timeFilter: number;
  setTimeFilter: (value: number) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ timeFilter, setTimeFilter }) => {
  return (
    <div>
      <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700">
        Zeitbereich (vor 24 Stunden bis jetzt)
      </label>
      {/* time range selector */}
      <input
        id="timeRange"
        type="range"
        min="0"
        max="1440"
        step="10"
        onChange={(e) => {
          const minutesAgo = 1440 - parseInt(e.target.value, 10); // Convert to minutes ago
          setTimeFilter(minutesAgo); // Update the time filter in parent component
        }}
        defaultValue={1440}
        className="w-full mt-2"
        style={{ appearance: "none", height: "4px", background: "#ddd", borderRadius: "2px" }}
      />
      <div className="flex justify-between text-sm text-gray-500 mt-1">
        <span>Vor 24 Stunden</span>
        <span>
        {/* Format the time based on the selected filter */}
          {new Date(Date.now() - timeFilter * 60000).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          Uhr
        </span>
        <span>Jetzt</span>
      </div>
    </div>
  );
};

export default TimeSlider;