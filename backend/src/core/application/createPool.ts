import type { PoolRepository } from "../ports/poolRepository";
import type { RouteRepository } from "../ports/routeRepository";
import type { BankingRepository } from "../ports/bankingRepository";
import { distributeBankingToRoutes } from "./distributeBankingToRoutes";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class CreatePool {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly poolRepository: PoolRepository,
    private readonly bankingRepository: BankingRepository
  ) {}

  async execute(year: number, routeIds: string[]) {
    const routes = (await this.routeRepository.getByYear(year))
      .filter((route) => routeIds.includes(route.routeId));

    if (routes.length !== routeIds.length) {
      return { error: "Some routes were not found for the selected year" };
    }

    const baseBalances = routes.map((route) => {
      const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
      return {
        routeId: route.routeId,
        year: route.year,
        cbBefore: (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope,
      };
    });

    const records = await this.bankingRepository.getRecords();
    const appliedForYear = records
      .filter((record) => record.type === "APPLY" && record.year === year)
      .reduce((sum, record) => sum + record.amount, 0);
    const balancesAfterBanking = distributeBankingToRoutes(baseBalances, appliedForYear);

    const members = balancesAfterBanking.map((balance) => {
      return {
        routeId: balance.routeId,
        cbBefore: balance.cbAfterBanking,
        cbAfter: balance.cbAfterBanking,
      };
    });

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
      return { error: "Deficit route cannot exit worse after pooling" };
    }

    const invalidSurplus = members.some((member) => member.cbBefore > 0 && member.cbAfter < 0);
    if (invalidSurplus) {
      return { error: "Surplus route cannot exit negative after pooling" };
    }

    return this.poolRepository.create(year, members);
  }
}
