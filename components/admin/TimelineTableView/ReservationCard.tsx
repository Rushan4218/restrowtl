import React, { useState } from "react";
import { Reservation, Order } from "@/types";
import { formatReservationDuration } from "@/lib/timelineUtils";
import { Button } from "@/components/ui/button";

interface ReservationCardProps {
  reservation: Reservation;
  order?: Order;
  isSelected: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onViewOrder: (event: React.MouseEvent) => void;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: (event: React.DragEvent) => void;
  style?: React.CSSProperties;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  order,
  isSelected,
  isDragging,
  isDropTarget,
  onViewOrder,
  onDragStart,
  onDragEnd,
  style,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const duration = formatReservationDuration(
    reservation.startTime,
    reservation.endTime
  );

  const isWalkIn = reservation.notes?.toLowerCase().includes("walk-in");
  const backgroundColor = isWalkIn ? "#FF9A56" : "#FFBC80";
  const hoverBackgroundColor = isWalkIn ? "#FF6B35" : "#FF9A56";

  return (
    <div
      data-reservation-card="true"
      draggable
      onClick={(e) => {
        if (!isDragging) {
          onViewOrder(e);
        }
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        relative h-12 rounded-lg overflow-hidden cursor-pointer
        transition-all duration-200 border-2
        ${isSelected ? "border-orange-600 shadow-lg" : "border-orange-300"}
        ${isDragging ? "opacity-40 scale-95 cursor-move" : "opacity-100 hover:shadow-md"}
        ${isDropTarget ? "ring-2 ring-green-500 ring-offset-2" : ""}
      `}
      style={{
        backgroundColor: isHovering && !isDragging ? hoverBackgroundColor : backgroundColor,
        ...style,
      }}
    >
      {/* Content */}
      <div className="h-full px-2 py-1 flex items-center justify-between gap-1 overflow-hidden">
        <span className="text-xs font-bold text-white truncate flex-shrink-0">
          {reservation.guestCount} person{reservation.guestCount > 1 ? "s" : ""}
        </span>
        
        {/* Status Badge - Visual indicator */}
        {isWalkIn && (
          <span className="text-xs font-semibold text-white bg-orange-700 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">
            Walk-in
          </span>
        )}
      </div>

      {/* Tooltip on hover */}
      {isHovering && !isDragging && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded shadow-lg px-2 py-1 whitespace-nowrap">
            <div className="font-semibold">{duration}</div>
            {order && (
              <div className="text-gray-300">
                {order.items.map((item) => item.productName).join(", ")}
              </div>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}

      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xs font-semibold">Moving...</div>
        </div>
      )}
    </div>
  );
};
