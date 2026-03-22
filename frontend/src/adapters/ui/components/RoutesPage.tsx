import type { Route } from "../../../core/domain/Route";

type RoutesPageProps = {
  routes: Route[];
  loading: boolean;
  error: string;
  vesselType: string;
  fuelType: string;
  year: string;
  onVesselTypeChange: (value: string) => void;
  onFuelTypeChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSetBaseline: (routeId: string) => void;
};

function RoutesPage({
  routes,
  loading,
  error,
  vesselType,
  fuelType,
  year,
  onVesselTypeChange,
  onFuelTypeChange,
  onYearChange,
  onSetBaseline,
}: RoutesPageProps) {
  return (
    <>
      <h2>Routes Page</h2>

      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <select value={vesselType} onChange={(event) => onVesselTypeChange(event.target.value)}>
          <option value="">All Vessel Types</option>
          <option value="Container">Container</option>
          <option value="BulkCarrier">BulkCarrier</option>
          <option value="Tanker">Tanker</option>
          <option value="RoRo">RoRo</option>
        </select>

        <select value={fuelType} onChange={(event) => onFuelTypeChange(event.target.value)}>
          <option value="">All Fuel Types</option>
          <option value="HFO">HFO</option>
          <option value="LNG">LNG</option>
          <option value="MGO">MGO</option>
        </select>

        <select value={year} onChange={(event) => onYearChange(event.target.value)}>
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
                    <button onClick={() => onSetBaseline(route.routeId)}>Set Baseline</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default RoutesPage;
