"use client";

export type ActiveView = "cards" | "print";

interface SegmentedButtonsProps {
  activeView: ActiveView;
  onChange: (view: ActiveView) => void;
}

function SegmentedButtons({ activeView, onChange }: SegmentedButtonsProps) {
  return (
    <div className="join rounded-2xl bg-gray-200">
      <input
        className="join-item btn btn-xs rounded-2xl sm:btn-sm"
        type="radio"
        name="options"
        aria-label="Card Records"
        checked={activeView === "cards"}
        onChange={() => onChange("cards")}
      />
      <input
        className="join-item btn btn-xs rounded-2xl sm:btn-sm"
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
