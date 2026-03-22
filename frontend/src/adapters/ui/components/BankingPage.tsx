import type { BankingRecordsResponse, ComplianceBalanceResponse, Route } from "../../../core/domain/Route";

type BankingPageProps = {
  routes: Route[];
  selectedYear: string;
  selectedShipId: string;
  complianceBalance: ComplianceBalanceResponse | null;
  bankingRecords: BankingRecordsResponse | null;
  loading: boolean;
  error: string;
  bankAmount: string;
  applyAmount: string;
  onYearChange: (year: string) => void;
  onShipChange: (shipId: string) => void;
  onBankAmountChange: (value: string) => void;
  onApplyAmountChange: (value: string) => void;
  onBank: () => void;
  onApply: () => void;
};

function BankingPage({
  routes,
  selectedYear,
  selectedShipId,
  complianceBalance,
  bankingRecords,
  loading,
  error,
  bankAmount,
  applyAmount,
  onYearChange,
  onShipChange,
  onBankAmountChange,
  onApplyAmountChange,
  onBank,
  onApply,
}: BankingPageProps) {
  const yearOptions = Array.from(new Set(routes.map((route) => String(route.year))));
  const shipOptions = routes.filter((route) => !selectedYear || String(route.year) === selectedYear);
  const canBank = (complianceBalance?.cbAfter ?? complianceBalance?.cbBefore ?? 0) > 0;
  const canApply = (complianceBalance?.cbAfter ?? complianceBalance?.cbBefore ?? 0) < 0
    && (bankingRecords?.totalBanked ?? 0) > 0;

  return (
    <>
      <h2>Banking Page</h2>

      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <select value={selectedYear} onChange={(event) => onYearChange(event.target.value)}>
          <option value="">Select Year</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select value={selectedShipId} onChange={(event) => onShipChange(event.target.value)}>
          <option value="">Select Ship</option>
          {shipOptions.map((route) => (
            <option key={`${route.year}-${route.shipId}`} value={route.shipId}>
              {route.shipId} ({route.routeId})
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading banking data...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && complianceBalance && (
        <div style={{ marginBottom: "20px" }}>
          <p>Ship ID: {complianceBalance.shipId}</p>
          <p>Route ID: {complianceBalance.routeId}</p>
          <p>CB Before: {complianceBalance.cbBefore.toFixed(2)}</p>
          <p>Applied: {(complianceBalance.applied ?? 0).toFixed(2)}</p>
          <p>CB After: {(complianceBalance.cbAfter ?? complianceBalance.cbBefore).toFixed(2)}</p>
          <p>Compliance Balance: {complianceBalance.complianceBalance.toFixed(2)}</p>
          <p>Energy In Scope: {complianceBalance.energyInScope.toFixed(2)}</p>
          <p>GHG Intensity: {complianceBalance.ghgIntensity}</p>
        </div>
      )}

      {!loading && !error && bankingRecords && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <p>Total Banked: {bankingRecords.totalBanked.toFixed(2)}</p>
          </div>

          <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
            <input
              placeholder="Bank amount"
              type="number"
              value={bankAmount}
              onChange={(event) => onBankAmountChange(event.target.value)}
            />
            <button disabled={!canBank} onClick={onBank}>Bank Surplus</button>
          </div>

          <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
            <input
              placeholder="Apply amount"
              type="number"
              value={applyAmount}
              onChange={(event) => onApplyAmountChange(event.target.value)}
            />
            <button disabled={!canApply} onClick={onApply}>Apply Banked</button>
          </div>

          <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ship ID</th>
                <th>Year</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {bankingRecords.records.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.shipId}</td>
                  <td>{record.year}</td>
                  <td>{record.amount}</td>
                  <td>{record.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

export default BankingPage;
