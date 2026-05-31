import { create } from "zustand";

export type FamilyMember = {
  id: string;
  full_name: string;
  relation_to_head: string;
  birthdate: string;
  age: number | null;
  sex: string;
  highest_educational_attainment: string;
  occupation: string;
  type_of_vulnerability: string;
};

export type FacedCard = {
  // Card identifiers
  id: string;
  family_head_id: string;
  serial_number: string;
  date_registered: string;
  barangay_captain_name: string;
  lswdo_name: string;
  evacuation_center_site: string;
  is_4ps_beneficiary: boolean;
  is_indigenous_people: boolean;
  ip_ethnicity: string;

  // Location
  region: string;
  province: string;
  municipality: string;
  district: string;
  barangay: string;

  // Head of family
  full_name: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  name_extension: string;
  birthdate: string;
  birthplace: string;
  age: number | null;
  sex: string;
  civil_status: string;
  mothers_maiden_name: string;
  religion: string;
  occupation: string;
  monthly_family_net_income: number | null;
  id_card_presented: string;
  id_card_number: string;
  contact_primary: string;
  contact_alternate: string;
  permanent_address: string;
  house_ownership: string;
  shelter_damage: string;

  // Account info
  payment_channel: string;
  bank_name: string;
  ewallet_name: string;
  other_bank_name: string;
  other_ewallet_name: string;
  account_name: string;
  account_type: string;
  account_number: string;

  // Family members
  family_member_count: number;
  family_members: FamilyMember[];
};

interface FacedStore {
  cards: FacedCard[];
  selectedCard: FacedCard | null;
  setCards: (cards: FacedCard[]) => void;
  setSelectedCard: (card: FacedCard) => void;
  updateSelectedCard: (updates: Partial<FacedCard>) => void;
  updateSelectedCardFamilyMembers: (familyMembers: FamilyMember[]) => void;
}

export const useFacedStore = create<FacedStore>((set) => ({
  cards: [],
  selectedCard: null,
  setCards: (cards) => set({ cards }),
  setSelectedCard: (card) => set({ selectedCard: card }),
  updateSelectedCard: (updates) =>
    set((state) => {
      if (!state.selectedCard) return state;

      const updatedCard = {
        ...state.selectedCard,
        ...updates,
      };

      updatedCard.full_name = [
        updatedCard.last_name,
        updatedCard.first_name,
        updatedCard.middle_name,
      ]
        .filter(Boolean)
        .join(", ")
        .toUpperCase();

      return {
        selectedCard: updatedCard,
        cards: state.cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        ),
      };
    }),
    updateSelectedCardFamilyMembers: (familyMembers) =>
    set((state) => {
      if (!state.selectedCard) return state;

      const updatedCard = {
        ...state.selectedCard,
        family_member_count: familyMembers.length,
        family_members: familyMembers,
      };

      return {
        selectedCard: updatedCard,
        cards: state.cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        ),
      };
    }),
}));