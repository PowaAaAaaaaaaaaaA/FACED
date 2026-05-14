"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useFacedStore } from "@/app/store/useFacedStore";

type AssistanceRow = {
  id?: string;
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
  // Track the last-saved snapshot to detect actual changes
  const [savedRows, setSavedRows] = useState<AssistanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!selectedCard?.id) return;
    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const res = await fetch(`/api/assistance-record?faced_card_id=${selectedCard.id}`);
      const data = await res.json();
      if (data.records && data.records.length > 0) {
        const mapped: AssistanceRow[] = data.records.map((rec: AssistanceRow) => ({
          id: rec.id,
          assistance_date: rec.assistance_date ?? "",
          receiving_family_member: rec.receiving_family_member ?? "",
          emergency_disaster_type: rec.emergency_disaster_type ?? "",
          assistance_type: rec.assistance_type ?? "",
          unit: rec.unit ?? "",
          quantity: rec.quantity ? String(rec.quantity) : "",
          cost: rec.cost ? String(rec.cost) : "",
          provider: rec.provider ?? "",
        }));
        setRows(mapped);
        setSavedRows(mapped); // snapshot what's currently in the DB
      } else {
        setRows([emptyRow()]);
        setSavedRows([]);
      }
    } catch {
      setRows([emptyRow()]);
      setSavedRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCard?.id]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  if (!selectedCard) return null;

  const updateRow = (index: number, field: keyof AssistanceRow, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = async (index: number) => {
    const row = rows[index];

    if (row.id) {
      try {
        const res = await fetch("/api/assistance-record", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: row.id }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        // Remove from saved snapshot too
        setSavedRows((prev) => prev.filter((r) => r.id !== row.id));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete record.";
        setSubmitError(msg);
        return;
      }
    }

    if (rows.length === 1) {
      setRows([emptyRow()]);
    } else {
      setRows((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Returns true if an existing row differs from its saved snapshot
  const rowHasChanged = (row: AssistanceRow): boolean => {
    if (!row.id) return true; // new row — always include
    const original = savedRows.find((s) => s.id === row.id);
    if (!original) return true; // no snapshot found — treat as new
    return (Object.keys(row) as (keyof AssistanceRow)[]).some(
      (key) => row[key] !== original[key]
    );
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(false);

    // Only rows with content AND actual changes
    const filledRows = rows.filter(
      (r) => r.assistance_type.trim() && rowHasChanged(r)
    );

    if (filledRows.length === 0) {
      // Nothing changed — still show success so user knows state is saved
      setSubmitSuccess(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = filledRows.map((row) => ({
        id: row.id, // undefined for new rows → API will insert; present → API will upsert
        faced_card_id: selectedCard.id,
        assistance_date: row.assistance_date || new Date().toISOString().split("T")[0],
        receiving_family_member: row.receiving_family_member,
        emergency_disaster_type: row.emergency_disaster_type,
        assistance_type: row.assistance_type,
        unit: row.unit,
        quantity: row.quantity ? parseFloat(row.quantity) : null,
        cost: row.cost ? parseFloat(row.cost) : null,
        provider: row.provider,
        recorded_by: null,
      }));

      const res = await fetch("/api/assistance-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Re-fetch to sync server-assigned IDs and refresh the saved snapshot
      await fetchRecords();

      setSubmitSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full p-2">
      <div className="mb-3">
        <span className="bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded">
          ASSISTANCE RECORDS
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-sm text-gray-400">
          <span className="loading loading-spinner loading-sm mr-2" />
          Loading records...
        </div>
      ) : (
        <>
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
                  <tr key={row.id ?? `new-${index}`}>
                    <td>
                      <input type="date" className="input input-bordered input-sm w-32"
                        value={row.assistance_date}
                        onChange={(e) => updateRow(index, "assistance_date", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" className="input input-bordered input-sm w-28"
                        value={row.receiving_family_member}
                        onChange={(e) => updateRow(index, "receiving_family_member", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" className="input input-bordered input-sm w-32"
                        value={row.emergency_disaster_type}
                        onChange={(e) => updateRow(index, "emergency_disaster_type", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" className="input input-bordered input-sm w-32"
                        value={row.assistance_type}
                        onChange={(e) => updateRow(index, "assistance_type", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" className="input input-bordered input-sm w-16"
                        value={row.unit}
                        onChange={(e) => updateRow(index, "unit", e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="input input-bordered input-sm w-16"
                        value={row.quantity}
                        onChange={(e) => updateRow(index, "quantity", e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="input input-bordered input-sm w-20"
                        value={row.cost}
                        onChange={(e) => updateRow(index, "cost", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" className="input input-bordered input-sm w-28"
                        value={row.provider}
                        onChange={(e) => updateRow(index, "provider", e.target.value)} />
                    </td>
                    <td>
                      <button
                        onClick={() => removeRow(index)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addRow}
            className="mt-3 w-full border-2 border-dashed border-pink-300 text-pink-400 hover:bg-pink-50 rounded py-2 text-sm font-medium transition-colors"
          >
            + Add row
          </button>

          {submitError && <p className="mt-2 text-sm text-red-500">{submitError}</p>}
          {submitSuccess && <p className="mt-2 text-sm text-green-500">Records saved successfully.</p>}

          <div className="mt-4 flex justify-end">
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary btn-sm">
              {isSubmitting ? "Saving..." : "Save Records"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AssistanceRecords;