import React from "react";
import SegmentedButtons from "./Admin Comp/Toggle";
import FacedCardList from "./Admin Comp/FacedCards";

function page() {
  return (
    <div className="h-[100vh]">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">FACED System</a>
        </div>
        <div className="flex-none">
<SegmentedButtons/>
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
              <li>
                <a>Item 1</a>
              </li>
              <li>
                <a>Item 2</a>
              </li>
            </ul>
          </details>

          <button className="btn btn-soft btn-success">+ New Card</button>
        </div>
      </div>
      <div className=" flex h-[80%] p-4 gap-4">
        <div className="w-[40%] max-h-full overflow-auto flex flex-col gap-2">
 <FacedCardList />
        </div>

        <div className="w-[60%] bg-white">
          <div className="bg-[#0D1B4B] h-[15%] w-full rounded-t-[10px] flex items-center px-5 justify-between">
            <h2 className="text-white">PRINT PREVIEW</h2>
            <button className="btn btn-primary">Primary</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
