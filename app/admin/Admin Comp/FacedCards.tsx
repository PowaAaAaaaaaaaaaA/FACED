"use client";

import { useState, useEffect } from "react";
import { useFacedStore } from "@/app/store/useFacedStore";
import { authFetch } from "@/lib/auth-fetch";

interface Props {
  selectedProvince: string | null;
  searchQuery: string;
}

export default function FacedCardList({ selectedProvince, searchQuery }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cards = useFacedStore((s) => s.cards);
  const setCards = useFacedStore((s) => s.setCards);

  const filteredCards = cards
  .filter((card) => selectedProvince ? card.province === selectedProvince : true)
  .filter((card) => {
    const q = searchQuery.toLowerCase();
    return (
      card.full_name.toLowerCase().includes(q) ||
      card.serial_number.toLowerCase().includes(q) ||
      card.barangay.toLowerCase().includes(q) ||
      card.municipality.toLowerCase().includes(q)
    );
  });
  
  const selectedCard = useFacedStore((s) => s.selectedCard);
  const setSelectedCard = useFacedStore((s) => s.setSelectedCard);

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await authFetch("/api/card-content");
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setCards(data.cards);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [setCards]);

  if (loading) {
    return (
      <div className="w-full max-h-full overflow-auto flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton min-h-15 w-full"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full items-center justify-center p-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
        <p className="text-sm font-semibold">No respondents found</p>
        {selectedProvince && (
          <p className="text-xs">in {selectedProvince}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-1 lg:max-h-full lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
      {filteredCards.map((card) => (
        <div
          key={card.id}
          onClick={() => setSelectedCard(card)}
          className={`card card-border min-w-[260px] cursor-pointer transition-colors lg:min-w-0 ${
            selectedCard?.id === card.id
              ? "bg-blue-50 border-blue-400"
              : "bg-base-100 hover:bg-base-200"
          }`}
        >
          <div className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0">
              <h2 className="truncate text-[0.85rem] font-semibold sm:text-[0.9rem]">{card.full_name}</h2>
              <p className="line-clamp-2 text-[0.72rem] text-gray-500 sm:text-[0.75rem]">
                Brgy. {card.barangay} · {card.municipality} ·{" "}
                {card.family_member_count} member(s)
              </p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-[0.7rem] text-gray-400">Serial No.</p>
              <p className="text-[0.75rem] font-medium text-gray-800">
                {card.serial_number}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
