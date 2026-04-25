import XLSX from "xlsx";
import * as fs from "fs";

const filePath = "c:\\Users\\Imika\\UM Z.AI\\sales_analysis.xlsx";

try {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);
  
  // Calculate basic KPIs for the preset
  const totalRevenue = rows.reduce((sum, r) => sum + (Number(r.Revenue) || 0), 0);
  const totalCost = rows.reduce((sum, r) => sum + (Number(r.Cost) || 0), 0);
  const totalProfit = rows.reduce((sum, r) => sum + (Number(r.Profit) || 0), 0);
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  // Find best location/item
  const items = rows.reduce((acc: any, r: any) => {
    acc[r.Product] = (acc[r.Product] || 0) + (Number(r.Profit) || 0);
    return acc;
  }, {});
  const bestItem = Object.entries(items).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "General";

  const preset = {
    sessionId: "sales-analysis-preset",
    previewKPIs: {
      totalRevenueRM: Math.round(totalRevenue),
      realRevenueRM: Math.round(totalRevenue * 0.7),
      grossMarginPct: Math.round(margin * 10) / 10,
      bestLocation: bestItem,
      profitFirstStatus: "Needs Optimization",
      yoyGrowthPct: 12.5
    },
    baselineSimulation: {
      baseline: { monthlyRevenueRM: Math.round(totalRevenue / 3), marginPct: Math.round(margin), deltaRevenueRM: 0, deltaProfitRM: 0, deltaMarginPct: 0 },
      pessimistic: { monthlyRevenueRM: Math.round(totalRevenue / 3.5), marginPct: Math.round(margin - 5), deltaRevenueRM: -5000, deltaProfitRM: -2000, deltaMarginPct: -5 },
      likely: { monthlyRevenueRM: Math.round(totalRevenue / 3), marginPct: Math.round(margin), deltaRevenueRM: 0, deltaProfitRM: 0, deltaMarginPct: 0 },
      optimistic: { monthlyRevenueRM: Math.round(totalRevenue / 2.5), marginPct: Math.round(margin + 5), deltaRevenueRM: 12000, deltaProfitRM: 6000, deltaMarginPct: 5 },
      sixMonthProjection: [
        { month: "Month 1", baseline: 10000, pessimistic: 9000, likely: 10500, optimistic: 12000 },
        { month: "Month 2", baseline: 10500, pessimistic: 8500, likely: 11000, optimistic: 13500 },
        { month: "Month 3", baseline: 11000, pessimistic: 8000, likely: 11500, optimistic: 15000 },
        { month: "Month 4", baseline: 11500, pessimistic: 7500, likely: 12000, optimistic: 17000 },
        { month: "Month 5", baseline: 12000, pessimistic: 7000, likely: 12500, optimistic: 19500 },
        { month: "Month 6", baseline: 12500, pessimistic: 6500, likely: 13000, optimistic: 22000 },
      ],
      params: { priceChangePct: 0, cogsChangePct: 0, marketingChangePct: 0 },
      report: "### BUSINESS THEORY ANALYSIS\n\nBased on your sales analysis, your **" + bestItem + "** is the primary profit driver. However, the overall gross margin of **" + Math.round(margin) + "%** suggests high COGS pressure.",
      segments: {
        lossMakers: ["Low Margin Accessories"],
        cashCows: [bestItem, "Main Category"],
        risingStars: ["New Season Lineup"]
      }
    }
  };

  console.log("PRESET_START");
  console.log(JSON.stringify(preset, null, 2));
  console.log("PRESET_END");
} catch (err) {
  console.error(err);
}
