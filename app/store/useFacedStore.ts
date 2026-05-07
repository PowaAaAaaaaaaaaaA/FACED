import { create } from "zustand";

export type FacedCard = {
  id: string;
  serial_number: string;
  full_name: string;
  barangay: string;
  municipality: string;
  family_member_count: number;
  contact_primary: string;
};

interface FacedStore {
  selectedCard: FacedCard | null;
  setSelectedCard: (card: FacedCard) => void;
}

export const useFacedStore = create<FacedStore>((set) => ({
  selectedCard: null,
  setSelectedCard: (card) => set({ selectedCard: card }),
}));