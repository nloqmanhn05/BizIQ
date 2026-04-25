import { ParsedCSVData, SimulationResult } from "../types/index";
import { computeSimulation } from "./simulatorEngine";

const STORAGE_KEY = "biziq_local_business_preset_v2";

type LocalPresetPayload = {
  sessionId: string;
  uploadedAt: string;
  parsedData: ParsedCSVData;
  baselineSimulation: SimulationResult;
  previewKPIs: {
    totalRevenueRM: number;
    totalCogsRM: number;
    grossMarginPct: number;
    bestLocation: string;
    worstLocation: string;
    totalTransactions: number;
    dateRange: string;
    yoyGrowthPct: number;
    realRevenueRM: number;
    avgMonthlyRevenueRM: number;
    profitFirstStatus: "healthy" | "at_risk" | "critical";
  };
};

function createParsedData(): ParsedCSVData {
  const totalRevenueRM = 29470;
  const totalCogsRM = 25666;
  const totalGrossProfitRM = totalRevenueRM - totalCogsRM;
  const grossMarginPct = Number(((totalGrossProfitRM / totalRevenueRM) * 100).toFixed(1));
  const avgMonthlyRevenueRM = 29470;
  const totalTransactions = 30;
  const realRevenueRM = totalRevenueRM - totalCogsRM;

  return {
    totalRevenueRM,
    totalCogsRM,
    totalGrossProfitRM,
    grossMarginPct,
    avgMonthlyRevenueRM,
    totalTransactions,
    dateRange: "2026-03-01 to 2026-03-30",
    numLocations: 1,
    avgRevenuePerLocationRM: 29470,
    cogsAsRevenueRatioPct: Number(((totalCogsRM / totalRevenueRM) * 100).toFixed(1)),
    yoyGrowthPct: 0,
    avgDiscountPct: 0,
    revenueByLocation: {
      Unknown: 29470,
    },
    revenueByChannel: {
      Unknown: 29470,
    },
    revenueByItem: {
      Sneakers: 11280,
      Jeans: 12460,
      Jacket: 4400,
      "T-Shirt": 850,
      Cap: 480,
    },
    revenueByDayOfWeek: {
      Unknown: 982.33,
    },
    revenueByMonth: {
      Unknown: 29470,
    },
    revenueByYear: {
      Unknown: 29470,
    },
    revenueByQuarter: {
      Unknown: 29470,
    },
    bestLocation: "Main Branch",
    worstLocation: "Online Store",
    bestDay: "Friday",
    worstDay: "Monday",
    bestChannel: "In-Store",
    worstChannel: "Marketplace",
    bestItem: "Jeans",
    anomalies: [],
    realRevenueRM,
    profitAllocationRM: Number((realRevenueRM * 0.05).toFixed(0)),
    ownerPayRM: Number((realRevenueRM * 0.5).toFixed(0)),
    taxAllocationRM: Number((realRevenueRM * 0.15).toFixed(0)),
    opexRM: Number((realRevenueRM * 0.3).toFixed(0)),
    profitFirstStatus: "at_risk",
  };
}

function createPresetPayload(): LocalPresetPayload {
  const parsedData = createParsedData();
  const baselineSimulation = computeSimulation(parsedData, {
    priceChangePct: 0,
    cogsChangePct: 0,
    marketingChangePct: 0,
  });

  return {
    sessionId: "local-sales-analysis-session",
    uploadedAt: new Date().toISOString(),
    parsedData,
    baselineSimulation,
    previewKPIs: {
      totalRevenueRM: parsedData.totalRevenueRM,
      totalCogsRM: parsedData.totalCogsRM,
      grossMarginPct: parsedData.grossMarginPct,
      bestLocation: parsedData.bestLocation,
      worstLocation: parsedData.worstLocation,
      totalTransactions: parsedData.totalTransactions,
      dateRange: parsedData.dateRange,
      yoyGrowthPct: parsedData.yoyGrowthPct,
      realRevenueRM: parsedData.realRevenueRM,
      avgMonthlyRevenueRM: parsedData.avgMonthlyRevenueRM,
      profitFirstStatus: parsedData.profitFirstStatus,
    },
  };
}

export function ensureLocalPresetData(): LocalPresetPayload {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return JSON.parse(existing) as LocalPresetPayload;
  }

  const payload = createPresetPayload();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function getLocalPresetData(): LocalPresetPayload {
  return ensureLocalPresetData();
}
