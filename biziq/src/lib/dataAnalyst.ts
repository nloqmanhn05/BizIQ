import { ParsedCSVData } from "../types/index"
import { MALAYSIA_FNB_BENCHMARKS as B } from "./benchmarks"

export function runDataAnalyst(data: ParsedCSVData): string {
  const marginGap = data.grossMarginPct - B.avgGrossMarginPct
  const cogsGap = data.cogsAsRevenueRatioPct - B.avgCogsPct
  const revenueGapPerLocation = data.avgRevenuePerLocationRM - B.avgMonthlyRevenuePerLocationRM
  const grabRevenue = data.revenueByChannel["Grab Food"] ?? 0
  const deliverySplitPct = (grabRevenue / data.totalRevenueRM) * 100

  const weekendDays = ["Saturday", "Sunday"]
  const weekdayDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const weekendAvg =
    weekendDays.reduce((s, d) => s + (data.revenueByDayOfWeek[d] ?? 0), 0) / weekendDays.length
  const weekdayAvg =
    weekdayDays.reduce((s, d) => s + (data.revenueByDayOfWeek[d] ?? 0), 0) / weekdayDays.length
  const weekendPremiumPct = ((weekendAvg - weekdayAvg) / weekdayAvg) * 100

  const fmt = (n: number) => n.toLocaleString("en-MY", { maximumFractionDigits: 0 })
  const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`

  const locationList = Object.entries(data.revenueByLocation)
    .map(([loc, rev]) => `  - ${loc}: RM${fmt(rev)}`)
    .join("\n")

  const channelList = Object.entries(data.revenueByChannel)
    .map(
      ([ch, rev]) =>
        `  - ${ch}: RM${fmt(rev)} (${((rev / data.totalRevenueRM) * 100).toFixed(1)}%)`,
    )
    .join("\n")

  const dayList = Object.entries(data.revenueByDayOfWeek)
    .map(([d, avg]) => `  - ${d}: RM${fmt(avg)} avg/day`)
    .join("\n")

  const top5Items = Object.entries(data.revenueByItem)
    .slice(0, 5)
    .map(([item, rev]) => `  - ${item}: RM${fmt(rev)}`)
    .join("\n")

  const yearList = Object.entries(data.revenueByYear)
    .sort()
    .map(([y, rev]) => `  - ${y}: RM${fmt(rev)}`)
    .join("\n")

  return `=== BUSINESS DATA ANALYSIS (BrightBite Cafe, Kuala Lumpur) ===

OVERVIEW:
- Date Range: ${data.dateRange}
- Total Transactions: ${fmt(data.totalTransactions)}
- Number of Locations: ${data.numLocations}

REVENUE PERFORMANCE:
- Total Revenue (all time): RM${fmt(data.totalRevenueRM)}
- Average Monthly Revenue: RM${fmt(data.avgMonthlyRevenueRM)}
- Avg Revenue per Location/Month: RM${fmt(data.avgRevenuePerLocationRM)}
- YoY Growth (latest year): ${fmtPct(data.yoyGrowthPct)}
- Revenue by Year:
${yearList}

LOCATION BREAKDOWN:
- Best Location: ${data.bestLocation} — RM${fmt(data.revenueByLocation[data.bestLocation])}
- Worst Location: ${data.worstLocation} — RM${fmt(data.revenueByLocation[data.worstLocation])}
- All Locations:
${locationList}
- Revenue gap vs benchmark (RM${fmt(B.avgMonthlyRevenuePerLocationRM)}/location/month): RM${fmt(revenueGapPerLocation)} per location per month

PROFITABILITY:
- Gross Margin: ${data.grossMarginPct}%
- Industry Benchmark: ${B.avgGrossMarginPct}%
- Margin Gap: ${fmtPct(marginGap)} (${marginGap >= 0 ? "above" : "below"} benchmark)
- COGS Ratio: ${data.cogsAsRevenueRatioPct}%
- COGS Benchmark: ${B.avgCogsPct}%
- COGS Gap: ${fmtPct(cogsGap)} (${cogsGap > 0 ? "higher" : "lower"} than benchmark)

SALES CHANNELS:
- Best Channel: ${data.bestChannel}
- Delivery (Grab Food) Split: ${deliverySplitPct.toFixed(1)}% (Benchmark: ${B.avgDeliveryRevenueSplitPct}%)
- All Channels:
${channelList}

DAY OF WEEK:
- Best Day: ${data.bestDay}
- Worst Day: ${data.worstDay}
- Weekend Premium vs Weekdays: ${weekendPremiumPct.toFixed(1)}% (Benchmark: ${B.avgWeekendRevenuePremiumPct}%)
- Revenue by Day:
${dayList}

TOP MENU ITEMS:
- Best Item: ${data.bestItem}
- Top 5 Items:
${top5Items}

ANOMALIES DETECTED:
${data.anomalies.length > 0 ? data.anomalies.join("\n") : "No significant anomalies detected"}`
}
