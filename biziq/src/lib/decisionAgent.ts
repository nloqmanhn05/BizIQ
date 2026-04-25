import { DecisionCard } from "../types/index"

export async function runDecisionAgent(
  analystContext: string,
  callGLM: (messages: { role: string; content: string }[]) => Promise<string>,
): Promise<DecisionCard[]> {
  const systemPrompt = `You are a senior business analyst specializing in Malaysian SME F&B businesses in Kuala Lumpur.
You have been given real extracted KPIs from an uploaded business CSV dataset.
Your job is to generate exactly 3 actionable Decision Cards.

STRICT RULES:
- Every decision MUST reference specific RM numbers from the analyst data
- Every decision MUST compare against a Malaysia F&B benchmark number  
- Every decision MUST include a realistic RM monthly impact estimate
- Decisions must address the WORST performing areas shown in the data
- Do NOT give generic advice — be specific to these actual numbers
- Output ONLY a valid raw JSON array. No markdown. No explanation. No backticks.`

  const userPrompt = `REAL BUSINESS DATA:
${analystContext}

MALAYSIA F&B BENCHMARKS (KL):
- Average Gross Margin: 65.0%
- Average Monthly Revenue per Location: RM180,000
- Average COGS: 35.0% of revenue
- Average Weekend Premium: 28.0% above weekdays
- Average Delivery Split: 35.0% of total revenue

Generate exactly 3 Decision Cards as a JSON array:
[
  {
    "id": "decision_001",
    "title": "Short action title max 8 words",
    "priority": "high",
    "evidence": [
      "Specific data point with actual RM figure from the dataset",
      "Second data point with actual number from the dataset",
      "Benchmark comparison with actual benchmark value"
    ],
    "impactRMMonthly": 0000,
    "impactDescription": "One sentence with specific RM figure and timeframe",
    "confidencePct": 00,
    "actionSteps": [
      "Step 1 specific and actionable",
      "Step 2 specific and actionable",
      "Step 3 specific and actionable"
    ],
    "reasoning": "2-3 sentences explaining why using the specific numbers above"
  }
]

Priorities: first card high, second medium, third low.`

  let raw = await callGLM([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ])

  raw = raw.replace(/```json/g, "").replace(/```/g, "").trim()

  try {
    return JSON.parse(raw) as DecisionCard[]
  } catch {
    const retry = await callGLM([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
      { role: "assistant", content: raw },
      { role: "user", content: "Output ONLY the raw JSON array. No text before or after it." },
    ])
    return JSON.parse(retry.replace(/```json/g, "").replace(/```/g, "").trim()) as DecisionCard[]
  }
}
