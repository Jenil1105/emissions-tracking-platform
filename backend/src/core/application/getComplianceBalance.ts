import type { RouteRepository } from "../ports/routeRepository";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class GetComplianceBalance {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(year: number) {
    const routes = await this.routeRepository.getByYear(year);

    if (routes.length === 0) {
      return undefined;
    }

    const energyInScope = routes.reduce(
      (sum, route) => sum + route.fuelConsumption * ENERGY_FACTOR,
      0
    );
    const complianceBalance = routes.reduce((sum, route) => {
      const routeEnergy = route.fuelConsumption * ENERGY_FACTOR;
      return sum + (TARGET_GHG_INTENSITY - route.ghgIntensity) * routeEnergy;
    }, 0);
    const ghgIntensity = energyInScope === 0 ? 0 : TARGET_GHG_INTENSITY - complianceBalance / energyInScope;

    return {
      year,
      ghgIntensity,
      energyInScope,
      complianceBalance,
    };
  }
}
