"use client";

import React, { useState } from "react";
import SegmentedButtons, { ActiveView } from "./Admin Comp/Toggle";
import FacedCardList from "./Admin Comp/FacedCards";
import PrintPanel from "./Admin Comp/PrintPanel";
import CardContent from "./Admin Comp/CardContent";
import { Car } from "lucide-react";

function Page() {
  const [activeView, setActiveView] = useState<ActiveView>("cards");

  return (
    <div className="overflow-hidden">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">FACED System</a>
        </div>
        <div className="flex-none">
          <SegmentedButtons activeView={activeView} onChange={setActiveView} />
        </div>
      </div>

      <div className="mt-5 flex px-5 items-center justify-between">
        <label className="input w-[75%]">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input type="search" required placeholder="Search" />
        </label>
        <div>
          <details className="dropdown">
            <summary className="btn m-1">Filter</summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
            </ul>
          </details>
          <button className="btn btn-soft btn-success">+ New Card</button>
        </div>
      </div>

      <div className="flex p-4 gap-4">
        <div className="w-[40%] max-h-full overflow-auto flex flex-col gap-2">
          <FacedCardList />
        </div>

        <div className="w-[60%] bg-white">
            {activeView === "cards" ? (
              <>
                <CardContent/>
              </>
            ) : (
              <>
                <PrintPanel/>
              </>
            )}
          {/* Next step: panel content goes here */}
        </div>
      </div>
    </div>
  );
}

export default Page;
