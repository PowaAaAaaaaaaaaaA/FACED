import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data: facedCards, error } = await supabaseAdmin.from("faced_cards")
      .select(`
        id,
        serial_number,
        family_heads!inner (
          last_name,
          first_name,
          middle_name,
          contact_primary
        ),
        psgc_barangays!inner (
          name,
          psgc_municipalities!inner (
            name
          )
        ),
        family_members (
          id
        )
      `);

    if (error) throw new Error(error.message);

    const cards = (facedCards ?? []).map((fc) => {
      const head = Array.isArray(fc.family_heads)
        ? fc.family_heads[0]
        : fc.family_heads;

      const barangay = Array.isArray(fc.psgc_barangays)
        ? fc.psgc_barangays[0]
        : fc.psgc_barangays;

      const municipality = Array.isArray(barangay?.psgc_municipalities)
        ? barangay?.psgc_municipalities[0]
        : barangay?.psgc_municipalities;

      return {
        id: fc.id,
        serial_number: fc.serial_number,
        full_name: [head?.last_name, head?.first_name, head?.middle_name]
          .filter(Boolean)
          .join(", ")
          .toUpperCase(),
        barangay: barangay?.name ?? "",
        municipality: municipality?.name ?? "",
        family_member_count: fc.family_members?.length ?? 0,
        contact_primary: head?.contact_primary ?? "",
      };
    });

    return NextResponse.json({ success: true, cards });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}