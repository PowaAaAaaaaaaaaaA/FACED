import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export type AssistanceRecordInput = {
  id?: string; // present for existing records
  faced_card_id: string;
  assistance_date: string;
  receiving_family_member: string;
  emergency_disaster_type: string;
  assistance_type: string;
  unit: string;
  quantity: number | null;
  cost: number | null;
  provider: string;
  recorded_by: string;
};

const normalize = (dateStr: string) => {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  return dateStr;
};


// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const faced_card_id = searchParams.get("faced_card_id");

  if (!faced_card_id) {
    return NextResponse.json({ error: "faced_card_id required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("assistance_records")
    .select("*")
    .eq("faced_card_id", faced_card_id)
    .order("assistance_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ records: data ?? [] });
}

// ─── POST ────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body: AssistanceRecordInput[] = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { success: false, error: "No records provided." },
        { status: 400 }
      );
    }

    const existing = body.filter((r) => r.id);
    const incoming = body.filter((r) => !r.id);

    // ── Update existing rows one by one (never inserts, 100% safe) ────────
    for (const record of existing) {
      const { error } = await supabaseAdmin
        .from("assistance_records")
        .update({
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
        })
        .eq("id", record.id!); // match on the exact row — can never create a duplicate

      if (error) throw new Error(error.message);
    }

    // ── Insert new rows only ──────────────────────────────────────────────
    if (incoming.length > 0) {
      const { data: counter, error: counterError } = await supabaseAdmin
        .from("id_counters")
        .select("last_value")
        .eq("table_name", "assistance_records")
        .single();

      if (counterError) throw new Error(counterError.message);

      const startValue = (counter?.last_value ?? 0) + 1;

      const newRows = incoming.map((record, index) => ({
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

      const { error: insertError } = await supabaseAdmin
        .from("assistance_records")
        .insert(newRows);

      if (insertError) throw new Error(insertError.message);

      await supabaseAdmin
        .from("id_counters")
        .update({ last_value: startValue + incoming.length - 1 })
        .eq("table_name", "assistance_records");
    }

    return NextResponse.json({
      success: true,
      inserted: incoming.length,
      updated: existing.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("assistance_records")
      .delete()
      .eq("id", id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}