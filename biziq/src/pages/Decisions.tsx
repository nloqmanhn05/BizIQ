import clsx from "clsx";
import { useSession } from "../context/SessionContext";

interface StrategicAction {
  id: string;
  title: string;
  category: "Profit" | "Efficiency" | "Growth";
  priority: "high" | "medium" | "low";
  impactDescription: string;
  mathBasis: string;
  steps: string[];
}

export function Decisions() {
  const { previewKPIs, sessionId } = useSession();

  if (!sessionId || !previewKPIs) return null;

  // DETERMINISTIC BUSINESS STRATEGY GENERATOR (Pareto / 80-20 Rule)
  const generateRoadmap = (): StrategicAction[] => {
    const actions: StrategicAction[] = [];
    const rev = previewKPIs.totalRevenueRM;

    // Action 1: The 80/20 Profit Driver
    actions.push({
      id: "pareto-1",
      title: `Optimize ${previewKPIs.bestLocation} Operations`,
      category: "Profit",
      priority: "high",
      impactDescription: `Focusing on your top performer can protect RM${(rev * 0.4).toLocaleString()} in revenue.`,
      mathBasis: "Pareto Analysis: Your top location typically generates 40-60% of total stable cash flow.",
      steps: [
        "Audit inventory levels at this branch to prevent stock-outs.",
        "Implement a 'Best Practices' manual derived from this location for others.",
        "Review staff-to-revenue ratios during peak hours."
      ]
    });

    // Action 2: Loss Prevention (Pessimistic focus)
    const lossRisk = previewKPIs.profitFirstStatus === "critical" ? "high" : "medium";
    actions.push({
      id: "loss-1",
      title: "Margin Correction Protocol",
      category: "Efficiency",
      priority: lossRisk,
      impactDescription: `Stabilizing your ${previewKPIs.grossMarginPct}% margin to industry benchmark (65%).`,
      mathBasis: `Current Margin Gap: ${Math.max(0, 65 - previewKPIs.grossMarginPct)}%. Fixes here go directly to Net Profit.`,
      steps: [
        "Identify the bottom 10% of products by margin.",
        "Negotiate bulk discounts for the top 3 most expensive ingredients.",
        "Eliminate menu items with a food cost ratio higher than 45%."
      ]
    });

    // Action 3: Growth (Rising Stars)
    actions.push({
      id: "growth-1",
      title: "Channel Expansion Strategy",
      category: "Growth",
      priority: "medium",
      impactDescription: `Leveraging your ${previewKPIs.yoyGrowthPct}% growth rate for new market entry.`,
      mathBasis: "Linear Projection: Consistent growth indicates a scalable business model.",
      steps: [
        "Test a new 'Mini' format in a neighboring high-traffic area.",
        "Run a targeted 14-day promotion for your 'Rising Star' products.",
        "Collect customer feedback specifically on the newest location."
      ]
    });

    return actions;
  };

  const roadmap = generateRoadmap();

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display-sm text-3xl md:text-4xl text-on-surface mb-2">Strategic Roadmap</h1>
        <p className="font-body-lg text-on-surface-variant max-w-3xl">
          Deterministic business actions derived from <strong>Pareto (80/20) Analysis</strong> and <strong>Profit First</strong> formulas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {roadmap.map((action) => (
          <div
            key={action.id}
            className={clsx(
              "bg-surface-container-lowest shadow-sm rounded-3xl p-8 border-l-8 border-y border-r border-outline-variant/30",
              action.priority === "high" && "border-l-primary",
              action.priority === "medium" && "border-l-tertiary",
              action.priority === "low" && "border-l-outline",
            )}
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    action.category === "Profit" && "bg-green-100 text-green-700",
                    action.category === "Efficiency" && "bg-blue-100 text-blue-700",
                    action.category === "Growth" && "bg-purple-100 text-purple-700",
                  )}>
                    {action.category}
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {action.priority} Impact
                  </span>
                </div>
                
                <h3 className="font-display-sm text-2xl text-on-surface mb-4">{action.title}</h3>
                <p className="font-body-lg text-on-surface-variant mb-6 text-lg">{action.impactDescription}</p>
                
                <div className="bg-surface-container rounded-2xl p-4 mb-6 border border-outline-variant/30">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <span className="material-symbols-outlined text-[18px]">calculate</span>
                    <span className="font-label-lg text-sm font-bold uppercase">Business Theory Basis</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant italic">{action.mathBasis}</p>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="font-label-lg text-on-surface font-bold uppercase tracking-widest mb-4">Recommended Steps</h4>
                <div className="space-y-4">
                  {action.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="font-body-md text-on-surface-variant leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
