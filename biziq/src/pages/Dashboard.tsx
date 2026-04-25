import { useSession } from "../context/SessionContext";
import { Link } from "react-router";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export function Dashboard() {
  const { previewKPIs, sessionId, simulationResult } = useSession();

  if (!sessionId || !previewKPIs) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center mb-6 shadow-sm">
          <span className="material-symbols-outlined text-[40px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
        </div>
        <h2 className="font-display-sm text-3xl md:text-4xl text-on-surface mb-4">No Data Uploaded</h2>
        <p className="font-body-lg text-on-surface-variant max-w-md mb-8">
          Upload your business data (Excel/CSV) to unlock your professional "Profit First" dashboard.
        </p>
        <Link to="/upload" className="bg-primary text-on-primary font-label-lg rounded-full px-8 py-3 hover:opacity-90 transition-opacity">
          Upload Data
        </Link>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat('en-MY', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(val || 0);
    return `RM ${formatted}`;
  };

  // Mocking the distribution for the chart based on the server-calculated realRevenue
  // In a real app, these would come from the full data, but for the preview, we follow the book formula
  const realRev = previewKPIs.realRevenueRM || 0;
  const allocationData = [
    { name: 'Profit (5%)', value: Math.round(realRev * 0.05), color: '#1A7A4A' },
    { name: "Owner's Pay (50%)", value: Math.round(realRev * 0.50), color: 'var(--color-primary)' },
    { name: 'Tax (15%)', value: Math.round(realRev * 0.15), color: 'var(--color-tertiary)' },
    { name: 'OpEx (30%)', value: Math.round(realRev * 0.30), color: 'var(--color-error)' },
  ];

  const statusColors = {
    healthy: "bg-green-100 text-green-700 border-green-200",
    at_risk: "bg-amber-100 text-amber-700 border-amber-200",
    critical: "bg-red-100 text-red-700 border-red-200",
  };

  const statusLabels = {
    healthy: "Healthy",
    at_risk: "At Risk",
    critical: "Critical",
  };

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display-sm text-3xl md:text-4xl text-on-surface">Financial Health</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[previewKPIs.profitFirstStatus || 'healthy']}`}>
              {statusLabels[previewKPIs.profitFirstStatus || 'healthy']}
            </span>
          </div>
          <p className="text-on-surface-variant font-body-lg">
            Calculated using the <strong>Profit First</strong> deterministic framework.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/simulator" className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            Run Simulation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left: Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-[28px] p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <h3 className="font-label-lg text-on-surface-variant mb-1">Real Revenue</h3>
            <div className="font-headline-lg text-3xl text-on-surface font-bold mb-2">{formatCurrency(previewKPIs.realRevenueRM)}</div>
            <p className="text-[11px] text-on-surface-variant leading-tight">
              Total Sales minus Materials/Subcontractors. This is the actual money your business "owns".
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-[28px] p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-600"></div>
            <h3 className="font-label-lg text-on-surface-variant mb-1">Target Profit (5%)</h3>
            <div className="font-headline-lg text-3xl text-green-700 font-bold mb-2">{formatCurrency(realRev * 0.05)}</div>
            <p className="text-[11px] text-on-surface-variant leading-tight">
              Money set aside immediately for the business owners. Profit is not what's "left over".
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-[28px] p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-tertiary"></div>
            <h3 className="font-label-lg text-on-surface-variant mb-1">Tax Allocation</h3>
            <div className="font-headline-lg text-3xl text-on-surface font-bold mb-2">{formatCurrency(realRev * 0.15)}</div>
            <p className="text-[11px] text-on-surface-variant leading-tight">
              Reserved for government obligations to avoid end-of-year cash flow shocks.
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-[28px] p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
            <h3 className="font-label-lg text-on-surface-variant mb-1">OpEx Budget</h3>
            <div className="font-headline-lg text-3xl text-on-surface font-bold mb-2">{formatCurrency(realRev * 0.30)}</div>
            <p className="text-[11px] text-on-surface-variant leading-tight">
              The maximum you should spend on rent, utilities, and marketing to stay healthy.
            </p>
          </div>
        </div>

        {/* Right: Allocation Chart */}
        <div className="bg-surface-container-lowest rounded-[28px] p-8 border border-outline-variant/30 shadow-sm flex flex-col items-center">
          <h3 className="font-title-md text-on-surface mb-6 w-full text-center">Allocation Breakdown</h3>
          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 w-full">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] font-medium text-on-surface-variant truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30">
        <h3 className="font-title-lg text-on-surface mb-4">Standard Business Benchmarks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-1">Gross Margin</span>
            <span className="text-2xl font-bold text-primary">{previewKPIs.grossMarginPct}%</span>
            <span className="text-[11px] text-on-surface-variant">Industry Average: 65%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-1">YoY Growth</span>
            <span className="text-2xl font-bold text-primary">{previewKPIs.yoyGrowthPct}%</span>
            <span className="text-[11px] text-on-surface-variant">Target: +15%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-1">Avg Transaction</span>
            <span className="text-2xl font-bold text-primary">RM {(previewKPIs.totalRevenueRM / previewKPIs.totalTransactions).toFixed(2)}</span>
            <span className="text-[11px] text-on-surface-variant">Total Records: {previewKPIs.totalTransactions}</span>
          </div>
        </div>
      </div>

      {simulationResult && (
        <div className="mt-8 bg-surface-container-lowest rounded-[24px] p-6 border border-outline-variant/30">
          <h3 className="font-title-lg text-on-surface mb-4">Business Theory Item Segments</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-container mb-2">Profitable Items</p>
              <div className="flex flex-wrap gap-2">
                {simulationResult.segments.cashCows.map((item) => (
                  <span key={item} className="px-2 py-1 rounded-md bg-primary-container/10 border border-primary-container/20 text-xs text-on-surface">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-error mb-2">Lost Items</p>
              <div className="flex flex-wrap gap-2">
                {simulationResult.segments.lossMakers.map((item) => (
                  <span key={item} className="px-2 py-1 rounded-md bg-error-container/20 border border-error-container/30 text-xs text-on-surface">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-2">Potential Items</p>
              <div className="flex flex-wrap gap-2">
                {simulationResult.segments.risingStars.map((item) => (
                  <span key={item} className="px-2 py-1 rounded-md bg-green-100 border border-green-200 text-xs text-on-surface">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

