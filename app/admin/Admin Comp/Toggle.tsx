"use client";

import React from "react";

export type ActiveView = "cards" | "print";

interface SegmentedButtonsProps {
  activeView: ActiveView;
  onChange: (view: ActiveView) => void;
}

function SegmentedButtons({ activeView, onChange }: SegmentedButtonsProps) {
  return (
    <div className="join bg-gray-200 rounded-2xl gap-2">
      <input
        className="join-item btn rounded-2xl"
        type="radio"
        name="options"
        aria-label="Card Records"
        checked={activeView === "cards"}
        onChange={() => onChange("cards")}
      />
      <input
        className="join-item btn rounded-2xl"
        type="radio"
        name="options"
        aria-label="Print to PDF"
        checked={activeView === "print"}
        onChange={() => onChange("print")}
      />
    </div>
  );
}

export default SegmentedButtons;
