import type { PoolRepository } from "../ports/poolRepository";
import type { RouteRepository } from "../ports/routeRepository";
import type { BankingRepository } from "../ports/bankingRepository";
const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class CreatePool {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly poolRepository: PoolRepository,
    private readonly bankingRepository: BankingRepository
  ) {}

  async execute(year: number, shipIds: string[]) {
    const routes = (await this.routeRepository.getByYear(year))
      .filter((route) => shipIds.includes(route.shipId));

    if (routes.length !== shipIds.length) {
      return { error: "Some ships were not found for the selected year" };
    }

    const members = await Promise.all(routes.map(async (route) => {
      const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
      const cbBefore = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
      const records = await this.bankingRepository.getRecords(route.shipId, year);
      const banked = records
        .filter((record) => record.type === "BANK")
        .reduce((sum, record) => sum + record.amount, 0);
      const applied = records
        .filter((record) => record.type === "APPLY")
        .reduce((sum, record) => sum + record.amount, 0);

      return {
        shipId: route.shipId,
        routeId: route.routeId,
        cbBefore: cbBefore - banked + applied,
        cbAfter: cbBefore - banked + applied,
      };
    }));

    const total = members.reduce((sum, member) => sum + member.cbBefore, 0);

    if (total < 0) {
      return { error: "Pool sum must be zero or positive" };
    }

    const surplusMembers = [...members]
      .filter((member) => member.cbBefore > 0)
      .sort((left, right) => right.cbBefore - left.cbBefore);
    const deficitMembers = [...members]
      .filter((member) => member.cbBefore < 0)
      .sort((left, right) => left.cbBefore - right.cbBefore);

    for (const deficit of deficitMembers) {
      let remainingDeficit = Math.abs(deficit.cbAfter);

      for (const surplus of surplusMembers) {
        if (remainingDeficit <= 0) {
          break;
        }

        const transferable = Math.min(surplus.cbAfter, remainingDeficit);

        if (transferable <= 0) {
          continue;
        }

        surplus.cbAfter -= transferable;
        deficit.cbAfter += transferable;
        remainingDeficit -= transferable;
      }
    }

    const invalidDeficit = members.some((member) => member.cbBefore < 0 && member.cbAfter < member.cbBefore);
    if (invalidDeficit) {
      return { error: "Deficit ship cannot exit worse after pooling" };
    }

    const invalidSurplus = members.some((member) => member.cbBefore > 0 && member.cbAfter < 0);
    if (invalidSurplus) {
      return { error: "Surplus ship cannot exit negative after pooling" };
    }

    return this.poolRepository.create(year, members);
  }
}
