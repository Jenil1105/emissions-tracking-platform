import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ComparisonResponse } from "../../../core/domain/Route";

type ComparePageProps = {
  comparisonData: ComparisonResponse | null;
  loading: boolean;
  error: string;
};

const TARGET_GHG_INTENSITY = 89.3368;

function ComparePage({ comparisonData, loading, error }: ComparePageProps) {
  const chartData = comparisonData
    ? [
        {
          routeId: comparisonData.baseline.routeId,
          intensity: comparisonData.baseline.ghgIntensity,
          compliant: comparisonData.baseline.ghgIntensity <= TARGET_GHG_INTENSITY,
          kind: "baseline",
        },
        ...comparisonData.comparisonRoutes.map((route) => ({
          routeId: route.routeId,
          intensity: route.ghgIntensity,
          compliant: route.compliant,
          kind: "comparison",
        })),
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-700">Compare</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Baseline comparison</h2>
        <p className="mt-2 text-slate-600">Target intensity is fixed at {TARGET_GHG_INTENSITY} gCO2e/MJ.</p>
      </div>

      {loading || !comparisonData ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">Loading comparison...</p>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Baseline route</p>
            <p className="mt-2 font-display text-2xl font-bold text-slate-900">{comparisonData.baseline.routeId}</p>
            <p className="mt-2 text-slate-600">Intensity: {comparisonData.baseline.ghgIntensity.toFixed(4)} gCO2e/MJ</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-x-auto rounded-3xl border border-slate-200 p-4">
              <table className="min-w-full text-sm text-slate-700">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-3">Route</th>
                    <th className="pb-3">GHG Intensity</th>
                    <th className="pb-3">% Difference</th>
                    <th className="pb-3">Compliant</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.comparisonRoutes.map((item) => (
                    <tr key={item.routeId} className="border-t border-slate-100">
                      <td className="py-3 font-semibold text-slate-900">{item.routeId}</td>
                      <td className="py-3">{item.ghgIntensity.toFixed(4)}</td>
                      <td className="py-3">{item.percentDiff.toFixed(2)}%</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.compliant ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                          {item.compliant ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="h-88 rounded-3xl border border-slate-200 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="routeId" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 18px 60px rgba(15,23,42,0.08)" }}
                    formatter={(value) => [typeof value === "number" ? `${value.toFixed(4)} gCO2e/MJ` : "-", "Intensity"]}
                  />
                  <ReferenceLine y={TARGET_GHG_INTENSITY} stroke="#ff0026" strokeDasharray="6 6"  />
                  <Bar dataKey="intensity" radius={[12, 12, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.routeId} fill={entry.kind === "baseline" ? "#0f766e" : entry.compliant ? "#059669" : "#f97316"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ComparePage;
