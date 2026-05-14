import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export type AssistanceRecordInput = {
  faced_card_id: string;
  assistance_date: string; // dd/mm/yyyy from the date input
  receiving_family_member: string;
  emergency_disaster_type: string;
  assistance_type: string;
  unit: string;
  quantity: number | null;
  cost: number | null;
  provider: string;
  recorded_by: string; // uuid of the logged-in admin
};

export async function POST(req: Request) {
  try {
    const body: AssistanceRecordInput[] = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { success: false, error: "No records provided." },
        { status: 400 },
      );
    }

    // Normalize date from dd/mm/yyyy → yyyy-mm-dd (Postgres expects ISO)
const normalize = (dateStr: string) => {
  if (!dateStr) return new Date().toISOString().split("T")[0]; // fallback to today
  return dateStr; // already yyyy-mm-dd from type="date"
};
    // Generate IDs using your id_counters pattern
    const { data: counter, error: counterError } = await supabaseAdmin
      .from("id_counters")
      .select("last_value")
      .eq("table_name", "assistance_records")
      .single();

    if (counterError) throw new Error(counterError.message);

    const startValue = (counter?.last_value ?? 0) + 1;

    const records = body.map((record, index) => ({
      id: `AR-${String(startValue + index).padStart(6, "0")}`,
      faced_card_id: record.faced_card_id,
      assistance_date: normalize(record.assistance_date),
      receiving_family_member: record.receiving_family_member || null,
      emergency_disaster_type: record.emergency_disaster_type || null,
      assistance_type: record.assistance_type,
      unit: record.unit || null,
      quantity: record.quantity ?? null,
      cost: record.cost ?? null,
      provider: record.provider || null,
      recorded_by: record.recorded_by,
    }));

    // Insert all rows
    const { error: insertError } = await supabaseAdmin
      .from("assistance_records")
      .insert(records);

    if (insertError) throw new Error(insertError.message);

    // Update the counter
    await supabaseAdmin
      .from("id_counters")
      .update({ last_value: startValue + body.length - 1 })
      .eq("table_name", "assistance_records");

    return NextResponse.json({ success: true, inserted: records.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
