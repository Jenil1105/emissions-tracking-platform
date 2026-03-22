import { useEffect, useMemo, useState } from "react";
import type {
  AdjustedComplianceBalance,
  BankingRecordsResponse,
  ComparisonResponse,
  ComplianceBalanceResponse,
  PoolResponse,
  Route,
} from "../../core/domain/Route";
import { RouteDashboardService } from "../../core/application/RouteDashboardService";
import { HttpRouteGateway } from "../infrastructure/HttpRouteGateway";
import BankingPage from "./components/BankingPage";
import ComparePage from "./components/ComparePage";
import PageTabs from "./components/PageTabs";
import PoolingPage from "./components/PoolingPage";
import RoutesPage from "./components/RoutesPage";
import "../../App.css";

function App() {
  const [activePage, setActivePage] = useState<"routes" | "compare" | "banking" | "pooling">("routes");
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [year, setYear] = useState("");
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState("");
  const [selectedBankingYear, setSelectedBankingYear] = useState("");
  const [selectedBankingShipId, setSelectedBankingShipId] = useState("");
  const [complianceBalance, setComplianceBalance] = useState<ComplianceBalanceResponse | null>(null);
  const [bankingRecords, setBankingRecords] = useState<BankingRecordsResponse | null>(null);
  const [bankingLoading, setBankingLoading] = useState(false);
  const [bankingError, setBankingError] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [applyAmount, setApplyAmount] = useState("");
  const [selectedPoolingYear, setSelectedPoolingYear] = useState("");
  const [adjustedBalances, setAdjustedBalances] = useState<AdjustedComplianceBalance[]>([]);
  const [selectedShipIds, setSelectedShipIds] = useState<string[]>([]);
  const [poolResult, setPoolResult] = useState<PoolResponse | null>(null);
  const [poolingLoading, setPoolingLoading] = useState(false);
  const [poolingError, setPoolingError] = useState("");

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

  const fetchAllRoutes = async () => {
    try {
      const data = await routeDashboardService.getRoutes();
      setAllRoutes(data);
    } catch {
      // Keep the tab-specific loaders responsible for visible errors.
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

  const setBaseline = async (routeId: string) => {
    try {
      await routeDashboardService.setBaseline(routeId);
      await fetchRoutes();
      await fetchAllRoutes();
      await fetchComparison();
    } catch {
      setError("Could not update baseline");
    }
  };

  const fetchBankingData = async (shipId: string, year: string) => {
    if (!shipId || !year) {
      setComplianceBalance(null);
      setBankingRecords(null);
      return;
    }

    try {
      setBankingLoading(true);
      setBankingError("");

      const [nextComplianceBalance, nextBankingRecords] = await Promise.all([
        routeDashboardService.getComplianceBalance(shipId, Number(year)),
        routeDashboardService.getBankingRecords(shipId, Number(year)),
      ]);

      setComplianceBalance({
        ...nextComplianceBalance,
        applied: nextBankingRecords.applied,
        cbAfter: nextComplianceBalance.cbBefore - nextBankingRecords.totalBanked,
      });
      setBankingRecords(nextBankingRecords);
    } catch (error) {
      setBankingError(error instanceof Error ? error.message : "Could not load banking data");
    } finally {
      setBankingLoading(false);
    }
  };

  const handleBank = async () => {
    if (!selectedBankingShipId || !selectedBankingYear) {
      return;
    }

    try {
      setBankingError("");
      await routeDashboardService.bankSurplus(
        selectedBankingShipId,
        Number(selectedBankingYear),
        bankAmount ? Number(bankAmount) : undefined
      );
      await fetchBankingData(selectedBankingShipId, selectedBankingYear);
      setBankAmount("");
    } catch (error) {
      setBankingError(error instanceof Error ? error.message : "Could not bank surplus");
    }
  };

  const handleApply = async () => {
    if (!selectedBankingShipId || !selectedBankingYear || !applyAmount) {
      return;
    }

    try {
      setBankingError("");
      await routeDashboardService.applyBanked(
        selectedBankingShipId,
        Number(selectedBankingYear),
        Number(applyAmount)
      );
      await fetchBankingData(selectedBankingShipId, selectedBankingYear);
      setApplyAmount("");
    } catch (error) {
      setBankingError(error instanceof Error ? error.message : "Could not apply banked surplus");
    }
  };

  const fetchPoolingData = async (year: string) => {
    if (!year) {
      return;
    }

    try {
      setPoolingLoading(true);
      setPoolingError("");
      const data = await routeDashboardService.getAdjustedComplianceBalances(Number(year));
      setAdjustedBalances(data);
    } catch (error) {
      setPoolingError(error instanceof Error ? error.message : "Could not load pooling data");
    } finally {
      setPoolingLoading(false);
    }
  };

  const handleShipToggle = (shipId: string) => {
    setSelectedShipIds((current) =>
      current.includes(shipId)
        ? current.filter((id) => id !== shipId)
        : [...current, shipId]
    );
  };

  const handleCreatePool = async () => {
    if (!selectedPoolingYear || selectedShipIds.length === 0) {
      return;
    }

    try {
      setPoolingError("");
      const result = await routeDashboardService.createPool(Number(selectedPoolingYear), selectedShipIds);
      setPoolResult(result);
    } catch (error) {
      setPoolingError(error instanceof Error ? error.message : "Could not create pool");
    }
  };

  useEffect(() => {
    void fetchRoutes();
  }, [vesselType, fuelType, year]);

  useEffect(() => {
    void fetchAllRoutes();
  }, []);

  useEffect(() => {
    void fetchComparison();
  }, []);

  useEffect(() => {
    void fetchBankingData(selectedBankingShipId, selectedBankingYear);
  }, [selectedBankingShipId, selectedBankingYear]);

  useEffect(() => {
    void fetchPoolingData(selectedPoolingYear);
  }, [selectedPoolingYear]);

  useEffect(() => {
    setSelectedBankingShipId("");
    setComplianceBalance(null);
    setBankingRecords(null);
    setBankingError("");
  }, [selectedBankingYear]);

  useEffect(() => {
    setSelectedShipIds([]);
    setPoolResult(null);
    setPoolingError("");
  }, [selectedPoolingYear]);

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
          onSetBaseline={(routeId) => void setBaseline(routeId)}
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
          onShipChange={setSelectedBankingShipId}
          onYearChange={setSelectedBankingYear}
          routes={allRoutes}
          selectedShipId={selectedBankingShipId}
          selectedYear={selectedBankingYear}
        />
      )}

      {activePage === "pooling" && (
        <PoolingPage
          adjustedBalances={adjustedBalances}
          error={poolingError}
          loading={poolingLoading}
          onCreatePool={() => void handleCreatePool()}
          onShipToggle={handleShipToggle}
          onYearChange={setSelectedPoolingYear}
          poolResult={poolResult}
          routes={allRoutes}
          selectedShipIds={selectedShipIds}
          selectedYear={selectedPoolingYear}
        />
      )}
    </div>
  );
}

export default App;
