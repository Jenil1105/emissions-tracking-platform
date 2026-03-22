import type { ComparisonResponse } from "../../../core/domain/Route";

type ComparePageProps = {
  comparisonData: ComparisonResponse | null;
  loading: boolean;
  error: string;
};

function ComparePage({ comparisonData, loading, error }: ComparePageProps) {
  const chartData = comparisonData
    ? [
        {
          label: `${comparisonData.baseline.routeId} (Baseline)`,
          value: comparisonData.baseline.ghgIntensity,
          compliant: comparisonData.baseline.ghgIntensity <= 89.3368,
        },
        ...comparisonData.comparisonRoutes.map((route) => ({
          label: route.routeId,
          value: route.ghgIntensity,
          compliant: route.compliant,
        })),
      ]
    : [];

  const maxValue =
    chartData.length > 0 ? Math.max(...chartData.map((item) => item.value)) : 0;

  return (
    <>
      <h2>Compare Page</h2>

      {loading && <p>Loading comparison...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && comparisonData && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <h3>Baseline Route</h3>
            <p>Route ID: {comparisonData.baseline.routeId}</p>
            <p>Ship ID: {comparisonData.baseline.shipId}</p>
            <p>GHG Intensity: {comparisonData.baseline.ghgIntensity}</p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h3>GHG Intensity Chart</h3>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {chartData.map((item) => {
                const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                return (
                  <div key={item.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                        fontSize: "14px",
                      }}
                    >
                      <span>{item.label}</span>
                      <span>
                        {item.value} gCO2e/MJ {item.compliant ? "(Compliant)" : "(Non-compliant)"}
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "20px",
                        backgroundColor: "#f1f1f1",
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPercent}%`,
                          height: "100%",
                          backgroundColor: item.compliant ? "#2e7d32" : "#c62828",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Route ID</th>
                <th>Ship ID</th>
                <th>GHG Intensity</th>
                <th>% Difference</th>
                <th>Compliant</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.comparisonRoutes.map((route) => (
                <tr key={route.id}>
                  <td>{route.routeId}</td>
                  <td>{route.shipId}</td>
                  <td>{route.ghgIntensity}</td>
                  <td>{route.percentDiff.toFixed(2)}%</td>
                  <td>{route.compliant ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

export default ComparePage;
