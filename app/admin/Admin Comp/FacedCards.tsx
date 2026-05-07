"use client";

import { useState, useEffect } from "react";
import { useFacedStore, FacedCard } from "@/app/store/useFacedStore";

export default function FacedCardList() {
  const [cards, setCards] = useState<FacedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedCard = useFacedStore((s) => s.selectedCard);
  const setSelectedCard = useFacedStore((s) => s.setSelectedCard);

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch("/api/faced-cards");
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
  }, []);

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
      <div className="w-[40%] flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-h-full overflow-auto flex flex-col gap-2">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => setSelectedCard(card)}
          className={`card card-border cursor-pointer transition-colors ${
            selectedCard?.id === card.id
              ? "bg-blue-50 border-blue-400"
              : "bg-base-100 hover:bg-base-200"
          }`}
        >
          <div className="flex justify-between p-3 items-center">
            <div>
              <h2 className="text-[0.9rem] font-semibold">{card.full_name}</h2>
              <p className="text-[0.75rem] text-gray-500">
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
