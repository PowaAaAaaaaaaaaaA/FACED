/**
 * PSGC Seed Script — 4 Normalized Tables
 * ────────────────────────────────────────
 * Seeds psgc_regions, psgc_provinces, psgc_municipalities, psgc_barangays
 * from the official PSA PSGC Excel publication file.
 *
 * Usage:
 *   npx tsx scripts/seed-barangays.ts
 *
 * To seed a specific region only, set REGION_PREFIX below.
 * "03" = Region III (Central Luzon)
 * null = all regions nationwide
 *
 * Requirements:
 *   npm install @supabase/supabase-js xlsx dotenv
 *   npm install -D tsx
 *
 * Env vars in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 */

import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: ".env.local" });

// ─── Config ─────────────────────────────────────────────────────────────────

const PSGC_FILE = path.resolve(
  process.argv[2] || "scripts/PSGC-1Q-2026-Publication-Datafile.xlsx"
);
const SHEET_NAME = "PSGC";
const BATCH_SIZE = 500;

// "03" = Region III only. Set to null to seed all regions.
const REGION_PREFIX: string | null = "03";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PsgcRow {
  code: string;
  name: string;
  level: string;
}

interface RegionRecord {
  code: string;
  name: string;
}

interface ProvinceRecord {
  code: string;
  name: string;
  region_code: string;
}

interface MunicipalityRecord {
  code: string;
  name: string;
  province_code: string | null;
  region_code: string;
}

interface BarangayRecord {
  code: string;
  name: string;
  municipality_code: string;
  province_code: string | null;
  region_code: string;
  card_seq_counter: number;
}

// ─── Read PSGC Excel ─────────────────────────────────────────────────────────

function readPsgcFile(filePath: string): PsgcRow[] {
  const workbook = XLSX.readFile(filePath, { type: "file", raw: false });
  const sheet = workbook.Sheets[SHEET_NAME];

  if (!sheet) {
    throw new Error(
      `Sheet "${SHEET_NAME}" not found. Available: ${workbook.SheetNames.join(", ")}`
    );
  }

  const raw: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  return raw
    .filter((row) => row["10-digit PSGC"] && row["Name"])
    .map((row) => ({
      code: String(row["10-digit PSGC"]).trim().padStart(10, "0"),
      name: String(row["Name"]).trim(),
      level: String(row["Geographic Level"]).trim(),
    }));
}

// ─── Build All Records ───────────────────────────────────────────────────────
//
// PSGC code structure (10 digits): RR PP MMM BBB
//   RR  = region (2 digits)
//   PP  = province (2 digits)
//   MMM = municipality/city (3 digits)
//   BBB = barangay (3 digits, "000" = the parent itself)
//
// The file is ordered top-down: Reg → Prov → Mun/City/SubMun → Bgy
// We walk it once, tracking current parents as we go.

interface ParseResult {
  regions: RegionRecord[];
  provinces: ProvinceRecord[];
  municipalities: MunicipalityRecord[];
  barangays: BarangayRecord[];
}

function buildRecords(rows: PsgcRow[], regionPrefix: string | null): ParseResult {
  const regions: RegionRecord[] = [];
  const provinces: ProvinceRecord[] = [];
  const municipalities: MunicipalityRecord[] = [];
  const barangays: BarangayRecord[] = [];

  const munLevels = new Set(["Mun", "City", "SubMun"]);

  let currentRegionCode = "";
  let currentProvinceCode: string | null = null;
  let currentMunCode = "";

  for (const { code, name, level } of rows) {
    // Always track hierarchy regardless of filter
    // (so parents are correct when we enter the filtered region)
    switch (level) {
      case "Reg": {
        currentRegionCode = code;
        currentProvinceCode = null;
        currentMunCode = "";

        if (!regionPrefix || code.startsWith(regionPrefix)) {
          regions.push({ code, name });
        }
        break;
      }

      case "Prov": {
        currentProvinceCode = code;
        currentMunCode = "";

        if (!regionPrefix || code.startsWith(regionPrefix)) {
          provinces.push({ code, name, region_code: currentRegionCode });
        }
        break;
      }

      case "Mun":
      case "City":
      case "SubMun": {
        currentMunCode = code;

        if (!regionPrefix || code.startsWith(regionPrefix)) {
          municipalities.push({
            code,
            name,
            province_code: currentProvinceCode,
            region_code: currentRegionCode,
          });
        }
        break;
      }

      case "Bgy": {
        if (!regionPrefix || code.startsWith(regionPrefix)) {
          barangays.push({
            code,
            name,
            municipality_code: currentMunCode,
            province_code: currentProvinceCode,
            region_code: currentRegionCode,
            card_seq_counter: 0,
          });
        }
        break;
      }
    }
  }

  return { regions, provinces, municipalities, barangays };
}

// ─── Batch Upsert Helper ─────────────────────────────────────────────────────

async function batchUpsert<T extends object>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
  records: T[],
  conflictColumn: string
) {
  const totalBatches = Math.ceil(records.length / BATCH_SIZE);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    process.stdout.write(
      `   [${table}] Batch ${batchNum}/${totalBatches} (${batch.length} rows)... `
    );

    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: conflictColumn, ignoreDuplicates: false });

    if (error) {
      console.error(`\n❌ Error inserting into ${table}:`, error.message);
      throw error;
    }

    console.log("✓");
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Missing env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  if (!fs.existsSync(PSGC_FILE)) {
    throw new Error(
      `PSGC file not found: ${PSGC_FILE}\n` +
        `Pass the path as an argument: npx tsx scripts/seed-barangays.ts <path>`
    );
  }

  const filterLabel = REGION_PREFIX
    ? `Region prefix "${REGION_PREFIX}" (Region III = Central Luzon)`
    : "ALL regions nationwide";

  console.log("📂 Reading:", PSGC_FILE);
  console.log("🔍 Filter:", filterLabel);
  console.log();

  const rows = readPsgcFile(PSGC_FILE);
  console.log(`✅ ${rows.length} total PSGC rows loaded`);

  const { regions, provinces, municipalities, barangays } = buildRecords(
    rows,
    REGION_PREFIX
  );

  console.log(`\n📊 Records to seed:`);
  console.log(`   Regions:        ${regions.length}`);
  console.log(`   Provinces:      ${provinces.length}`);
  console.log(`   Municipalities: ${municipalities.length}`);
  console.log(`   Barangays:      ${barangays.length}`);

  if (barangays.length === 0) {
    console.log("\n⚠️  No records found. Check your REGION_PREFIX value.");
    return;
  }

  // Preview sample
  console.log(`\n📋 Sample barangays:`);
  barangays.slice(0, 4).forEach((b) => {
    const mun = municipalities.find((m) => m.code === b.municipality_code);
    const prov = provinces.find((p) => p.code === b.province_code);
    console.log(`   ${b.code} | ${b.name} | ${mun?.name} | ${prov?.name}`);
  });

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log(`\n🚀 Seeding into Supabase...`);

  // Order matters: regions → provinces → municipalities → barangays (FK dependencies)
  await batchUpsert(supabase, "psgc_regions", regions, "code");
  await batchUpsert(supabase, "psgc_provinces", provinces, "code");
  await batchUpsert(supabase, "psgc_municipalities", municipalities, "code");
  await batchUpsert(supabase, "psgc_barangays", barangays, "code");

  console.log(`\n🎉 Done!`);
  console.log(`   ${regions.length} regions`);
  console.log(`   ${provinces.length} provinces`);
  console.log(`   ${municipalities.length} municipalities/cities`);
  console.log(`   ${barangays.length} barangays`);
  console.log(`\n   Safe to re-run anytime (uses upsert).`);
}

main().catch((err) => {
  console.error("\n💥 Seed failed:", err.message);
  process.exit(1);
});