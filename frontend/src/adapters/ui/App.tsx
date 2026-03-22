import { useEffect, useMemo, useState } from "react";
import type { ComparisonResponse, Route } from "../../core/domain/Route";
import { RouteDashboardService } from "../../core/application/RouteDashboardService";
import { HttpRouteGateway } from "../infrastructure/HttpRouteGateway";
import ComparePage from "./components/ComparePage";
import PageTabs from "./components/PageTabs";
import RoutesPage from "./components/RoutesPage";
import "../../App.css";

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

  const routeDashboardService = useMemo(() => {
    return new RouteDashboardService(new HttpRouteGateway());
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await routeDashboardService.getRoutes({
        vesselType,
        fuelType,
        year,
      });

      setRoutes(data);
    } catch {
      setError("Could not load routes");
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    try {
      setComparisonLoading(true);
      setComparisonError("");

      const data = await routeDashboardService.getComparison();
      setComparisonData(data);
    } catch {
      setComparisonError("Could not load comparison data");
    } finally {
      setComparisonLoading(false);
    }
  };

  const setBaseline = async (id: number) => {
    try {
      await routeDashboardService.setBaseline(id);
      await fetchRoutes();
      await fetchComparison();
    } catch {
      setError("Could not update baseline");
    }
  };

  useEffect(() => {
    void fetchRoutes();
  }, [vesselType, fuelType, year]);

  useEffect(() => {
    void fetchComparison();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h1>FuelEU Dashboard</h1>

      <PageTabs activePage={activePage} onPageChange={setActivePage} />

      {activePage === "routes" && (
        <RoutesPage
          error={error}
          fuelType={fuelType}
          loading={loading}
          onFuelTypeChange={setFuelType}
          onSetBaseline={(id) => void setBaseline(id)}
          onVesselTypeChange={setVesselType}
          onYearChange={setYear}
          routes={routes}
          vesselType={vesselType}
          year={year}
        />
      )}

      {activePage === "compare" && (
        <ComparePage comparisonData={comparisonData} error={comparisonError} loading={comparisonLoading} />
      )}
    </div>
  );
}

export default App;
