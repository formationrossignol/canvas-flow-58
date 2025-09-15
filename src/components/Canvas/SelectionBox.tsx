import React from "react";

interface SelectionBoxProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isActive: boolean;
}

export const SelectionBox = ({ startX, startY, endX, endY, isActive }: SelectionBoxProps) => {
  if (!isActive) return null;

  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  return (
    <div
      className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
      style={{
        left,
        top,
        width,
        height,
        borderStyle: 'dashed',
        borderRadius: '4px',
      }}
    />
  );
};