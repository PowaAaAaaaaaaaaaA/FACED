"use client";

import { useEffect, useRef, useState } from "react";
import { FamilyMember, useFacedStore } from "@/app/store/useFacedStore";
import {
  EDUCATIONAL_ATTAINMENT,
  RELATION_FAMHEAD,
  SEX_OPTIONS,
  VULNERABILITY_TYPES,
} from "@/app/survey/constants";

type MemberRow = Omit<FamilyMember, "id" | "age"> & {
  id?: string;
  tempId: string;
  age: string;
};

const SEX_MAP: Record<string, string> = {
  Male: "male",
  Female: "female",
};

const SEX_LABELS = Object.fromEntries(
  Object.entries(SEX_MAP).map(([label, value]) => [value, label])
);

const emptyRow = (): MemberRow => ({
  tempId: crypto.randomUUID(),
  full_name: "",
  relation_to_head: "",
  birthdate: "",
  age: "",
  sex: "",
  highest_educational_attainment: "",
  occupation: "",
  type_of_vulnerability: "",
});

const makeRows = (members: FamilyMember[]): MemberRow[] =>
  members.map((member) => ({
    id: member.id,
    tempId: member.id,
    full_name: member.full_name ?? "",
    relation_to_head: member.relation_to_head ?? "",
    birthdate: member.birthdate ?? "",
    age: member.age == null ? "" : String(member.age),
    sex: member.sex ?? "",
    highest_educational_attainment:
      member.highest_educational_attainment ?? "",
    occupation: member.occupation ?? "",
    type_of_vulnerability: member.type_of_vulnerability ?? "",
  }));

const displayVulnerability = (value: string) => value || "None";

const calculateAge = (birthdate: string) => {
  if (!birthdate) return "";
  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function FamilyMembers() {
  const selectedCard = useFacedStore((s) => s.selectedCard);
  const updateSelectedCardFamilyMembers = useFacedStore(
    (s) => s.updateSelectedCardFamilyMembers
  );
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const lastCardId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedCard) {
      lastCardId.current = null;
      setRows([]);
      return;
    }

    if (lastCardId.current === selectedCard.id) return;

    lastCardId.current = selectedCard.id;
    setRows(makeRows(selectedCard.family_members));
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  }, [selectedCard]);

  if (!selectedCard) return null;

  const updateRow = (
    tempId: string,
    field: keyof Omit<MemberRow, "tempId" | "id">,
    value: string
  ) => {
    setRows((current) =>
      current.map((row) => {
        if (row.tempId !== tempId) return row;

        if (field === "birthdate") {
          return { ...row, birthdate: value, age: calculateAge(value) };
        }

        return { ...row, [field]: value };
      })
    );
    setSuccess(false);
  };

  const addRow = () => {
    setRows((current) => [...current, emptyRow()]);
    setSuccess(false);
  };

  const removeRow = async (row: MemberRow) => {
    setError(null);
    setSuccess(false);

    if (row.id) {
      try {
        const res = await fetch("/api/family-members", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: row.id }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete member.");
        return;
      }
    }

    const nextRows = rows.filter((item) => item.tempId !== row.tempId);
    setRows(nextRows);
    updateSelectedCardFamilyMembers(toFamilyMembers(nextRows));
  };

  const handleCancel = () => {
    setRows(makeRows(selectedCard.family_members));
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const filledRows = rows.filter((row) => row.full_name.trim());

    try {
      const payload = filledRows.map((row) => ({
        id: row.id,
        faced_card_id: selectedCard.id,
        full_name: row.full_name,
        relation_to_head: row.relation_to_head || null,
        birthdate: row.birthdate || null,
        age: row.age ? Number(row.age) : null,
        sex: row.sex || null,
        highest_educational_attainment:
          row.highest_educational_attainment || null,
        occupation: row.occupation || null,
        type_of_vulnerability:
          row.type_of_vulnerability === "None"
            ? null
            : row.type_of_vulnerability || null,
      }));

      const res = await fetch("/api/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const familyMembers = data.family_members as FamilyMember[];
      setRows(makeRows(familyMembers));
      updateSelectedCardFamilyMembers(familyMembers);
      setIsEditing(false);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save members.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full w-full p-2">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded">
          FAMILY MEMBERS
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && (
            <p className="text-xs text-green-600">Family members saved.</p>
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
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase">
              <th>Name</th>
              <th>Relation</th>
              <th>Birthdate</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Education</th>
              <th>Occupation</th>
              <th>Vulnerability</th>
              {isEditing && <th />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={isEditing ? 9 : 8}
                  className="text-center text-gray-400 py-4"
                >
                  No family members recorded.
                </td>
              </tr>
            ) : (
              rows.map((member) => (
                <tr key={member.tempId}>
                  <td>
                    <TextCell
                      isEditing={isEditing}
                      value={member.full_name}
                      onChange={(value) => updateRow(member.tempId, "full_name", value)}
                    />
                  </td>
                  <td>
                    <SelectCell
                      isEditing={isEditing}
                      value={member.relation_to_head}
                      options={RELATION_FAMHEAD}
                      onChange={(value) =>
                        updateRow(member.tempId, "relation_to_head", value)
                      }
                    />
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        className="input input-bordered input-xs w-32"
                        value={member.birthdate}
                        onChange={(e) =>
                          updateRow(member.tempId, "birthdate", e.target.value)
                        }
                      />
                    ) : (
                      formatDate(member.birthdate)
                    )}
                  </td>
                  <td>
                    <TextCell
                      isEditing={isEditing}
                      type="number"
                      value={member.age || calculateAge(member.birthdate)}
                      onChange={(value) => updateRow(member.tempId, "age", value)}
                    />
                  </td>
                  <td>
                    <SelectCell
                      isEditing={isEditing}
                      value={member.sex}
                      options={SEX_OPTIONS}
                      optionMap={SEX_MAP}
                      displayMap={SEX_LABELS}
                      onChange={(value) => updateRow(member.tempId, "sex", value)}
                    />
                  </td>
                  <td>
                    <SelectCell
                      isEditing={isEditing}
                      value={member.highest_educational_attainment}
                      options={EDUCATIONAL_ATTAINMENT}
                      onChange={(value) =>
                        updateRow(
                          member.tempId,
                          "highest_educational_attainment",
                          value
                        )
                      }
                    />
                  </td>
                  <td>
                    <TextCell
                      isEditing={isEditing}
                      value={member.occupation}
                      onChange={(value) =>
                        updateRow(member.tempId, "occupation", value)
                      }
                    />
                  </td>
                  <td>
                    <SelectCell
                      isEditing={isEditing}
                      value={member.type_of_vulnerability || "None"}
                      options={VULNERABILITY_TYPES}
                      displayValue={displayVulnerability}
                      onChange={(value) =>
                        updateRow(member.tempId, "type_of_vulnerability", value)
                      }
                    />
                  </td>
                  {isEditing && (
                    <td>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => removeRow(member)}
                      >
                        x
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <button
          onClick={addRow}
          className="mt-3 w-full border-2 border-dashed border-pink-300 text-pink-400 hover:bg-pink-50 rounded py-2 text-sm font-medium transition-colors"
        >
          + Add family member
        </button>
      )}
    </div>
  );
}

function TextCell({
  isEditing,
  onChange,
  type = "text",
  value,
}: {
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  if (!isEditing) return <>{value || "-"}</>;

  return (
    <input
      type={type}
      className="input input-bordered input-xs w-32 max-w-[45vw] sm:max-w-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function SelectCell({
  displayMap,
  displayValue,
  isEditing,
  onChange,
  optionMap,
  options,
  value,
}: {
  displayMap?: Record<string, string>;
  displayValue?: (value: string) => string;
  isEditing: boolean;
  onChange: (value: string) => void;
  optionMap?: Record<string, string>;
  options: string[];
  value: string;
}) {
  const mappedOptions = options.map((option) => ({
    label: option,
    value: optionMap ? optionMap[option] : option,
  }));
  const hasCurrentOption =
    !value || mappedOptions.some((option) => option.value === value);

  if (!isEditing) {
    return <>{(displayValue?.(value) ?? displayMap?.[value] ?? value) || "-"}</>;
  }

  return (
    <select
      className="select select-bordered select-xs w-32 max-w-[45vw] sm:max-w-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option disabled value="">
        --Select--
      </option>
      {!hasCurrentOption && <option value={value}>{value}</option>}
      {mappedOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function toFamilyMembers(rows: MemberRow[]): FamilyMember[] {
  return rows
    .filter((row): row is MemberRow & { id: string } => Boolean(row.id))
    .map((row) => ({
      id: row.id,
      full_name: row.full_name,
      relation_to_head: row.relation_to_head,
      birthdate: row.birthdate,
      age: row.age ? Number(row.age) : null,
      sex: row.sex,
      highest_educational_attainment: row.highest_educational_attainment,
      occupation: row.occupation,
      type_of_vulnerability:
        row.type_of_vulnerability === "None" ? "" : row.type_of_vulnerability,
    }));
}

export default FamilyMembers;