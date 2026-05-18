import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const fields = await req.json();

    const { id } = await params; // ✅ THIS IS THE FIX

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing ID" },
        { status: 400 }
      );
    }

    // ── 1. faced_cards ─────────────────────────────
    const cardFields: Record<string, unknown> = {};
    for (const key of [
      "evacuation_center_site",
      "house_ownership",
      "shelter_damage",
      "is_4ps_beneficiary",
      "is_indigenous_people",
      "ip_ethnicity",
      "date_registered",
      "barangay_captain_name",
      "lswdo_name",
    ]) {
      if (key in fields) {
        cardFields[key] = fields[key];
      }
    }

    if (Object.keys(cardFields).length > 0) {
      const { error } = await supabaseAdmin
        .from("faced_cards")
        .update(cardFields)
        .eq("id", id);

      if (error) throw new Error(`faced_cards: ${error.message}`);
    }

    // ── 2. family_heads ─────────────────────────────
    const headFields: Record<string, unknown> = {};
    for (const key of [
      "last_name",
      "first_name",
      "middle_name",
      "name_extension",
      "birthdate",
      "birthplace",
      "age",
      "sex",
      "civil_status",
      "mothers_maiden_name",
      "religion",
      "occupation",
      "monthly_family_net_income",
      "id_card_presented",
      "id_card_number",
      "contact_primary",
      "contact_alternate",
      "permanent_address",
    ]) {
      if (key in fields) {
        headFields[key] = fields[key];
      }
    }

    if (Object.keys(headFields).length > 0) {
      const { error } = await supabaseAdmin
        .from("family_heads")
        .update(headFields)
        .eq("id", fields.family_head_id);

      if (error) throw new Error(`family_heads: ${error.message}`);
    }

    // ── 3. account_info ────────────────────────────
    const accountFields: Record<string, unknown> = {};
    for (const key of [
      "payment_channel",
      "bank_name",
      "ewallet_name",
      "other_bank_name",
      "other_ewallet_name",
      "account_name",
      "account_type",
      "account_number",
    ]) {
      if (key in fields) {
        accountFields[key] = fields[key];
      }
    }

    if (Object.keys(accountFields).length > 0) {
      const { data: head, error: headErr } = await supabaseAdmin
        .from("family_heads")
        .select("id")
        .eq("id", fields.family_head_id)
        .single();

      if (headErr) throw new Error(`family_heads lookup: ${headErr.message}`);

      const { error } = await supabaseAdmin
        .from("account_info")
        .update(accountFields)
        .eq("family_head_id", head.id);

      if (error) throw new Error(`account_info: ${error.message}`);
    }

    // ── 4. Re-fetch updated card ───────────────────
    const { data: facedCard, error: fetchError } = await supabaseAdmin
      .from("faced_cards")
      .select(`*`)
      .eq("id", id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    return NextResponse.json({
      success: true,
      ...facedCard,
    });

  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}