import type { BankingRepository } from "../ports/bankingRepository";
import type { RouteRepository } from "../ports/routeRepository";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class BankSurplus {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankingRepository: BankingRepository
  ) {}

  async execute(year: number, amount?: number) {
    const routes = await this.routeRepository.getByYear(year);

    if (routes.length === 0) {
      return { error: "No routes found for the selected year" };
    }

    const cbBefore = routes.reduce((sum, route) => {
      const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
      return sum + (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
    }, 0);
    const existingRecords = await this.bankingRepository.getRecords(year);
    const banked = existingRecords
      .filter((record) => record.type === "BANK")
      .reduce((sum, record) => sum + record.amount, 0);
    const applied = existingRecords
      .filter((record) => record.type === "APPLY")
      .reduce((sum, record) => sum + record.amount, 0);
    const cbAfter = cbBefore - banked + applied;

    if (cbAfter <= 0) {
      return { error: "Only positive compliance balance can be banked" };
    }

    const bankAmount = amount ?? cbAfter;

    if (bankAmount <= 0 || bankAmount > cbAfter) {
      return { error: "Invalid bank amount" };
    }

    const record = await this.bankingRepository.create(year, bankAmount, "BANK");
    const totalBanked = banked + bankAmount - applied;

    return {
      year,
      record,
      cbBefore,
      applied,
      cbAfter: cbAfter - bankAmount,
      totalBanked,
    };
  }
}
