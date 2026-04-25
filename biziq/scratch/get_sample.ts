import XLSX from "xlsx";
import * as fs from "fs";

const filePath = "c:\\Users\\Imika\\UM Z.AI\\sales_analysis.xlsx";

try {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);
  console.log("COLUMNS:", Object.keys(rows[0]));
  console.log("SAMPLE_ROW:", JSON.stringify(rows[0]));
  
  const totalRev = rows.reduce((s, r) => s + (Number(r.Revenue) || Number(r.Revenue_RM) || 0), 0);
  console.log("TOTAL_REV:", totalRev);
} catch (err) {
  console.error(err);
}
