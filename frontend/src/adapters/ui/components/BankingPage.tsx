import type { BankingRecordsResponse, ComplianceBalanceResponse, Route } from "../../../core/domain/Route";

type BankingPageProps = {
  routes: Route[];
  selectedYear: string;
  complianceBalance: ComplianceBalanceResponse | null;
  bankingRecords: BankingRecordsResponse | null;
  loading: boolean;
  error: string;
  bankAmount: string;
  applyAmount: string;
  onYearChange: (year: string) => void;
  onBankAmountChange: (value: string) => void;
  onApplyAmountChange: (value: string) => void;
  onBank: () => void;
  onApply: () => void;
};

const fieldClass = "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.12)]";
const primaryButtonClass = "rounded-2xl bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b615a] disabled:cursor-not-allowed disabled:bg-slate-300";

function BankingPage({
  routes,
  selectedYear,
  complianceBalance,
  bankingRecords,
  loading,
  error,
  bankAmount,
  applyAmount,
  onYearChange,
  onBankAmountChange,
  onApplyAmountChange,
  onBank,
  onApply,
}: BankingPageProps) {
  const yearOptions = Array.from(new Set(routes.map((route) => String(route.year))));
  const canBank = (complianceBalance?.cbAfter ?? complianceBalance?.cbBefore ?? 0) > 0;
  const canApply = (complianceBalance?.cbAfter ?? complianceBalance?.cbBefore ?? 0) < 0
    && (bankingRecords?.totalBanked ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-700">Banking</p>
          <h2 className="mt-2 font-serif text-3xl text-slate-900">Yearly surplus control room</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review annual compliance balance, bank positive surplus, and apply stored balance when a year falls short.
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

      {loading && <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">Loading banking data...</p>}
      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</p>}

      {!loading && !error && complianceBalance && (
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-[1.5rem] border border-teal-100 bg-teal-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-teal-700">Year</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{complianceBalance.year}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">CB before</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{(complianceBalance.cbBefore ?? complianceBalance.complianceBalance).toFixed(2)}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">CB after</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{(complianceBalance.cbAfter ?? complianceBalance.complianceBalance).toFixed(2)}</p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-700">Banked total</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{(bankingRecords?.totalBanked ?? 0).toFixed(2)}</p>
          </div>
        </div>
      )}

      {!loading && !error && complianceBalance && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
            <h3 className="font-serif text-2xl text-slate-900">Balance snapshot</h3>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Compliance balance</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{complianceBalance.complianceBalance.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Energy in scope</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{complianceBalance.energyInScope.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Weighted GHG intensity</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{complianceBalance.ghgIntensity.toFixed(4)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
              <h3 className="font-serif text-2xl text-slate-900">Bank surplus</h3>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  className={`${fieldClass} flex-1`}
                  placeholder="Bank amount"
                  type="number"
                  value={bankAmount}
                  onChange={(event) => onBankAmountChange(event.target.value)}
                />
                <button className={primaryButtonClass} disabled={!canBank} onClick={onBank} type="button">
                  Bank surplus
                </button>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
              <h3 className="font-serif text-2xl text-slate-900">Apply banked</h3>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  className={`${fieldClass} flex-1`}
                  placeholder="Apply amount"
                  type="number"
                  value={applyAmount}
                  onChange={(event) => onApplyAmountChange(event.target.value)}
                />
                <button className={primaryButtonClass} disabled={!canApply} onClick={onApply} type="button">
                  Apply balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && bankingRecords && (
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Record</th>
                  <th className="px-5 py-4">Year</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Type</th>
                </tr>
              </thead>
              <tbody>
                {bankingRecords.records.map((record) => (
                  <tr key={record.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-semibold text-slate-900">#{record.id}</td>
                    <td className="px-5 py-4">{record.year}</td>
                    <td className="px-5 py-4">{record.amount}</td>
                    <td className="px-5 py-4">
                      <span className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        record.type === "BANK" ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800",
                      ].join(" ")}>
                        {record.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BankingPage;
