import React, { useState, useEffect } from "react";
import {
  TIMELINE_START_HOUR,
  TIMELINE_END_HOUR,
  formatHourToTime,
  getCurrentTimePosition,
  isCurrentTimeInTimeline,
  GRIDS_PER_HOUR,
} from "@/lib/timelineUtils";

interface TimelineHeaderProps {
  columnWidth: number; // Width of each hour column in pixels
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  columnWidth,
}) => {
  const [mounted, setMounted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [showTimeLine, setShowTimeLine] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateTimeIndicator = () => {
      setCurrentPosition(getCurrentTimePosition());
      setShowTimeLine(isCurrentTimeInTimeline());
    };
    
    updateTimeIndicator();
    
    // Update current position every minute
    const interval = setInterval(updateTimeIndicator, 60000);

    return () => clearInterval(interval);
  }, []);

  const hours = Array.from(
    { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR },
    (_, i) => TIMELINE_START_HOUR + i
  );

  return (
    <div className="flex bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-700 relative">
      {/* Sticky corner for table names */}
      <div
        className="sticky left-0 z-50 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-700"
        style={{ width: "200px", minWidth: "200px", flexShrink: 0 }}
      />

      {/* Time headers - Full width with proper sizing */}
      <div className="flex relative">
        {hours.map((hour) => (
          <div
            key={hour}
            className="relative flex-shrink-0 text-center font-semibold text-sm text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-slate-600 py-3"
            style={{ width: columnWidth, minWidth: columnWidth }}
          >
            {formatHourToTime(hour)}

            {/* 15-minute markers inside the header (visual only) */}
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none">
              {Array.from({ length: GRIDS_PER_HOUR - 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-r border-dashed border-gray-200 dark:border-slate-800"
                  style={{ left: `${((i + 1) / GRIDS_PER_HOUR) * 100}%` }}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Current time indicator line - Only render on client after mount to prevent hydration mismatch */}
        {mounted && showTimeLine && (
          <div
            suppressHydrationWarning
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
            style={{
              left: `calc(200px + ${(currentPosition / 100) * (hours.length * columnWidth)}px)`,
              opacity: 0.6,
              zIndex: 5,
            }}
          />
        )}
      </div>
    </div>
  );
};
