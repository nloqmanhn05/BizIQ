import { parse } from "csv-parse/sync"
import * as fs from "fs"
import * as path from "path"
import XLSX from "xlsx"
import { ParsedCSVData } from "../types/index"

export function parseFile(filePath: string): ParsedCSVData {
  const ext = path.extname(filePath).toLowerCase();
  let rows: Record<string, string | number>[] = [];

  try {
    if (ext === ".xlsx" || ext === ".xls") {
      // Excel Parsing (Robust resolver for ESM/CJS)
      const rf = (XLSX as any).readFile || (XLSX as any).default?.readFile;
      const workbook = rf(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const anyUtils = (XLSX as any).utils || (XLSX as any).default?.utils;
      rows = anyUtils.sheet_to_json(worksheet);
    } else {
      // CSV Parsing
      const content = fs.readFileSync(filePath, "utf-8");
      rows = parse(content, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      }) as Record<string, string | number>[];
    }
  } catch (err) {
    console.error(`File parsing error for path: ${filePath}`, err);
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse ${ext.toUpperCase() || 'CSV'} file: ${detail}`);
  }

  if (!rows || rows.length === 0) {
    throw new Error("The uploaded file contains no data rows.");
  }

  // Header Normalization (Map common variations to internal keys)
  const normalizedRows = rows.map(row => {
    const normalized: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(row)) {
      const k = key.toLowerCase().trim();
      if (k === "revenue" || k === "sales" || k === "total_revenue" || k === "revenue_rm") normalized.revenue_rm = value;
      else if (k === "cogs" || k === "cost" || k === "expenses" || k === "cogs_rm") normalized.cogs_rm = value;
      else if (k === "profit" || k === "gross_profit" || k === "gross_profit_rm") normalized.gross_profit_rm = value;
      else if (k === "location" || k === "branch" || k === "store") normalized.location = value;
      else if (k === "item" || k === "product" || k === "sku") normalized.item = value;
      else if (k === "channel" || k === "platform") normalized.channel = value;
      else if (k === "date" || k === "timestamp") normalized.date = value;
      else if (k === "month") normalized.month = value;
      else if (k === "year") normalized.year = value;
      else normalized[key] = value;
    }
    return normalized;
  });

  // Use normalizedRows instead of rows
  const groupSum = (key: string, valueKey: string) => {
    const result: Record<string, number> = {}
    for (const row of normalizedRows) {
      const k = String(row[key] || "Unknown")
      result[k] = (result[k] || 0) + Number(row[valueKey] || 0)
    }
    return result
  }

  const groupAvg = (key: string, valueKey: string) => {
    const counts: Record<string, number> = {}
    const sums: Record<string, number> = {}
    for (const row of normalizedRows) {
      const k = String(row[key] || "Unknown")
      sums[k] = (sums[k] || 0) + Number(row[valueKey] || 0)
      counts[k] = (counts[k] || 0) + 1
    }
    const result: Record<string, number> = {}
    for (const k in sums) result[k] = sums[k] / (counts[k] || 1)
    return result
  }

  const maxKey = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || ""

  const minKey = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => a[1] - b[1])[0]?.[0] || ""

  const totalRevenueRM = normalizedRows.reduce((s, r) => s + Number(r.revenue_rm || 0), 0)
  const totalCogsRM = normalizedRows.reduce((s, r) => s + Number(r.cogs_rm || 0), 0)
  const totalGrossProfitRM = normalizedRows.reduce((s, r) => s + Number(r.gross_profit_rm || 0), 0)
  const grossMarginPct = totalRevenueRM > 0 ? (totalGrossProfitRM / totalRevenueRM) * 100 : 0
  const cogsAsRevenueRatioPct = totalRevenueRM > 0 ? (totalCogsRM / totalRevenueRM) * 100 : 0
  const totalTransactions = normalizedRows.length
  const avgDiscountPct = totalTransactions > 0 ? normalizedRows.reduce((s, r) => s + Number(r.discount_pct || 0), 0) / totalTransactions : 0

  const revenueByLocation = groupSum("location", "revenue_rm")
  const revenueByChannel = groupSum("channel", "revenue_rm")
  const revenueByMonth = groupSum("month", "revenue_rm")
  const revenueByYear = groupSum("year", "revenue_rm")
  const revenueByQuarter = groupSum("quarter", "revenue_rm")
  const revenueByDayOfWeek = groupAvg("day_of_week", "revenue_rm")

  const allItems = groupSum("item", "revenue_rm")
  const revenueByItem = Object.fromEntries(
    Object.entries(allItems)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
  )

  const numLocations = Object.keys(revenueByLocation).length
  const dates = normalizedRows.map((r) => String(r.date || "2024-01-01")).sort()
  const dateRange = dates.length > 0 ? `${dates[0]} to ${dates[dates.length - 1]}` : "N/A"

  const monthlyTotals: Record<string, number> = {}
  for (const row of normalizedRows) {
    const key = `${row.year || "2024"}-${String(row.month || "01").padStart(2, "0")}`
    monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(row.revenue_rm || 0)
  }
  const monthlyValues = Object.values(monthlyTotals)
  const numMonths = Math.max(1, monthlyValues.length)
  const avgMonthlyRevenueRM = totalRevenueRM / numMonths
  const avgRevenuePerLocationRM = numLocations > 0 ? avgMonthlyRevenueRM / numLocations : 0

  const mean = monthlyValues.length > 0 ? monthlyValues.reduce((a, b) => a + b, 0) / numMonths : 0
  const stdDev = monthlyValues.length > 0 
    ? Math.sqrt(monthlyValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / numMonths)
    : 0
  const threshold = mean - 1.5 * stdDev
  const anomalies: string[] = []
  for (const [period, value] of Object.entries(monthlyTotals)) {
    if (value < threshold) {
      const pctBelow = mean > 0 ? (((mean - value) / mean) * 100).toFixed(0) : "0"
      anomalies.push(
        `${period}: Revenue dropped to RM${value.toLocaleString("en-MY", { maximumFractionDigits: 0 })} (${pctBelow}% below average)`,
      )
    }
  }

  const years = Object.keys(revenueByYear).map(Number).sort()
  const latestYear = years[years.length - 1]
  const prevYear = years[years.length - 2]
  const yoyGrowthPct = prevYear && revenueByYear[prevYear] > 0
    ? ((revenueByYear[latestYear] - revenueByYear[prevYear]) / revenueByYear[prevYear]) * 100
    : 0

  // --- PROFIT FIRST LOGIC (Deterministic Formula) ---
  // Real Revenue = Total Income - COGS (Materials/Subcontractors)
  const realRevenueRM = totalRevenueRM - totalCogsRM;
  
  // Target Allocation Percentages (TAPs) based on typical SME ($0-250k range)
  const profitTargetPct = 0.05; // 5%
  const ownerPayTargetPct = 0.50; // 50%
  const taxTargetPct = 0.15; // 15%
  const opexTargetPct = 0.30; // 30%

  const profitAllocationRM = realRevenueRM * profitTargetPct;
  const ownerPayRM = realRevenueRM * ownerPayTargetPct;
  const taxAllocationRM = realRevenueRM * taxTargetPct;
  const opexRM = realRevenueRM * opexTargetPct;

  // Determine Status (Health check)
  // If OpEx is > 40% of Real Revenue, it's At Risk. If > 55%, Critical.
  const opexRatio = realRevenueRM > 0 ? opexRM / realRevenueRM : 0;
  let profitFirstStatus: "healthy" | "at_risk" | "critical" = "healthy";
  if (opexRatio > 0.55) profitFirstStatus = "critical";
  else if (opexRatio > 0.40) profitFirstStatus = "at_risk";

  return {
    totalRevenueRM: Math.round(totalRevenueRM * 100) / 100,
    totalCogsRM: Math.round(totalCogsRM * 100) / 100,
    totalGrossProfitRM: Math.round(totalGrossProfitRM * 100) / 100,
    grossMarginPct: Math.round(grossMarginPct * 10) / 10,
    avgMonthlyRevenueRM: Math.round(avgMonthlyRevenueRM * 100) / 100,
    totalTransactions,
    dateRange,
    numLocations,
    avgRevenuePerLocationRM: Math.round(avgRevenuePerLocationRM * 100) / 100,
    cogsAsRevenueRatioPct: Math.round(cogsAsRevenueRatioPct * 10) / 10,
    yoyGrowthPct: Math.round(yoyGrowthPct * 10) / 10,
    avgDiscountPct: Math.round(avgDiscountPct * 10) / 10,
    revenueByLocation,
    revenueByChannel,
    revenueByItem,
    revenueByDayOfWeek,
    revenueByMonth,
    revenueByYear,
    revenueByQuarter,
    bestLocation: maxKey(revenueByLocation),
    worstLocation: minKey(revenueByLocation),
    bestDay: maxKey(revenueByDayOfWeek),
    worstDay: minKey(revenueByDayOfWeek),
    bestChannel: maxKey(revenueByChannel),
    worstChannel: minKey(revenueByChannel),
    bestItem: maxKey(revenueByItem),
    anomalies,
    realRevenueRM: Math.round(realRevenueRM),
    profitAllocationRM: Math.round(profitAllocationRM),
    ownerPayRM: Math.round(ownerPayRM),
    taxAllocationRM: Math.round(taxAllocationRM),
    opexRM: Math.round(opexRM),
    profitFirstStatus,
  }
}
