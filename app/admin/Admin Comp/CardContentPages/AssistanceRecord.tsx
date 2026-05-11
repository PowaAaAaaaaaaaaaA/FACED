"use client";

import React, { useState } from "react";
import { useFacedStore } from "@/app/store/useFacedStore";

type AssistanceRow = {
  assistance_date: string;
  receiving_family_member: string;
  emergency_disaster_type: string;
  assistance_type: string;
  unit: string;
  quantity: string;
  cost: string;
  provider: string;
};

const emptyRow = (): AssistanceRow => ({
  assistance_date: "",
  receiving_family_member: "",
  emergency_disaster_type: "",
  assistance_type: "",
  unit: "",
  quantity: "",
  cost: "",
  provider: "",
});

function AssistanceRecords() {
  const selectedCard = useFacedStore((s) => s.selectedCard);
  const [rows, setRows] = useState<AssistanceRow[]>([emptyRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!selectedCard) return null;

  const updateRow = (index: number, field: keyof AssistanceRow, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (index: number) => {
    if (rows.length === 1) return; // keep at least one row
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(false);

    // Basic validation — assistance_type is required
    const invalid = rows.some((r) => !r.assistance_type.trim());
    if (invalid) {
      setSubmitError("Assistance type is required for all rows.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = rows.map((row) => ({
        faced_card_id: selectedCard.id,
        assistance_date: row.assistance_date || new Date().toLocaleDateString("en-GB"),
        receiving_family_member: row.receiving_family_member,
        emergency_disaster_type: row.emergency_disaster_type,
        assistance_type: row.assistance_type,
        unit: row.unit,
        quantity: row.quantity ? parseFloat(row.quantity) : null,
        cost: row.cost ? parseFloat(row.cost) : null,
        provider: row.provider,
        recorded_by: null, // replace with your auth user id
      }));

      const res = await fetch("/api/assistance-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSubmitSuccess(true);
      setRows([emptyRow()]); // reset after success
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full p-2">
      {/* Header */}
      <div className="mb-3">
        <span className="bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded">
          ASSISTANCE RECORDS
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase">
              <th>Date</th>
              <th>Receiver</th>
              <th>Emergency / Disaster</th>
              <th>Assistance</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Cost</th>
              <th>Provider</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-32"
                    value={row.assistance_date}
                    onChange={(e) => updateRow(index, "assistance_date", e.target.value)}
                    placeholder="dd/mm/yyyy"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-28"
                    value={row.receiving_family_member}
                    onChange={(e) => updateRow(index, "receiving_family_member", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-32"
                    value={row.emergency_disaster_type}
                    onChange={(e) => updateRow(index, "emergency_disaster_type", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-32"
                    value={row.assistance_type}
                    onChange={(e) => updateRow(index, "assistance_type", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-16"
                    value={row.unit}
                    onChange={(e) => updateRow(index, "unit", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-16"
                    value={row.quantity}
                    onChange={(e) => updateRow(index, "quantity", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-20"
                    value={row.cost}
                    onChange={(e) => updateRow(index, "cost", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-28"
                    value={row.provider}
                    onChange={(e) => updateRow(index, "provider", e.target.value)}
                  />
                </td>
                <td>
                  <button
                    onClick={() => removeRow(index)}
                    className="btn btn-ghost btn-xs text-error"
                    disabled={rows.length === 1}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <button
        onClick={addRow}
        className="mt-3 w-full border-2 border-dashed border-pink-300 text-pink-400 hover:bg-pink-50 rounded py-2 text-sm font-medium transition-colors"
      >
        + Add row
      </button>

      {/* Feedback */}
      {submitError && (
        <p className="mt-2 text-sm text-red-500">{submitError}</p>
      )}
      {submitSuccess && (
        <p className="mt-2 text-sm text-green-500">Records saved successfully.</p>
      )}

      {/* Submit */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn btn-primary btn-sm"
        >
          {isSubmitting ? "Saving..." : "Save Records"}
        </button>
      </div>
    </div>
  );
}

export default AssistanceRecords;