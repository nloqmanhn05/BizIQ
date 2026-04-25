import { useState } from "react";
import { useSession } from "../context/SessionContext";
import { SimulationResult } from "../types/index";
import { getLocalPresetData } from "../lib/localBusinessPreset";
import { computeSimulation } from "../lib/simulatorEngine";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function Simulator() {
  const { sessionId, previewKPIs, simulationResult, setSimulationResult } = useSession();
  const [priceChangePct, setPriceChangePct] = useState(simulationResult?.params.priceChangePct ?? 0);
  const [cogsChangePct, setCogsChangePct] = useState(simulationResult?.params.cogsChangePct ?? 0);
  const [marketingChangePct, setMarketingChangePct] = useState(simulationResult?.params.marketingChangePct ?? 0);
  const [result, setResult] = useState<SimulationResult | null>(simulationResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const preset = getLocalPresetData();
      const res = computeSimulation(preset.parsedData, { priceChangePct, cogsChangePct, marketingChangePct });
      setResult(res);
      setSimulationResult(res); // Update cache
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="font-display-sm text-3xl md:text-4xl text-on-surface">What-If Scenario Planner</h1>
        <p className="font-body-lg text-on-surface-variant max-w-3xl">
          Adjust inputs below to simulate potential business outcomes across different confidence intervals.
        </p>
      </div>

      {/* Input Controls Card */}
      <div className="bg-surface-container-lowest rounded-[28px] p-8 shadow-sm border border-outline-variant/30 mb-8">
        <h3 className="font-title-lg text-xl font-medium text-on-surface mb-6">Simulation Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="font-label-lg font-medium text-on-surface-variant">Price Change %</label>
              <span className="font-label-lg text-primary-container font-bold">
                {priceChangePct > 0 ? "+" : ""}
                {priceChangePct}%
              </span>
            </div>
            <input type="range" min={-20} max={30} step={1} value={priceChangePct} onChange={(e) => setPriceChangePct(Number(e.target.value))} className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary-container" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="font-label-lg font-medium text-on-surface-variant">COGS Reduction %</label>
              <span className="font-label-lg text-primary-container font-bold">
                {cogsChangePct > 0 ? "+" : ""}
                {cogsChangePct}%
              </span>
            </div>
            <input type="range" min={-20} max={20} step={1} value={cogsChangePct} onChange={(e) => setCogsChangePct(Number(e.target.value))} className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary-container" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="font-label-lg font-medium text-on-surface-variant">Marketing Spend %</label>
              <span className="font-label-lg text-primary-container font-bold">
                {marketingChangePct > 0 ? "+" : ""}
                {marketingChangePct}%
              </span>
            </div>
            <input type="range" min={-50} max={100} step={5} value={marketingChangePct} onChange={(e) => setMarketingChangePct(Number(e.target.value))} className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary-container" />
          </div>

          <div className="flex flex-col gap-2 p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
            <label className="font-label-lg font-bold text-primary uppercase tracking-widest text-[10px] mb-2">Current Baseline (Local Data)</label>
            <div className="flex flex-col gap-1">
              <p className="font-body-md text-on-surface flex justify-between">
                <span>Monthly Revenue:</span>
                <span className="font-bold">RM {(previewKPIs as any)?.avgMonthlyRevenueRM?.toLocaleString("en-MY") ?? "0"}</span>
              </p>
              <p className="font-body-md text-on-surface flex justify-between">
                <span>Monthly Spend:</span>
                <span className="font-bold">RM {(previewKPIs as any)?.totalCogsRM?.toLocaleString("en-MY") ?? "0"}</span>
              </p>
              <p className="font-body-md text-on-surface flex justify-between">
                <span>Gross Margin:</span>
                <span className="font-bold">{(previewKPIs as any)?.grossMarginPct ?? "0"}%</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-4">
          <button onClick={() => { setResult(null); setPriceChangePct(0); setCogsChangePct(0); setMarketingChangePct(0); }} className="px-6 py-2.5 rounded-full border border-outline text-on-surface-variant font-label-lg font-medium hover:bg-surface-variant transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            Reset
          </button>
          <button onClick={handleSimulate} className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
            {loading ? (
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            )}
            Run Simulation
          </button>
        </div>
        {error && (
          <div className="mt-4 px-4 py-3 bg-error-container/20 border border-error-container rounded-xl text-on-error-container font-body-lg text-sm">
            {error}
          </div>
        )}
        {!sessionId && (
          <div className="mt-4 px-4 py-3 bg-primary-container/10 border border-primary-container/20 rounded-xl text-primary-container font-body-lg text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            Please upload a business dataset in the "Upload" section to see real projections.
          </div>
        )}
      </div>

      {/* Results Tonal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-error-container/20 rounded-[28px] p-6 border border-error-container relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
              <span className="material-symbols-outlined text-[20px]">trending_down</span>
            </div>
            <h4 className="font-title-lg text-lg font-semibold text-on-surface">Not Profitable Items</h4>
          </div>
          <div className="space-y-1">
            <p className="font-label-lg text-sm text-on-surface-variant italic">Revenue at Risk</p>
            <p className="font-headline-lg text-3xl text-on-surface font-semibold">
              RM {result ? result.pessimistic.monthlyRevenueRM.toLocaleString("en-MY") : "0"}
            </p>
            {result && (
              <>
                <p className="font-label-lg text-sm text-on-surface-variant">
                  {result.pessimistic.deltaRevenueRM >= 0 ? "+" : ""}RM{result.pessimistic.deltaRevenueRM.toLocaleString("en-MY")} vs baseline
                </p>
                <p className="font-label-lg text-sm text-on-surface-variant">{result.pessimistic.marginPct}% margin</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-primary-fixed-dim/20 rounded-[28px] p-6 border border-primary-fixed relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-container"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h4 className="font-title-lg text-lg font-bold text-on-surface">Most Profitable Items</h4>
          </div>
          <div className="space-y-1">
            <p className="font-label-lg text-sm text-on-surface-variant italic">Top 20% Cash Cows</p>
            <p className="font-headline-lg text-3xl text-primary-container font-bold">
              RM {result ? result.likely.monthlyRevenueRM.toLocaleString("en-MY") : "0"}
            </p>
            {result && (
              <>
                <p className="font-label-lg text-sm text-on-surface-variant">
                  {result.likely.deltaRevenueRM >= 0 ? "+" : ""}RM{result.likely.deltaRevenueRM.toLocaleString("en-MY")} vs baseline
                </p>
                <p className="font-label-lg text-sm text-on-surface-variant">{result.likely.marginPct}% margin</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-tertiary-fixed/30 rounded-[28px] p-6 border border-tertiary-fixed relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim flex items-center justify-center text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
            <h4 className="font-title-lg text-lg font-semibold text-on-surface">Potential Items</h4>
          </div>
          <div className="space-y-1">
            <p className="font-label-lg text-sm text-on-surface-variant italic">High Growth Stars</p>
            <p className="font-headline-lg text-3xl text-on-surface font-semibold">
              RM {result ? result.optimistic.monthlyRevenueRM.toLocaleString("en-MY") : "0"}
            </p>
            {result && (
              <>
                <p className="font-label-lg text-sm text-on-surface-variant">
                  {result.optimistic.deltaRevenueRM >= 0 ? "+" : ""}RM{result.optimistic.deltaRevenueRM.toLocaleString("en-MY")} vs baseline
                </p>
                <p className="font-label-lg text-sm text-on-surface-variant">{result.optimistic.marginPct}% margin</p>
              </>
            )}
          </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-surface-container-lowest rounded-[28px] p-6 shadow-sm border border-outline-variant/30">
            <h3 className="font-title-lg text-xl font-medium text-on-surface mb-6">6-Month Revenue Projection</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={result.sixMonthProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} />
                <YAxis tickFormatter={(v) => `RM${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }} />
                <Tooltip formatter={(v: number) => [`RM${v.toLocaleString("en-MY")}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="baseline" stroke="var(--color-outline)" strokeWidth={1} strokeDasharray="4 4" name="Baseline" dot={false} />
                <Line type="monotone" dataKey="pessimistic" stroke="var(--color-error)" strokeWidth={2} name="Not Profitable" dot={false} />
                <Line type="monotone" dataKey="likely" stroke="var(--color-primary-container)" strokeWidth={3} name="Most Profitable" dot={false} />
                <Line type="monotone" dataKey="optimistic" stroke="#1A7A4A" strokeWidth={2} name="Potential Items" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-surface-container rounded-[20px] border border-outline-variant/30 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[20px] text-primary-container">analytics</span>
                <span className="font-label-lg text-sm font-semibold text-primary-container uppercase tracking-widest">Business Theory Report</span>
              </div>
              <div className="font-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line prose prose-sm max-w-none">
                {result.report}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[20px] border border-outline-variant/30 p-6">
              <h4 className="font-title-sm text-on-surface mb-4">Strategic Product Segments</h4>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-error uppercase tracking-tighter">Not Profitable Items</span>
                  <div className="flex flex-wrap gap-2">
                    {result.segments.lossMakers.map(s => (
                      <span key={s} className="px-2 py-1 rounded-md bg-error-container/10 border border-error-container/20 text-[11px] text-on-surface">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-primary-container uppercase tracking-tighter">Cash Cows</span>
                  <div className="flex flex-wrap gap-2">
                    {result.segments.cashCows.map(s => (
                      <span key={s} className="px-2 py-1 rounded-md bg-primary-container/10 border border-primary-container/20 text-[11px] text-on-surface">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">Rising Stars</span>
                  <div className="flex flex-wrap gap-2">
                    {result.segments.risingStars.map(s => (
                      <span key={s} className="px-2 py-1 rounded-md bg-green-100 border border-green-200 text-[11px] text-on-surface">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
