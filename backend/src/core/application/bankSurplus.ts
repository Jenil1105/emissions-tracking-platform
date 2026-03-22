import type { BankingRepository } from "../ports/bankingRepository";
import type { RouteRepository } from "../ports/routeRepository";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class BankSurplus {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankingRepository: BankingRepository
  ) {}

  execute(shipId: string, year: number, amount?: number) {
    const route = this.routeRepository.findByShipAndYear(shipId, year);

    if (!route) {
      return { error: "Route not found" };
    }

    const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
    const complianceBalance =
      (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;

    if (complianceBalance <= 0) {
      return { error: "Only positive compliance balance can be banked" };
    }

    const bankAmount = amount ?? complianceBalance;

    if (bankAmount <= 0 || bankAmount > complianceBalance) {
      return { error: "Invalid bank amount" };
    }

    const record = this.bankingRepository.create(shipId, year, bankAmount, "BANK");
    const totalBanked = this.bankingRepository
      .getRecords(shipId, year)
      .reduce((sum, entry) => sum + (entry.type === "BANK" ? entry.amount : -entry.amount), 0);

    return {
      record,
      complianceBalance,
      totalBanked,
    };
  }
}
