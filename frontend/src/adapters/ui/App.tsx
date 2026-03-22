import { useEffect, useMemo, useState } from "react";
import type {
  BankingRecordsResponse,
  ComparisonResponse,
  ComplianceBalanceResponse,
  Route,
} from "../../core/domain/Route";
import { RouteDashboardService } from "../../core/application/RouteDashboardService";
import { HttpRouteGateway } from "../infrastructure/HttpRouteGateway";
import BankingPage from "./components/BankingPage";
import ComparePage from "./components/ComparePage";
import PageTabs from "./components/PageTabs";
import RoutesPage from "./components/RoutesPage";
import "../../App.css";

function App() {
  const [activePage, setActivePage] = useState<"routes" | "compare" | "banking">("routes");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [year, setYear] = useState("");
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState("");
  const [selectedShipId, setSelectedShipId] = useState("");
  const [selectedBankingYear, setSelectedBankingYear] = useState("");
  const [complianceBalance, setComplianceBalance] = useState<ComplianceBalanceResponse | null>(null);
  const [bankingRecords, setBankingRecords] = useState<BankingRecordsResponse | null>(null);
  const [bankingLoading, setBankingLoading] = useState(false);
  const [bankingError, setBankingError] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [applyAmount, setApplyAmount] = useState("");

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

  const fetchBankingData = async (shipId: string, year: string) => {
    if (!shipId || !year) {
      return;
    }

    try {
      setBankingLoading(true);
      setBankingError("");

      const [nextComplianceBalance, nextBankingRecords] = await Promise.all([
        routeDashboardService.getComplianceBalance(shipId, Number(year)),
        routeDashboardService.getBankingRecords(shipId, Number(year)),
      ]);

      setComplianceBalance(nextComplianceBalance);
      setBankingRecords(nextBankingRecords);
    } catch {
      setBankingError("Could not load banking data");
    } finally {
      setBankingLoading(false);
    }
  };

  const handleBank = async () => {
    if (!selectedShipId || !selectedBankingYear) {
      return;
    }

    try {
      setBankingError("");
      await routeDashboardService.bankSurplus(
        selectedShipId,
        Number(selectedBankingYear),
        bankAmount ? Number(bankAmount) : undefined
      );
      await fetchBankingData(selectedShipId, selectedBankingYear);
      setBankAmount("");
    } catch {
      setBankingError("Could not bank surplus");
    }
  };

  const handleApply = async () => {
    if (!selectedShipId || !selectedBankingYear || !applyAmount) {
      return;
    }

    try {
      setBankingError("");
      await routeDashboardService.applyBanked(
        selectedShipId,
        Number(selectedBankingYear),
        Number(applyAmount)
      );
      await fetchBankingData(selectedShipId, selectedBankingYear);
      setApplyAmount("");
    } catch {
      setBankingError("Could not apply banked surplus");
    }
  };

  useEffect(() => {
    void fetchRoutes();
  }, [vesselType, fuelType, year]);

  useEffect(() => {
    void fetchComparison();
  }, []);

  useEffect(() => {
    void fetchBankingData(selectedShipId, selectedBankingYear);
  }, [selectedShipId, selectedBankingYear]);

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

      {activePage === "banking" && (
        <BankingPage
          applyAmount={applyAmount}
          bankingRecords={bankingRecords}
          bankAmount={bankAmount}
          complianceBalance={complianceBalance}
          error={bankingError}
          loading={bankingLoading}
          onApply={() => void handleApply()}
          onApplyAmountChange={setApplyAmount}
          onBank={() => void handleBank()}
          onBankAmountChange={setBankAmount}
          onShipChange={setSelectedShipId}
          onYearChange={setSelectedBankingYear}
          routes={routes}
          selectedShipId={selectedShipId}
          selectedYear={selectedBankingYear}
        />
      )}
    </div>
  );
}

export default App;
