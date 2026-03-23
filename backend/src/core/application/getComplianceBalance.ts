import type { ShipComplianceRepository } from "../ports/shipComplianceRepository";
import type { RouteRepository } from "../ports/routeRepository";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class GetComplianceBalance {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly shipComplianceRepository: ShipComplianceRepository
  ) {}

  async execute(shipId: string, year: number) {
    const route = await this.routeRepository.getByShipIdAndYear(shipId, year);

    if (!route) {
      return undefined;
    }

    const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
    const complianceBalance = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;

    await this.shipComplianceRepository.saveSnapshot({
      shipId,
      year,
      cbGco2eq: complianceBalance,
      ghgIntensity: route.ghgIntensity,
      energyInScope,
    });

    return {
      shipId,
      routeId: route.routeId,
      year,
      ghgIntensity: route.ghgIntensity,
      energyInScope,
      complianceBalance,
      cbBefore: complianceBalance,
    };
  }
}
