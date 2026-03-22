import { useEffect, useState } from "react";
import "./App.css";

type Route = {
  id: number;
  routeId: string;
  shipId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
};

type ComparisonRoute = Route & {
  percentDiff: number;
  compliant: boolean;
};

type ComparisonResponse = {
  baseline: Route;
  comparisonRoutes: ComparisonRoute[];
};

function App() {
  const [activePage, setActivePage] = useState<"routes" | "compare">("routes");

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [vesselType, setVesselType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [year, setYear] = useState("");

  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState("");

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (vesselType) {
        params.append("vesselType", vesselType);
      }

      if (fuelType) {
        params.append("fuelType", fuelType);
      }

      if (year) {
        params.append("year", year);
      }

      const url = `http://localhost:3000/routes${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }

      const data = await response.json();
      setRoutes(data);
    } catch (err) {
      setError("Could not load routes");
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    try {
      setComparisonLoading(true);
      setComparisonError("");

      const response = await fetch("http://localhost:3000/routes/comparison");

      if (!response.ok) {
        throw new Error("Failed to fetch comparison");
      }

      const data = await response.json();
      setComparisonData(data);
    } catch (err) {
      setComparisonError("Could not load comparison data");
    } finally {
      setComparisonLoading(false);
    }
  };

  const setBaseline = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/routes/${id}/baseline`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to set baseline");
      }

      await fetchRoutes();
      await fetchComparison();
    } catch (err) {
      setError("Could not update baseline");
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [vesselType, fuelType, year]);

  useEffect(() => {
    fetchComparison();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h1>FuelEU Dashboard</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <button onClick={() => setActivePage("routes")}>Routes</button>
        <button onClick={() => setActivePage("compare")}>Compare</button>
      </div>

      {activePage === "routes" && (
        <>
          <h2>Routes Page</h2>

          <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
            <select value={vesselType} onChange={(e) => setVesselType(e.target.value)}>
              <option value="">All Vessel Types</option>
              <option value="Container">Container</option>
              <option value="BulkCarrier">BulkCarrier</option>
              <option value="Tanker">Tanker</option>
              <option value="RoRo">RoRo</option>
            </select>

            <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
              <option value="">All Fuel Types</option>
              <option value="HFO">HFO</option>
              <option value="LNG">LNG</option>
              <option value="MGO">MGO</option>
            </select>

            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {loading && <p>Loading routes...</p>}
          {error && <p>{error}</p>}

          {!loading && !error && (
            <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th>Route ID</th>
                  <th>Ship ID</th>
                  <th>Vessel Type</th>
                  <th>Fuel Type</th>
                  <th>Year</th>
                  <th>GHG Intensity</th>
                  <th>Fuel Consumption</th>
                  <th>Distance</th>
                  <th>Total Emissions</th>
                  <th>Baseline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id}>
                    <td>{route.routeId}</td>
                    <td>{route.shipId}</td>
                    <td>{route.vesselType}</td>
                    <td>{route.fuelType}</td>
                    <td>{route.year}</td>
                    <td>{route.ghgIntensity}</td>
                    <td>{route.fuelConsumption}</td>
                    <td>{route.distance}</td>
                    <td>{route.totalEmissions}</td>
                    <td>{route.isBaseline ? "Yes" : "No"}</td>
                    <td>
                      {route.isBaseline ? (
                        "Current Baseline"
                      ) : (
                        <button onClick={() => setBaseline(route.id)}>
                          Set Baseline
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activePage === "compare" && (
        <>
          <h2>Compare Page</h2>

          {comparisonLoading && <p>Loading comparison...</p>}
          {comparisonError && <p>{comparisonError}</p>}

          {!comparisonLoading && !comparisonError && comparisonData && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <h3>Baseline Route</h3>
                <p>Route ID: {comparisonData.baseline.routeId}</p>
                <p>Ship ID: {comparisonData.baseline.shipId}</p>
                <p>GHG Intensity: {comparisonData.baseline.ghgIntensity}</p>
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
      )}
    </div>
  );
}

export default App;
