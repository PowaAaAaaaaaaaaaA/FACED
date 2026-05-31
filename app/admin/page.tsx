"use client";

import { useState } from "react";
import SegmentedButtons, { ActiveView } from "./Admin Comp/Toggle";
import FacedCardList from "./Admin Comp/FacedCards";
import PrintPanel from "./Admin Comp/PrintPanel";
import CardContent from "./Admin Comp/CardContent";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Syne } from "next/font/google";

const syne = Syne({ subsets: ["latin"] });

const PROVINCES = ["Bataan", "Bulacan", "Nueva Ecija", "Pampanga", "Tarlac", "Zambales", "Aurora"];

function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("cards");
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleProvinceClick = (province: string) => {
    setSelectedProvince((prev) => (prev === province ? null : province));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-base-200">
      <div className="w-full h-2 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400" />
      <div className="navbar bg-base-100 shadow-sm px-3 sm:px-4">
        <div className="min-w-0 flex-1">
          <a className="btn btn-ghost px-2 text-lg sm:text-xl font-bold" style={syne.style}>
            FACED System
          </a>
        </div>
        <div className="flex flex-none flex-wrap justify-end gap-2 items-center">
          <SegmentedButtons activeView={activeView} onChange={setActiveView} />
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-white gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 px-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <label className="input w-full md:flex-1">
          <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input
  type="search"
  placeholder="Search"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
        </label>
        
        <div className="md:shrink-0">
          <details className="dropdown dropdown-end w-full md:w-auto">
            <summary className="btn w-full md:w-auto">
              {selectedProvince ? `Filter: ${selectedProvince}` : "Filter"}
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-10 mt-1 w-52 p-2 shadow-sm">
              {PROVINCES.map((province) => (
                <li key={province}>
                  <button
                    onClick={() => handleProvinceClick(province)}
                    className={selectedProvince === province ? "active" : ""}
                  >
                    {province}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>

      <div className="flex flex-col p-3 sm:p-4 gap-4 min-h-0 lg:h-[calc(100vh-140px)] lg:flex-row">
        <div className="max-h-72 min-h-0 overflow-auto lg:max-h-none lg:w-[32%] xl:w-[30%]">
          <FacedCardList selectedProvince={selectedProvince} searchQuery={searchQuery} />
        </div>
        <div className="min-h-[60vh] flex-1 overflow-auto rounded-lg bg-white shadow lg:min-h-0">
          {activeView === "cards" ? <CardContent /> : <PrintPanel />}
        </div>
      </div>
    </div>
  );
}

export default Page;