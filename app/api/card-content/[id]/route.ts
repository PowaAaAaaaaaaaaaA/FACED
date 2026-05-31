import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: NextRequest) {
  try {
    const { response } = await requireAdmin(req);
    if (response) return response;

    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Card id required" },
        { status: 400 }
      );
    }

    const cardFields: Record<string, unknown> = {};
    const cardKeys = [
      "evacuation_center_site",
      "house_ownership",
      "shelter_damage",
      "is_4ps_beneficiary",
      "is_indigenous_people",
      "ip_ethnicity",
      "date_registered",
      "barangay_captain_name",
      "lswdo_name",
    ];

    for (const key of cardKeys) {
      if (key in fields) cardFields[key] = fields[key];
    }

    if (Object.keys(cardFields).length > 0) {
      const { error } = await supabaseAdmin
        .from("faced_cards")
        .update(cardFields)
        .eq("id", id);

      if (error) throw new Error(`faced_cards: ${error.message}`);
    }

    const headFields: Record<string, unknown> = {};
    const headKeys = [
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
    ];

    for (const key of headKeys) {
      if (key in fields) headFields[key] = fields[key];
    }

    if (Object.keys(headFields).length > 0) {
      if (!fields.family_head_id) {
        return NextResponse.json(
          { success: false, error: "Family head id required" },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("family_heads")
        .update(headFields)
        .eq("id", fields.family_head_id);

      if (error) throw new Error(`family_heads: ${error.message}`);
    }

    const accountFields: Record<string, unknown> = {};
    const accountKeys = [
      "payment_channel",
      "bank_name",
      "ewallet_name",
      "other_bank_name",
      "other_ewallet_name",
      "account_name",
      "account_type",
      "account_number",
    ];

    for (const key of accountKeys) {
      if (key in fields) accountFields[key] = fields[key];
    }

    if (Object.keys(accountFields).length > 0) {
      if (!fields.family_head_id) {
        return NextResponse.json(
          { success: false, error: "Family head id required" },
          { status: 400 }
        );
      }

      const { data: head, error: headErr } = await supabaseAdmin
        .from("family_heads")
        .select("account_id")
        .eq("id", fields.family_head_id)
        .single();

      if (headErr) throw new Error(`family_heads lookup: ${headErr.message}`);
      if (!head?.account_id) {
        throw new Error("family_heads lookup: account_id missing");
      }

      const { error } = await supabaseAdmin
        .from("account_info")
        .update(accountFields)
        .eq("id", head.account_id);

      if (error) throw new Error(`account_info: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}