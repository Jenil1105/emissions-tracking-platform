import type { RouteRepository } from "../ports/routeRepository";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class GetComplianceBalance {
  constructor(private readonly routeRepository: RouteRepository) {}

  execute(shipId: string, year: number) {
    const route = this.routeRepository.findByShipAndYear(shipId, year);

    if (!route) {
      return undefined;
    }

    const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
    const complianceBalance =
      (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;

    return {
      shipId: route.shipId,
      year: route.year,
      ghgIntensity: route.ghgIntensity,
      energyInScope,
      complianceBalance,
    };
  }
}
