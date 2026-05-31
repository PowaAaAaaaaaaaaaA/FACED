import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/require-admin";

type FamilyMemberInput = {
  id?: string;
  faced_card_id: string;
  full_name: string;
  relation_to_head: string | null;
  birthdate: string | null;
  age: number | null;
  sex: string | null;
  highest_educational_attainment: string | null;
  occupation: string | null;
  type_of_vulnerability: string | null;
};

const toDbRow = (member: FamilyMemberInput) => ({
  faced_card_id: member.faced_card_id,
  full_name: member.full_name,
  relation_to_head: member.relation_to_head || null,
  birthdate: member.birthdate || null,
  age: member.age ?? null,
  sex: member.sex || null,
  highest_educational_attainment:
    member.highest_educational_attainment || null,
  occupation: member.occupation || null,
  type_of_vulnerability: member.type_of_vulnerability || null,
});

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireAdmin(req);
    if (response) return response;
    
    const body: FamilyMemberInput[] = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Family members must be an array." },
        { status: 400 }
      );
    }

    const existing = body.filter((member) => member.id);
    const incoming = body.filter((member) => !member.id);

    for (const member of existing) {
      const { error } = await supabaseAdmin
        .from("family_members")
        .update(toDbRow(member))
        .eq("id", member.id!);

      if (error) throw new Error(`family_members update: ${error.message}`);
    }

    if (incoming.length > 0) {
      const { error } = await supabaseAdmin
        .from("family_members")
        .insert(incoming.map(toDbRow));

      if (error) throw new Error(`family_members insert: ${error.message}`);
    }

    const facedCardId = body[0]?.faced_card_id;
    const { data: familyMembers, error: fetchError } = facedCardId
      ? await supabaseAdmin
          .from("family_members")
          .select(
            "id, full_name, relation_to_head, birthdate, age, sex, highest_educational_attainment, occupation, type_of_vulnerability"
          )
          .eq("faced_card_id", facedCardId)
      : { data: [], error: null };

    if (fetchError) throw new Error(`family_members fetch: ${fetchError.message}`);

    return NextResponse.json({
      success: true,
      family_members: familyMembers ?? [],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { response } = await requireAdmin(req);
    if (response) return response;

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("family_members")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}