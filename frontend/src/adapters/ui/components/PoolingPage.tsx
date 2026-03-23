import type { AdjustedComplianceBalance, PoolResponse, Route } from "../../../core/domain/Route";

type PoolingPageProps = {
  routes: Route[];
  selectedYear: string;
  adjustedBalances: AdjustedComplianceBalance[];
  selectedMembers: AdjustedComplianceBalance[];
  selectedShipIds: string[];
  poolResult: PoolResponse | null;
  loading: boolean;
  error: string;
  onYearChange: (year: string) => void;
  onShipToggle: (shipId: string) => void;
  onCreatePool: () => void;
};

const fieldClass = "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.12)]";

function PoolingPage({
  routes,
  selectedYear,
  adjustedBalances,
  selectedMembers,
  selectedShipIds,
  poolResult,
  loading,
  error,
  onYearChange,
  onShipToggle,
  onCreatePool,
}: PoolingPageProps) {
  const yearOptions = Array.from(new Set(routes.map((route) => String(route.year))));
  const poolSum = selectedMembers.reduce((sum, member) => sum + member.cbAfterBanking, 0);
  const isPoolValid = selectedMembers.length > 0 && poolSum >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-teal-700">Pooling</p>
          <h2 className="mt-2 font-serif text-3xl text-slate-900">Ship balancing studio</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Combine ship balances for a chosen year and verify that the final pool stays non-negative before saving it.
          </p>
        </div>
        <select className={`${fieldClass} min-w-44`} value={selectedYear} onChange={(event) => onYearChange(event.target.value)}>
          <option value="">Select Year</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">Loading pooling data...</p>}
      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</p>}

      {!loading && !error && adjustedBalances.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl text-slate-900">Select ship members</h3>
                <p className="mt-1 text-sm text-slate-600">Choose the ship balances that should enter the pool.</p>
              </div>
              <span className={[
                "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
                isPoolValid ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800",
              ].join(" ")}>
                Pool sum {poolSum.toFixed(2)}
              </span>
            </div>
            <div className="space-y-3">
              {adjustedBalances.map((balance) => {
                const isSelected = selectedShipIds.includes(balance.shipId);

                return (
                  <label
                    key={balance.shipId}
                    className={[
                      "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition",
                      isSelected ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-slate-50/70 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <input
                      checked={isSelected}
                      className="mt-1 h-4 w-4 accent-[#0f766e]"
                      onChange={() => onShipToggle(balance.shipId)}
                      type="checkbox"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-semibold text-slate-900">{balance.shipId} ({balance.routeId})</span>
                        <span className="text-sm text-slate-600">After banking {balance.cbAfterBanking.toFixed(2)}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        CB Before {balance.cbBefore.toFixed(2)} | Banked {balance.banked.toFixed(2)} | Applied {balance.applied.toFixed(2)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
              <h3 className="font-serif text-2xl text-slate-900">Pool decision</h3>
              <p className="mt-2 text-sm text-slate-600">Selected ships: {selectedMembers.length}</p>
              <p className="mt-1 text-sm text-slate-600">Member list: {selectedMembers.map((member) => member.shipId).join(", ") || "None"}</p>
              <p className="mt-1 text-sm text-slate-600">Combined adjusted CB: {poolSum.toFixed(2)}</p>
              <button
                className="mt-5 rounded-2xl bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b615a] disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!isPoolValid}
                onClick={onCreatePool}
                type="button"
              >
                Create pool
              </button>
            </div>

            {poolResult && (
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h3 className="font-serif text-2xl text-slate-900">Pool result</h3>
                  <p className="mt-1 text-sm text-slate-600">Stored pool #{poolResult.id} for {poolResult.year}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Ship</th>
                        <th className="px-5 py-4">Route</th>
                        <th className="px-5 py-4">CB Before</th>
                        <th className="px-5 py-4">CB After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poolResult.members.map((member) => (
                        <tr key={member.shipId} className="border-t border-slate-100 hover:bg-slate-50/80">
                          <td className="px-5 py-4 font-semibold text-slate-900">{member.shipId}</td>
                          <td className="px-5 py-4 font-semibold text-slate-900">{member.routeId}</td>
                          <td className="px-5 py-4">{member.cbBefore.toFixed(2)}</td>
                          <td className="px-5 py-4">{member.cbAfter.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PoolingPage;
