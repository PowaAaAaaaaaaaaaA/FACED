import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { accountInfo, familyHead, facedCard, familyMembers } = await req.json()

    const { data: accountData, error: accountError } = await supabaseAdmin
      .from('account_info').insert(accountInfo).select('id').single()
    if (accountError) throw new Error(`account_info: ${accountError.message}`)

    const { data: headData, error: headError } = await supabaseAdmin
      .from('family_heads').insert({ ...familyHead, account_id: accountData.id }).select('id').single()
    if (headError) throw new Error(`family_heads: ${headError.message}`)

    const { data: cardData, error: cardError } = await supabaseAdmin
      .from('faced_cards').insert({ ...facedCard, family_head_id: headData.id }).select('id, serial_number').single()
    if (cardError) throw new Error(`faced_cards: ${cardError.message}`)

    if (familyMembers.length > 0) {
      const { error: membersError } = await supabaseAdmin
        .from('family_members').insert(familyMembers.map((m: Record<string, unknown>) => ({ ...m, faced_card_id: cardData.id })))
      if (membersError) throw new Error(`family_members: ${membersError.message}`)
    }

    return NextResponse.json({ success: true, serial_number: cardData.serial_number })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}