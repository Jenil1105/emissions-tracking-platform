import type { AdjustedComplianceBalance, PoolResponse, Route } from "../../../core/domain/Route";

type PoolingPageProps = {
  routes: Route[];
  selectedYear: string;
  adjustedBalances: AdjustedComplianceBalance[];
  selectedRouteIds: string[];
  poolResult: PoolResponse | null;
  loading: boolean;
  error: string;
  onYearChange: (year: string) => void;
  onRouteToggle: (routeId: string) => void;
  onCreatePool: () => void;
};

function PoolingPage({
  routes,
  selectedYear,
  adjustedBalances,
  selectedRouteIds,
  poolResult,
  loading,
  error,
  onYearChange,
  onRouteToggle,
  onCreatePool,
}: PoolingPageProps) {
  const yearOptions = Array.from(new Set(routes.map((route) => String(route.year))));
  const selectedMembers = adjustedBalances.filter((balance) => selectedRouteIds.includes(balance.routeId));
  const poolSum = selectedMembers.reduce((sum, member) => sum + member.adjustedCb, 0);
  const isPoolValid = selectedMembers.length > 0 && poolSum >= 0;

  return (
    <>
      <h2>Pooling Page</h2>

      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <select value={selectedYear} onChange={(event) => onYearChange(event.target.value)}>
          <option value="">Select Year</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading pooling data...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && adjustedBalances.length > 0 && (
        <>
          <div style={{ marginBottom: "20px" }}>
            {adjustedBalances.map((balance) => (
              <label key={balance.routeId} style={{ display: "block", marginBottom: "8px" }}>
                <input
                  checked={selectedRouteIds.includes(balance.routeId)}
                  onChange={() => onRouteToggle(balance.routeId)}
                  type="checkbox"
                />{" "}
                {balance.routeId} - CB Before: {balance.cbBefore.toFixed(2)} - Adjusted CB: {balance.adjustedCb.toFixed(2)}
              </label>
            ))}
          </div>

          <p style={{ color: isPoolValid ? "#2e7d32" : "#c62828", marginBottom: "16px" }}>
            Pool Sum: {poolSum.toFixed(2)} {isPoolValid ? "(Valid)" : "(Invalid)"}
          </p>

          <button disabled={!isPoolValid} onClick={onCreatePool}>Create Pool</button>
        </>
      )}

      {poolResult && (
        <div style={{ marginTop: "20px" }}>
          <h3>Pool Result</h3>
          <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Route ID</th>
                <th>CB Before</th>
                <th>CB After</th>
              </tr>
            </thead>
            <tbody>
              {poolResult.members.map((member) => (
                <tr key={member.routeId}>
                  <td>{member.routeId}</td>
                  <td>{member.cbBefore.toFixed(2)}</td>
                  <td>{member.cbAfter.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default PoolingPage;
