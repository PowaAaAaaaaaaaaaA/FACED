"use client";

import React, { useState } from "react";
import CardInfo from "./CardContentPages/CardInfo";
import FamilyMembers from "./CardContentPages/FamilyMembers";
import AssistanceRecord from "./CardContentPages/AssistanceRecord";
import { useFacedStore } from "@/app/store/useFacedStore";

type Tab = "card-info" | "family-members" | "assistance-record";

function CardContent() {
  const [activeTab, setActiveTab] = useState<Tab>("card-info");
  const selectedCard = useFacedStore((s) => s.selectedCard);

  

  console.log(selectedCard)

  const tabs: { id: Tab; label: string }[] = [
    { id: "card-info", label: "Card Info" },
    { id: "family-members", label: "Family Members" },
    { id: "assistance-record", label: "Assistance Record" },
  ];

  return (
    <div className="">
      {/* Header */}
      <div className="bg-[#0D1B4B] flex items-center h-[10%] rounded-t-[5px] p-5 justify-between">
        <div className="text-white">
          <h2 className="text-[0.9rem] font-semibold">
            {selectedCard?.full_name ?? "—"}
          </h2>
          <p className="text-[0.75rem] text-gray-300">
            Brgy. {selectedCard?.barangay} · {selectedCard?.municipality} ·{" "}
            {selectedCard?.family_member_count} member(s)
          </p>
        </div>
        <p className="text-[0.75rem] text-gray-300 text-right">
          Serial No.
          <br />
          {selectedCard?.serial_number ?? "—"}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b-2 border-gray-400">
        <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box">
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
      <div className="flex-1 overflow-auto">
        {activeTab === "card-info" && <CardInfo />}
        {activeTab === "family-members" && <FamilyMembers />}
        {activeTab === "assistance-record" && <AssistanceRecord />}
      </div>
    </div>
  );
}

export default CardContent;
