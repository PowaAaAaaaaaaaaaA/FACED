'use client'
import React, { useState, useEffect } from 'react'
import { useFacedStore, FacedCard } from '@/app/store/useFacedStore'
import { BiErrorCircle } from 'react-icons/bi'
import { Pencil, X, Save, Loader2 } from 'lucide-react'

function ViewField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-gray-500 text-[0.7rem] font-bold">{label}</p>
      <p className="text-[0.8rem] text-[#0D1B4B] font-bold">{value ?? '—'}</p>
    </div>
  )
}

function EditField({
  label, name, value, onChange, type = 'text',
}: {
  label: string
  name: string
  value: string | number | null | undefined
  onChange: (name: string, value: string) => void
  type?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-gray-500 text-[0.7rem] font-bold">{label}</label>
      <input
        type={type}
        className="input input-primary input-xs w-full"
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  )
}

function EditSelect({
  label, name, value, options, onChange,
}: {
  label: string
  name: string
  value: string | null | undefined
  options: string[]
  onChange: (name: string, value: string) => void
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-gray-500 text-[0.7rem] font-bold">{label}</label>
      <select
        className="select select-primary select-xs w-full"
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
      >
        <option disabled value="">--Select--</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function SectionHeader({ label, widthClass = 'w-[15%]' }: { label: string; widthClass?: string }) {
  return (
    <h2 className={`rounded-2xl ${widthClass} p-1 text-center font-bold text-[#0F2F9A] bg-[#D5EDFF] text-[0.9rem]`}>
      {label}
    </h2>
  )
}

const SEX_OPTIONS = ['male', 'female']
const CIVIL_STATUS_OPTIONS = ['single', 'married', 'widowed', 'separated', 'annulled', 'live_in']
const HOUSE_OWNERSHIP_OPTIONS = ['owner', 'renter', 'sharer']
const SHELTER_DAMAGE_OPTIONS = ['partially_damaged', 'totally_damaged']
const PAYMENT_CHANNEL_OPTIONS = ['bank', 'e_wallet']
const ACCOUNT_TYPE_OPTIONS = ['savings', 'current', 'e_wallet']
const BANK_OPTIONS = ['landbank', 'dbp', 'bdo', 'bpi', 'metrobank', 'pnb', 'unionbank', 'rcbc', 'other_bank']
const EWALLET_OPTIONS = ['gcash', 'maya', 'shopeepay', 'seabank', 'other_ewallet']

function CardInfo() {
  const selectedCard = useFacedStore((s) => s.selectedCard)
  const setSelectedCard = useFacedStore((s) => s.setSelectedCard)

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<FacedCard | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    setDraft(selectedCard ? { ...selectedCard } : null)
    setIsEditing(false)
    setSaveError('')
  }, [selectedCard])

  if (!selectedCard || !draft) {
    return (
      <div className="h-full w-full p-2 flex justify-center items-center mt-10 gap-5 text-2xl text-gray-400">
        <BiErrorCircle />
        <h1>Please Select a FACED Card to view the details</h1>
      </div>
    )
  }

  const update = (name: string, value: string) => {
    setDraft((prev) => prev ? { ...prev, [name]: value } : prev)
  }

  const handleEdit = () => {
    setDraft({ ...selectedCard })
    setSaveError('')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft({ ...selectedCard })
    setSaveError('')
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!draft) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const res = await fetch(`/api/card-content/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      const text = await res.text();

      console.log("RAW RESPONSE:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return JSON");
      }

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to save");
      }

      setSelectedCard(data);
      setIsEditing(false);

    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full p-2 overflow-auto">

      <div className="flex justify-end gap-2 mb-3">
        {!isEditing ? (
          <button disabled className="btn btn-sm btn-outline btn-primary gap-1" onClick={handleEdit}>
            <Pencil size={13} /> Edit
          </button>
        ) : (
          <>
            <button className="btn btn-sm btn-ghost text-gray-500 gap-1" onClick={handleCancel} disabled={isSaving}>
              <X size={13} /> Cancel
            </button>
            <button className="btn btn-sm btn-primary gap-1" onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
                : <><Save size={13} /> Save Changes</>}
            </button>
          </>
        )}
      </div>

      {saveError && (
        <p className="text-xs text-red-500 text-right mb-2">{saveError}</p>
      )}

      <div>
        <SectionHeader label="LOCATION" widthClass="w-[15%]" />
        <div className="grid grid-cols-3 p-1 w-full mt-2 gap-y-3">
          {isEditing ? (
            <>
              <EditField label="REGION"            name="region"                 value={draft.region}                 onChange={update} />
              <EditField label="PROVINCE"          name="province"               value={draft.province}               onChange={update} />
              <EditField label="CITY / MUNICIPALITY" name="municipality"         value={draft.municipality}           onChange={update} />
              <EditField label="DISTRICT"          name="district"               value={draft.district}               onChange={update} />
              <EditField label="BARANGAY"          name="barangay"               value={draft.barangay}               onChange={update} />
              <EditField label="EVACUATION CENTER" name="evacuation_center_site" value={draft.evacuation_center_site} onChange={update} />
            </>
          ) : (
            <>
              <ViewField label="REGION"            value={selectedCard.region} />
              <ViewField label="PROVINCE"          value={selectedCard.province} />
              <ViewField label="CITY / MUNICIPALITY" value={selectedCard.municipality} />
              <ViewField label="DISTRICT"          value={selectedCard.district} />
              <ViewField label="BARANGAY"          value={selectedCard.barangay} />
              <ViewField label="EVACUATION CENTER" value={selectedCard.evacuation_center_site} />
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <SectionHeader label="HEAD OF FAMILY" widthClass="w-[24%]" />
        <div className="grid grid-cols-4 p-1 w-full mt-2 gap-y-3">
          {isEditing ? (
            <>
              <EditField label="LAST NAME"   name="last_name"   value={draft.last_name}   onChange={update} />
              <EditField label="FIRST NAME"  name="first_name"  value={draft.first_name}  onChange={update} />
              <EditField label="MIDDLE NAME" name="middle_name" value={draft.middle_name} onChange={update} />
              <EditField label="BIRTHDATE"   name="birthdate"   value={draft.birthdate}   onChange={update} type="date" />
              <EditField label="AGE"         name="age"         value={draft.age}         onChange={update} type="number" />
              <EditSelect label="SEX"          name="sex"          value={draft.sex}          options={SEX_OPTIONS}          onChange={update} />
              <EditSelect label="CIVIL STATUS" name="civil_status" value={draft.civil_status} options={CIVIL_STATUS_OPTIONS} onChange={update} />
              <EditField label="RELIGION"    name="religion"    value={draft.religion}    onChange={update} />
              <EditField label="OCCUPATION"  name="occupation"  value={draft.occupation}  onChange={update} />
              <EditField label="MONTHLY INCOME"   name="monthly_family_net_income" value={draft.monthly_family_net_income} onChange={update} type="number" />
              <EditField label="ID PRESENTED"     name="id_card_presented"         value={draft.id_card_presented}        onChange={update} />
              <EditField label="ID NUMBER"        name="id_card_number"            value={draft.id_card_number}           onChange={update} />
            </>
          ) : (
            <>
              <ViewField label="LAST NAME"    value={selectedCard.last_name} />
              <ViewField label="FIRST NAME"   value={selectedCard.first_name} />
              <ViewField label="MIDDLE NAME"  value={selectedCard.middle_name} />
              <ViewField label="BIRTHDATE"    value={selectedCard.birthdate} />
              <ViewField label="AGE"          value={selectedCard.age} />
              <ViewField label="SEX"          value={selectedCard.sex} />
              <ViewField label="CIVIL STATUS" value={selectedCard.civil_status} />
              <ViewField label="RELIGION"     value={selectedCard.religion} />
              <ViewField label="OCCUPATION"   value={selectedCard.occupation} />
              <ViewField label="MONTHLY INCOME"  value={selectedCard.monthly_family_net_income} />
              <ViewField label="ID PRESENTED"    value={selectedCard.id_card_presented} />
              <ViewField label="ID NUMBER"       value={selectedCard.id_card_number} />
            </>
          )}
        </div>

        <div className="grid grid-cols-2 p-1 w-full gap-y-3 mt-1">
          {isEditing ? (
            <>
              <EditField label="CONTACT NO."  name="contact_primary"  value={draft.contact_primary}  onChange={update} />
              <EditField label="ALTERNATE NO." name="contact_alternate" value={draft.contact_alternate} onChange={update} />
            </>
          ) : (
            <>
              <ViewField label="CONTACT NO."   value={selectedCard.contact_primary} />
              <ViewField label="ALTERNATE NO." value={selectedCard.contact_alternate} />
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <SectionHeader label="ACCOUNT INFORMATION" widthClass="w-[33%]" />
        <div className="grid grid-cols-3 p-1 w-full mt-2 gap-y-3">
          {isEditing ? (
            <>
              <EditSelect label="PAYMENT CHANNEL" name="payment_channel" value={draft.payment_channel} options={PAYMENT_CHANNEL_OPTIONS} onChange={update} />
              <EditSelect label="BANK"             name="bank_name"       value={draft.bank_name}       options={BANK_OPTIONS}           onChange={update} />
              <EditSelect label="E-WALLET"         name="ewallet_name"    value={draft.ewallet_name}    options={EWALLET_OPTIONS}        onChange={update} />
              <EditField  label="ACCOUNT NAME"     name="account_name"    value={draft.account_name}    onChange={update} />
              <EditSelect label="ACCOUNT TYPE"     name="account_type"    value={draft.account_type}    options={ACCOUNT_TYPE_OPTIONS}   onChange={update} />
              <EditField  label="ACCOUNT NUMBER"   name="account_number"  value={draft.account_number}  onChange={update} />
              <EditSelect label="HOUSE OWNERSHIP"  name="house_ownership" value={draft.house_ownership} options={HOUSE_OWNERSHIP_OPTIONS} onChange={update} />
              <EditSelect label="SHELTER DAMAGE"   name="shelter_damage"  value={draft.shelter_damage}  options={SHELTER_DAMAGE_OPTIONS}  onChange={update} />
            </>
          ) : (
            <>
              <ViewField label="BANK / E-WALLET"  value={selectedCard.ewallet_name || selectedCard.bank_name} />
              <ViewField label="ACCOUNT NAME"     value={selectedCard.account_name} />
              <ViewField label="ACCOUNT TYPE"     value={selectedCard.account_type} />
              <ViewField label="ACCOUNT NUMBER"   value={selectedCard.account_number} />
              <ViewField label="HOUSE OWNERSHIP"  value={selectedCard.house_ownership} />
              <ViewField label="SHELTER DAMAGE"   value={selectedCard.shelter_damage} />
            </>
          )}
        </div>
      </div>

    </div>
  )
}

export default CardInfo