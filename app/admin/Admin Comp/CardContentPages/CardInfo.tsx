"use client";

import { useEffect, useRef, useState } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { FacedCard, useFacedStore } from "@/app/store/useFacedStore";
import { authFetch } from "@/lib/auth-fetch";
import {
  ACCOUNT_TYPE_OPTIONS,
  BANK_EWALLET_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  HOUSE_OWNERSHIP,
  INCOME_BRACKETS,
  INCOME_MAP,
  RELIGIONS,
  SEX_OPTIONS,
  SHELTER_DMG_CLASSIFICATION,
  VALID_IDS,
} from "@/app/survey/constants";

type EditableTextKey =
  | "evacuation_center_site"
  | "last_name"
  | "first_name"
  | "middle_name"
  | "name_extension"
  | "birthdate"
  | "birthplace"
  | "sex"
  | "civil_status"
  | "mothers_maiden_name"
  | "religion"
  | "occupation"
  | "id_card_presented"
  | "id_card_number"
  | "contact_primary"
  | "contact_alternate"
  | "permanent_address"
  | "house_ownership"
  | "shelter_damage"
  | "payment_channel"
  | "bank_name"
  | "ewallet_name"
  | "other_bank_name"
  | "other_ewallet_name"
  | "account_name"
  | "account_type"
  | "account_number";

type FormState = Record<EditableTextKey, string> & {
  age: string;
  monthly_family_net_income: string;
  is_4ps_beneficiary: boolean;
  is_indigenous_people: boolean;
  ip_ethnicity: string;
};

const textFields: EditableTextKey[] = [
  "evacuation_center_site",
  "last_name",
  "first_name",
  "middle_name",
  "name_extension",
  "birthdate",
  "birthplace",
  "sex",
  "civil_status",
  "mothers_maiden_name",
  "religion",
  "occupation",
  "id_card_presented",
  "id_card_number",
  "contact_primary",
  "contact_alternate",
  "permanent_address",
  "house_ownership",
  "shelter_damage",
  "payment_channel",
  "bank_name",
  "ewallet_name",
  "other_bank_name",
  "other_ewallet_name",
  "account_name",
  "account_type",
  "account_number",
];

const makeForm = (card: FacedCard): FormState => {
  const form = textFields.reduce((acc, key) => {
    acc[key] = String(card[key] ?? "");
    return acc;
  }, {} as Record<EditableTextKey, string>);

  return {
    ...form,
    age: card.age == null ? "" : String(card.age),
    monthly_family_net_income:
      card.monthly_family_net_income == null
        ? ""
        : String(card.monthly_family_net_income),
    is_4ps_beneficiary: card.is_4ps_beneficiary,
    is_indigenous_people: card.is_indigenous_people,
    ip_ethnicity: card.ip_ethnicity ?? "",
  };
};

const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};
const ACCOUNT_TYPE_MAP: Record<string, string> = {
  Savings: "savings",
  Current: "current",
  "E-Wallet": "e_wallet",
};
const BANK_NAME_MAP: Record<string, string> = {
  Landbank: "landbank",
  DBP: "dbp",
  BDO: "bdo",
  BPI: "bpi",
  Metrobank: "metrobank",
  PNB: "pnb",
  UnionBank: "unionbank",
  RCBC: "rcbc",
  Others: "other_bank",
};
const EWALLET_NAME_MAP: Record<string, string> = {
  GCash: "gcash",
  "Maya (PayMaya)": "maya",
  ShopeePay: "shopeepay",
  SeaBank: "seabank",
  Others: "other_ewallet",
};
const CIVIL_STATUS_MAP: Record<string, string> = {
  Single: "single",
  Married: "married",
  Widowed: "widowed",
  Separated: "separated",
  Annulled: "annulled",
  "Live-in": "live_in",
};
const HOUSE_OWNERSHIP_MAP: Record<string, string> = {
  Owner: "owner",
  Renter: "renter",
  Sharer: "sharer",
};
const SHELTER_DAMAGE_MAP: Record<string, string> = {
  "Partially Damaged": "partially_damaged",
  "Totally Damaged": "totally_damaged",
};
const SEX_MAP: Record<string, string> = {
  Male: "male",
  Female: "female",
};

const reverseMap = (map: Record<string, string>) =>
  Object.fromEntries(Object.entries(map).map(([label, value]) => [value, label]));

const ACCOUNT_TYPE_LABELS = reverseMap(ACCOUNT_TYPE_MAP);
const BANK_NAME_LABELS = reverseMap(BANK_NAME_MAP);
const EWALLET_NAME_LABELS = reverseMap(EWALLET_NAME_MAP);
const CIVIL_STATUS_LABELS = reverseMap(CIVIL_STATUS_MAP);
const HOUSE_OWNERSHIP_LABELS = reverseMap(HOUSE_OWNERSHIP_MAP);
const SHELTER_DAMAGE_LABELS = reverseMap(SHELTER_DAMAGE_MAP);
const SEX_LABELS = reverseMap(SEX_MAP);
const INCOME_LABELS = Object.fromEntries(
  Object.entries(INCOME_MAP).map(([label, value]) => [String(value), label])
);

const toOptions = (labels: string[], map?: Record<string, string>) =>
  labels.map((label) => ({ label, value: map ? map[label] : label }));

const providerLabelFromForm = (form: FormState) => {
  if (form.ewallet_name) return EWALLET_NAME_LABELS[form.ewallet_name] ?? form.ewallet_name;
  if (form.bank_name) return BANK_NAME_LABELS[form.bank_name] ?? form.bank_name;
  return "";
};

const displayValue = (name: keyof FormState, value: string | boolean) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";

  const labels: Partial<Record<keyof FormState, Record<string, string>>> = {
    account_type: ACCOUNT_TYPE_LABELS,
    civil_status: CIVIL_STATUS_LABELS,
    house_ownership: HOUSE_OWNERSHIP_LABELS,
    monthly_family_net_income: INCOME_LABELS,
    sex: SEX_LABELS,
    shelter_damage: SHELTER_DAMAGE_LABELS,
  };

  return labels[name]?.[value] ?? value;
};

function CardInfo() {
  const selectedCard = useFacedStore((s) => s.selectedCard);
  const updateSelectedCard = useFacedStore((s) => s.updateSelectedCard);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const lastCardId = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedCard) {
      lastCardId.current = null;
      setForm(null);
      return;
    }

    if (lastCardId.current === selectedCard.id) return;

    lastCardId.current = selectedCard.id;
    setForm(makeForm(selectedCard));
    setIsEditing(false);
    setSuccess(false);
  }, [selectedCard]);

  
  if (!selectedCard || !form) {
    return (
      <div className="mt-10 flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center text-lg text-gray-400 sm:flex-row sm:text-2xl">
        <BiErrorCircle />
        <h1>Please Select a FACED Card to view the details</h1>
      </div>
    );
  }

  const updateForm = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setSuccess(false);
  };


  const updateProvider = (provider: string) => {
    const bankName = BANK_NAME_MAP[provider] ?? "";
    const ewalletName = EWALLET_NAME_MAP[provider] ?? "";

    setForm((current) =>
      current
        ? {
            ...current,
            payment_channel: ewalletName ? "e_wallet" : "bank",
            bank_name: bankName,
            ewallet_name: ewalletName,
            account_type: ewalletName ? "e_wallet" : current.account_type,
          }
        : current
    );
    setSuccess(false);
  };

  const handleCancel = () => {
    setForm(makeForm(selectedCard));
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const updates: Partial<FacedCard> = {
      evacuation_center_site: form.evacuation_center_site,
      last_name: form.last_name,
      first_name: form.first_name,
      middle_name: form.middle_name,
      name_extension: form.name_extension,
      birthdate: form.birthdate,
      birthplace: form.birthplace,
      age: form.age ? Number(form.age) : null,
      sex: form.sex,
      civil_status: form.civil_status,
      mothers_maiden_name: form.mothers_maiden_name,
      religion: form.religion,
      occupation: form.occupation,
      monthly_family_net_income: form.monthly_family_net_income
        ? Number(form.monthly_family_net_income)
        : null,
      id_card_presented: form.id_card_presented,
      id_card_number: form.id_card_number,
      contact_primary: form.contact_primary,
      contact_alternate: form.contact_alternate,
      permanent_address: form.permanent_address,
      house_ownership: form.house_ownership,
      shelter_damage: form.shelter_damage,
      is_4ps_beneficiary: form.is_4ps_beneficiary,
      is_indigenous_people: form.is_indigenous_people,
      ip_ethnicity: form.ip_ethnicity,
      payment_channel: form.payment_channel,
      bank_name: form.bank_name,
      ewallet_name: form.ewallet_name,
      other_bank_name: form.other_bank_name,
      other_ewallet_name: form.other_ewallet_name,
      account_name: form.account_name,
      account_type: form.account_type,
      account_number: form.account_number,
    };

    try {
      const res = await authFetch(`/api/card-content/${selectedCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCard.id,
          family_head_id: selectedCard.family_head_id,
          ...Object.fromEntries(
            Object.entries(updates).map(([key, value]) => [
              key,
              typeof value === "string" ? emptyToNull(value) : value,
            ])
          ),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      updateSelectedCard(updates);
      setIsEditing(false);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full p-2 overflow-auto">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {error && <p className="mr-auto text-xs text-red-500">{error}</p>}
        {success && (
          <p className="mr-auto text-xs text-green-600">Card saved successfully.</p>
        )}
        {isEditing ? (
          <>
            <button className="btn btn-ghost btn-xs" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-xs"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-xs" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
      </div>

      <div>
        <h2 className="w-fit rounded-2xl px-3 py-1 text-center text-[0.8rem] font-bold text-[#0F2F9A] bg-[#D5EDFF] sm:text-[0.9rem]">
          LOCATION
        </h2>
        <div className="grid w-full grid-cols-1 gap-3 p-1 mt-2 sm:grid-cols-2 xl:grid-cols-3">
          <ReadOnly label="REGION" value={selectedCard.region} />
          <ReadOnly label="PROVINCE" value={selectedCard.province} />
          <ReadOnly label="CITY / MUNICIPALITY" value={selectedCard.municipality} />
          <ReadOnly label="DISTRICT" value={selectedCard.district} />
          <ReadOnly label="BARANGAY" value={selectedCard.barangay} />
          <Field
            form={form}
            isEditing={isEditing}
            label="EVACUATION CENTER"
            name="evacuation_center_site"
            onChange={updateForm}
          />
        </div>
      </div>

      <div className="mt-2">
        <h2 className="w-fit rounded-2xl px-3 py-1 text-center font-bold text-[#0F2F9A] bg-[#D5EDFF] text-[0.8rem] sm:text-[0.9rem]">
          HEAD OF FAMILY
        </h2>
        <div className="grid w-full grid-cols-1 gap-3 p-1 mt-2 sm:grid-cols-2 xl:grid-cols-4">
          <Field form={form} isEditing={isEditing} label="LAST NAME" name="last_name" onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="FIRST NAME" name="first_name" onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="MIDDLE NAME" name="middle_name" onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="BIRTHDATE" name="birthdate" type="date" onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="AGE" name="age" type="number" onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="SEX" name="sex" options={toOptions(SEX_OPTIONS, SEX_MAP)} onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="CIVIL STATUS" name="civil_status" options={toOptions(CIVIL_STATUS_OPTIONS, CIVIL_STATUS_MAP)} onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="RELIGION" name="religion" options={toOptions(RELIGIONS)} onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="SEX" name="sex" options={toOptions(SEX_OPTIONS, SEX_MAP)} onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="CIVIL STATUS" name="civil_status" options={toOptions(CIVIL_STATUS_OPTIONS, CIVIL_STATUS_MAP)} onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="RELIGION" name="religion" options={toOptions(RELIGIONS)} onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="OCCUPATION" name="occupation" onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="MONTHLY INCOME" name="monthly_family_net_income" options={toOptions(INCOME_BRACKETS, Object.fromEntries(Object.entries(INCOME_MAP).map(([label, value]) => [label, String(value)])))} onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="ID PRESENTED" name="id_card_presented" options={toOptions(VALID_IDS)} onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="ID NUMBER" name="id_card_number" onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="CONTACT NO." name="contact_primary" onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="ALTERNATE NO." name="contact_alternate" onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="BIRTHPLACE" name="birthplace" onChange={updateForm} />
          <Field form={form} isEditing={isEditing} label="MOTHER'S MAIDEN NAME" name="mothers_maiden_name" onChange={updateForm} />
        </div>
        <div className="p-1">
          <Field form={form} isEditing={isEditing} label="PERMANENT ADDRESS" name="permanent_address" onChange={updateForm} />
        </div>
      </div>

      <div className="mt-2">
        <h2 className="w-fit rounded-2xl px-3 py-1 text-center font-bold text-[#0F2F9A] bg-[#D5EDFF] text-[0.8rem] sm:text-[0.9rem]">
          ACCOUNT INFORMATION
        </h2>
        <div className="grid w-full grid-cols-1 gap-3 p-1 mt-2 sm:grid-cols-2 xl:grid-cols-3">
          <ProviderField
            isEditing={isEditing}
            value={providerLabelFromForm(form)}
            onChange={updateProvider}
          />
          <Field form={form} isEditing={isEditing} label="ACCOUNT NAME" name="account_name" onChange={updateForm} />
          <SelectField
            form={form}
            isEditing={isEditing}
            label="ACCOUNT TYPE"
            name="account_type"
            options={toOptions(
              form.payment_channel === "e_wallet" ? ["E-Wallet"] : ACCOUNT_TYPE_OPTIONS.filter((type) => type !== "E-Wallet"),
              ACCOUNT_TYPE_MAP
            )}
            onChange={updateForm}
          />
          <Field form={form} isEditing={isEditing} label="ACCOUNT NUMBER" name="account_number" onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="HOUSE OWNERSHIP" name="house_ownership" options={toOptions(HOUSE_OWNERSHIP, HOUSE_OWNERSHIP_MAP)} onChange={updateForm} />
          <SelectField form={form} isEditing={isEditing} label="SHELTER DAMAGE" name="shelter_damage" options={toOptions(SHELTER_DMG_CLASSIFICATION, SHELTER_DAMAGE_MAP)} onChange={updateForm} />
        </div>
      </div>

      <div className="mt-2">
        <h2 className="w-fit rounded-2xl px-3 py-1 text-center font-bold text-[#0F2F9A] bg-[#D5EDFF] text-[0.8rem] sm:text-[0.9rem]">
          OTHER DETAILS
        </h2>
        <div className="grid w-full grid-cols-1 gap-3 p-1 mt-2 sm:grid-cols-2 xl:grid-cols-3">
          <CheckField
            checked={form.is_4ps_beneficiary}
            isEditing={isEditing}
            label="4PS BENEFICIARY"
            onChange={(value) => updateForm("is_4ps_beneficiary", value)}
          />
          <CheckField
            checked={form.is_indigenous_people}
            isEditing={isEditing}
            label="INDIGENOUS PEOPLE"
            onChange={(value) => updateForm("is_indigenous_people", value)}
          />
          <Field form={form} isEditing={isEditing} label="IP ETHNICITY" name="ip_ethnicity" onChange={updateForm} />
        </div>
      </div>
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="text-gray-500 text-[0.7rem] font-bold">{label}</p>
      <p className="text-[0.8rem] text-[#0D1B4B] font-bold">
        {value || "-"}
      </p>
    </div>
  );
}

function Field({
  form,
  isEditing,
  label,
  name,
  onChange,
  type = "text",
}: {
  form: FormState;
  isEditing: boolean;
  label: string;
  name: keyof FormState;
  onChange: (key: keyof FormState, value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <p className="text-gray-500 text-[0.7rem] font-bold">{label}</p>
      {isEditing ? (
        <input
          type={type}
          className="input input-bordered input-xs w-full text-[#0D1B4B] font-bold"
          value={String(form[name] ?? "")}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <p className="text-[0.8rem] text-[#0D1B4B] font-bold">
          {String(displayValue(name, form[name]) || "-")}
        </p>
      )}
    </div>
  );
}

function SelectField({
  form,
  isEditing,
  label,
  name,
  onChange,
  options,
}: {
  form: FormState;
  isEditing: boolean;
  label: string;
  name: keyof FormState;
  onChange: (key: keyof FormState, value: string) => void;
  options: { label: string; value: string }[];
}) {
  const value = String(form[name] ?? "");
  const hasCurrentOption = !value || options.some((option) => option.value === value);

  return (
    <div>
      <p className="text-gray-500 text-[0.7rem] font-bold">{label}</p>
      {isEditing ? (
        <select
          className="select select-bordered select-xs w-full text-[#0D1B4B] font-bold"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
        >
          <option disabled value="">
            --Select--
          </option>
          {!hasCurrentOption && <option value={value}>{value}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-[0.8rem] text-[#0D1B4B] font-bold">
          {displayValue(name, value) || "-"}
        </p>
      )}
    </div>
  );
}

function ProviderField({
  isEditing,
  onChange,
  value,
}: {
  isEditing: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  const hasCurrentOption =
    !value || BANK_EWALLET_OPTIONS.some((provider) => provider === value);

  return (
    <div>
      <p className="text-gray-500 text-[0.7rem] font-bold">BANK / E-WALLET</p>
      {isEditing ? (
        <select
          className="select select-bordered select-xs w-full text-[#0D1B4B] font-bold"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option disabled value="">
            --Select Bank / E-Wallet--
          </option>
          {!hasCurrentOption && <option value={value}>{value}</option>}
          {BANK_EWALLET_OPTIONS.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-[0.8rem] text-[#0D1B4B] font-bold">{value || "-"}</p>
      )}
    </div>
  );
}

function CheckField({
  checked,
  isEditing,
  label,
  onChange,
}: {
  checked: boolean;
  isEditing: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <p className="text-gray-500 text-[0.7rem] font-bold">{label}</p>
      {isEditing ? (
        <input
          type="checkbox"
          className="checkbox checkbox-primary checkbox-sm"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      ) : (
        <p className="text-[0.8rem] text-[#0D1B4B] font-bold">
          {checked ? "Yes" : "No"}
        </p>
      )}
    </div>
  );
}

export default CardInfo;