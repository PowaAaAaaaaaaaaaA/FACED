"use client";

import { useState } from "react";
import CardInfo from "./CardContentPages/CardInfo";
import FamilyMembers from "./CardContentPages/FamilyMembers";
import AssistanceRecord from "./CardContentPages/AssistanceRecord";
import { useFacedStore } from "@/app/store/useFacedStore";

type Tab = "card-info" | "family-members" | "assistance-record";

function CardContent() {
  const [activeTab, setActiveTab] = useState<Tab>("card-info");
  const selectedCard = useFacedStore((s) => s.selectedCard);

  const tabs: { id: Tab; label: string }[] = [
    { id: "card-info", label: "Card Info" },
    { id: "family-members", label: "Family Members" },
    { id: "assistance-record", label: "Assistance Record" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-2 rounded-t-[5px] bg-[#0D1B4B] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 text-white">
          <h2 className="truncate text-[0.9rem] font-semibold">
            {selectedCard?.full_name ?? "—"}
          </h2>
          <p className="text-[0.75rem] text-gray-300">
            Brgy. {selectedCard?.barangay} · {selectedCard?.municipality} ·{" "}
            {selectedCard?.family_member_count} member(s)
          </p>
        </div>
        <p className="shrink-0 text-left text-[0.75rem] text-gray-300 sm:text-right">
          Serial No.
          <br />
          {selectedCard?.serial_number ?? "—"}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="shrink-0 border-b-2 border-gray-300">
        <ul className="menu menu-horizontal flex-nowrap overflow-x-auto bg-base-200">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <a
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? "active" : ""}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="min-h-0 flex-1 overflow-auto">
        {activeTab === "card-info" && <CardInfo />}
        {activeTab === "family-members" && <FamilyMembers />}
        {activeTab === "assistance-record" && <AssistanceRecord />}
      </div>
    </div>
  );
}

export default CardContent;
