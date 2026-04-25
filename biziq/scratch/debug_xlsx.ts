import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const filePath = "c:\\Users\\Imika\\UM Z.AI\\sales_analysis.xlsx";

try {
  console.log("XLSX Type:", typeof XLSX);
  console.log("XLSX Keys:", Object.keys(XLSX));
  
  // Try to find where readFile is
  const anyXLSX = XLSX as any;
  const rf = anyXLSX.readFile || (anyXLSX.default && anyXLSX.default.readFile);
  console.log("readFile found?", !!rf);

  console.log("Checking file existence...");
  if (!fs.existsSync(filePath)) {
    console.log("File does NOT exist at path:", filePath);
    process.exit(1);
  }
  console.log("File exists. Size:", fs.statSync(filePath).size);

  console.log("Reading workbook...");
  const workbook = rf(filePath);
  console.log("Sheets:", workbook.SheetNames);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const anyUtils = (XLSX as any).utils || (XLSX as any).default.utils;
  const rows: any[] = anyUtils.sheet_to_json(worksheet);
  console.log("Success! Parsed", rows.length, "rows.");
  if (rows.length > 0) {
    console.log("Columns:", Object.keys(rows[0]));
  }
} catch (err) {
  console.error("DEBUG ERROR:", err);
}
