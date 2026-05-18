import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data: facedCards, error } = await supabaseAdmin.from("faced_cards")
      .select(`
        id,
        family_head_id,
        serial_number,
        evacuation_center_site,
        house_ownership,
        shelter_damage,
        is_4ps_beneficiary,
        is_indigenous_people,
        ip_ethnicity,
        date_registered,
        barangay_captain_name,
        lswdo_name,
        family_heads!inner (
          last_name,
          first_name,
          middle_name,
          name_extension,
          birthdate,
          birthplace,
          age,
          sex,
          civil_status,
          mothers_maiden_name,
          religion,
          occupation,
          monthly_family_net_income,
          id_card_presented,
          id_card_number,
          contact_primary,
          contact_alternate,
          permanent_address,
          account_info (
            payment_channel,
            bank_name,
            ewallet_name,
            other_bank_name,
            other_ewallet_name,
            account_name,
            account_type,
            account_number
          )
        ),
        psgc_barangays!inner (
          name,
          psgc_municipalities!inner (
            name,
            district,
            psgc_provinces!inner (
              name,
              psgc_regions!inner (
                name
              )
            )
          )
        ),
        family_members (
          id,
          full_name,
          relation_to_head,
          birthdate,
          sex,
          highest_educational_attainment,
          occupation,
          type_of_vulnerability
        )
      `);

    if (error) throw new Error(error.message);

    const cards = (facedCards ?? []).map((fc) => {
      const head = Array.isArray(fc.family_heads)
        ? fc.family_heads[0]
        : fc.family_heads;

      const account = Array.isArray(head?.account_info)
        ? head?.account_info[0]
        : head?.account_info;

      const barangay = Array.isArray(fc.psgc_barangays)
        ? fc.psgc_barangays[0]
        : fc.psgc_barangays;

      const municipality = Array.isArray(barangay?.psgc_municipalities)
        ? barangay?.psgc_municipalities[0]
        : barangay?.psgc_municipalities;

      const province = Array.isArray(municipality?.psgc_provinces)
        ? municipality?.psgc_provinces[0]
        : municipality?.psgc_provinces;

      const region = Array.isArray(province?.psgc_regions)
        ? province?.psgc_regions[0]
        : province?.psgc_regions;

      return {
        // Card identifiers
        id: fc.id,
        family_head_id: fc.family_head_id,
        serial_number: fc.serial_number,
        date_registered: fc.date_registered,
        barangay_captain_name: fc.barangay_captain_name,
        lswdo_name: fc.lswdo_name,
        evacuation_center_site: fc.evacuation_center_site,
        is_4ps_beneficiary: fc.is_4ps_beneficiary,
        is_indigenous_people: fc.is_indigenous_people,
        ip_ethnicity: fc.ip_ethnicity,

        // Location
        region: region?.name ?? "",
        province: province?.name ?? "",
        municipality: municipality?.name ?? "",
        district: municipality?.district ?? "",
        barangay: barangay?.name ?? "",

        // Head of family - display name
        full_name: [head?.last_name, head?.first_name, head?.middle_name]
          .filter(Boolean)
          .join(", ")
          .toUpperCase(),

        // Head of family - full details
        last_name: head?.last_name ?? "",
        first_name: head?.first_name ?? "",
        middle_name: head?.middle_name ?? "",
        name_extension: head?.name_extension ?? "",
        birthdate: head?.birthdate ?? "",
        birthplace: head?.birthplace ?? "",
        age: head?.age ?? null,
        sex: head?.sex ?? "",
        civil_status: head?.civil_status ?? "",
        mothers_maiden_name: head?.mothers_maiden_name ?? "",
        religion: head?.religion ?? "",
        occupation: head?.occupation ?? "",
        monthly_family_net_income: head?.monthly_family_net_income ?? null,
        id_card_presented: head?.id_card_presented ?? "",
        id_card_number: head?.id_card_number ?? "",
        contact_primary: head?.contact_primary ?? "",
        contact_alternate: head?.contact_alternate ?? "",
        permanent_address: head?.permanent_address ?? "",
        house_ownership: fc.house_ownership ?? "",
        shelter_damage: fc.shelter_damage ?? "",

        // Account info
        payment_channel: account?.payment_channel ?? "",
        bank_name: account?.bank_name ?? "",
        ewallet_name: account?.ewallet_name ?? "",
        other_bank_name: account?.other_bank_name ?? "",
        other_ewallet_name: account?.other_ewallet_name ?? "",
        account_name: account?.account_name ?? "",
        account_type: account?.account_type ?? "",
        account_number: account?.account_number ?? "",

        // Family members
        family_member_count: fc.family_members?.length ?? 0,
        family_members: fc.family_members ?? [],
      };
    });

    return NextResponse.json({ success: true, cards });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}