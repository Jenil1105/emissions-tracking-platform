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

const fieldClass = "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-teal-500 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.12)]";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-teal-700">Routes</p>
          <h2 className="mt-2 font-serif text-3xl text-slate-900">Operational route registry</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Filter the vessel mix, inspect emissions intensity, and choose the route that becomes the fleet comparison baseline.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <select className={fieldClass} value={vesselType} onChange={(event) => onVesselTypeChange(event.target.value)}>
            <option value="">All Vessel Types</option>
            <option value="Container">Container</option>
            <option value="BulkCarrier">Bulk Carrier</option>
            <option value="Tanker">Tanker</option>
            <option value="RoRo">RoRo</option>
          </select>
          <select className={fieldClass} value={fuelType} onChange={(event) => onFuelTypeChange(event.target.value)}>
            <option value="">All Fuel Types</option>
            <option value="HFO">HFO</option>
            <option value="LNG">LNG</option>
            <option value="MGO">MGO</option>
          </select>
          <select className={fieldClass} value={year} onChange={(event) => onYearChange(event.target.value)}>
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {loading && <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">Loading routes...</p>}
      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Route</th>
                  <th className="px-5 py-4">Ship</th>
                  <th className="px-5 py-4">Vessel</th>
                  <th className="px-5 py-4">Fuel</th>
                  <th className="px-5 py-4">Year</th>
                  <th className="px-5 py-4">GHG</th>
                  <th className="px-5 py-4">Fuel Use</th>
                  <th className="px-5 py-4">Distance</th>
                  <th className="px-5 py-4">Emissions</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-semibold text-slate-900">{route.routeId}</td>
                    <td className="px-5 py-4">{route.shipId}</td>
                    <td className="px-5 py-4">{route.vesselType}</td>
                    <td className="px-5 py-4">{route.fuelType}</td>
                    <td className="px-5 py-4">{route.year}</td>
                    <td className="px-5 py-4">{route.ghgIntensity}</td>
                    <td className="px-5 py-4">{route.fuelConsumption}</td>
                    <td className="px-5 py-4">{route.distance}</td>
                    <td className="px-5 py-4">{route.totalEmissions}</td>
                    <td className="px-5 py-4">
                      <span className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        route.isBaseline ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600",
                      ].join(" ")}>
                        {route.isBaseline ? "Baseline" : "Candidate"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {route.isBaseline ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Current baseline</span>
                      ) : (
                        <button
                          className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-800 transition hover:border-teal-300 hover:bg-teal-100"
                          onClick={() => onSetBaseline(route.routeId)}
                          type="button"
                        >
                          Set baseline
                        </button>
                      )}
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

export default RoutesPage;
