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
  const [complianceBalance, setComplianceBalance] = useState<ComplianceBalanceResponse | null>(null);
  const [bankingRecords, setBankingRecords] = useState<BankingRecordsResponse | null>(null);
  const [bankingLoading, setBankingLoading] = useState(false);
  const [bankingError, setBankingError] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [applyAmount, setApplyAmount] = useState("");
  const [selectedPoolingYear, setSelectedPoolingYear] = useState("");
  const [adjustedBalances, setAdjustedBalances] = useState<AdjustedComplianceBalance[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
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

  const fetchBankingData = async (year: string) => {
    if (!year) {
      setComplianceBalance(null);
      setBankingRecords(null);
      return;
    }

    try {
      setBankingLoading(true);
      setBankingError("");

      const [nextComplianceBalance, nextBankingRecords] = await Promise.all([
        routeDashboardService.getComplianceBalance(Number(year)),
        routeDashboardService.getBankingRecords(Number(year)),
      ]);

      setComplianceBalance({
        ...nextComplianceBalance,
        cbBefore: nextComplianceBalance.complianceBalance,
        applied: nextBankingRecords.applied,
        cbAfter: nextComplianceBalance.complianceBalance - nextBankingRecords.totalBanked,
      });
      setBankingRecords(nextBankingRecords);
    } catch (fetchError) {
      setBankingError(fetchError instanceof Error ? fetchError.message : "Could not load banking data");
    } finally {
      setBankingLoading(false);
    }
  };

  const handleBank = async () => {
    if (!selectedBankingYear) {
      return;
    }

    try {
      setBankingError("");
      await routeDashboardService.bankSurplus(
        Number(selectedBankingYear),
        bankAmount ? Number(bankAmount) : undefined
      );
      await fetchBankingData(selectedBankingYear);
      setBankAmount("");
    } catch (bankError) {
      setBankingError(bankError instanceof Error ? bankError.message : "Could not bank surplus");
    }
  };

  const handleApply = async () => {
    if (!selectedBankingYear || !applyAmount) {
      return;
    }

    try {
      setBankingError("");
      await routeDashboardService.applyBanked(
        Number(selectedBankingYear),
        Number(applyAmount)
      );
      await fetchBankingData(selectedBankingYear);
      setApplyAmount("");
    } catch (applyError) {
      setBankingError(applyError instanceof Error ? applyError.message : "Could not apply banked surplus");
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
    } catch (poolError) {
      setPoolingError(poolError instanceof Error ? poolError.message : "Could not load pooling data");
    } finally {
      setPoolingLoading(false);
    }
  };

  const handleRouteToggle = (routeId: string) => {
    setSelectedRouteIds((current) =>
      current.includes(routeId)
        ? current.filter((id) => id !== routeId)
        : [...current, routeId]
    );
  };

  const handleCreatePool = async () => {
    if (!selectedPoolingYear || selectedRouteIds.length === 0) {
      return;
    }

    try {
      setPoolingError("");
      const result = await routeDashboardService.createPool(Number(selectedPoolingYear), selectedRouteIds);
      setPoolResult(result);
    } catch (poolError) {
      setPoolingError(poolError instanceof Error ? poolError.message : "Could not create pool");
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
    void fetchBankingData(selectedBankingYear);
  }, [selectedBankingYear]);

  useEffect(() => {
    void fetchPoolingData(selectedPoolingYear);
  }, [selectedPoolingYear]);

  useEffect(() => {
    setComplianceBalance(null);
    setBankingRecords(null);
    setBankingError("");
  }, [selectedBankingYear]);

  useEffect(() => {
    setSelectedRouteIds([]);
    setPoolResult(null);
    setPoolingError("");
  }, [selectedPoolingYear]);

  const baselineRoute = allRoutes.find((route) => route.isBaseline);
  const totalYears = new Set(allRoutes.map((route) => route.year)).size;

  const content = (() => {
    switch (activePage) {
      case "routes":
        return (
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
        );
      case "compare":
        return <ComparePage comparisonData={comparisonData} error={comparisonError} loading={comparisonLoading} />;
      case "banking":
        return (
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
            onYearChange={setSelectedBankingYear}
            routes={allRoutes}
            selectedYear={selectedBankingYear}
          />
        );
      case "pooling":
        return (
          <PoolingPage
            adjustedBalances={adjustedBalances}
            error={poolingError}
            loading={poolingLoading}
            onCreatePool={() => void handleCreatePool()}
            onRouteToggle={handleRouteToggle}
            onYearChange={setSelectedPoolingYear}
            poolResult={poolResult}
            routes={allRoutes}
            selectedRouteIds={selectedRouteIds}
            selectedYear={selectedPoolingYear}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <div className="dashboard-shell min-h-screen text-ink">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-5 sm:px-4 lg:px-5">
        <section className="rounded-[28px] bg-white/80 p-5 shadow-panel backdrop-blur md:p-7 flex gap-20">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-tide/10 px-3 py-1 text-xs font-semibold text-tide">Varuna Marine Assignment</p>
            <h1 className="max-w-4xl font-display text-3xl font-bold leading-tight md:text-4xl">FuelEU compliance dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
              A clean operating dashboard for route monitoring, baseline comparison, yearly compliance balance, and pool creation.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-10">
            <KpiCard label="Routes in view" value={String(allRoutes.length)} accent="bg-tide" />
            <KpiCard label="Active baseline" value={baselineRoute?.routeId ?? "Not set"} accent="bg-coral" />
            <KpiCard label="Operational years" value={String(totalYears)} accent="bg-emerald" />
          </div>
        </section>

        <nav className="mt-5 flex flex-wrap justify-center gap-3 ">
          <PageTabs activePage={activePage} onPageChange={setActivePage} />
        </nav>

        {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <section className="mt-5 rounded-[28px] bg-white/85 p-5 shadow-panel backdrop-blur md:p-6">{content}</section>
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="min-w-[150px] rounded-3xl border border-slate-200 bg-foam p-4 md:min-h-0 md:flex-1 md:max-w-[200px]">
      <div className={`h-2 w-12 rounded-full ${accent}`} />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-display text-xl font-bold leading-none md:text-2xl">{value}</p>
    </div>
  );
}

export default App;
