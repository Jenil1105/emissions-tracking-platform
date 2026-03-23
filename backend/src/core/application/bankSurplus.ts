import type { BankingRepository } from "../ports/bankingRepository";
import type { RouteRepository } from "../ports/routeRepository";

const TARGET_GHG_INTENSITY = 89.3368;
const ENERGY_FACTOR = 41000;

export class BankSurplus {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly bankingRepository: BankingRepository
  ) {}

  async execute(shipId: string, year: number, amount?: number) {
    const route = await this.routeRepository.getByShipIdAndYear(shipId, year);

    if (!route) {
      return { error: "Route not found for the selected ship and year" };
    }

    const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
    const cbBefore = (TARGET_GHG_INTENSITY - route.ghgIntensity) * energyInScope;
    const existingRecords = await this.bankingRepository.getRecords(shipId, year);
    const banked = existingRecords
      .filter((record) => record.type === "BANK")
      .reduce((sum, record) => sum + record.amount, 0);
    const applied = existingRecords
      .filter((record) => record.type === "APPLY")
      .reduce((sum, record) => sum + record.amount, 0);
    const availableToBank = cbBefore - banked + applied;

    if (availableToBank <= 0) {
      return { error: "Only positive compliance balance can be banked" };
    }

    const bankAmount = amount ?? availableToBank;

    if (bankAmount <= 0 || bankAmount > availableToBank) {
      return { error: "Invalid bank amount" };
    }

    const record = await this.bankingRepository.create(shipId, year, bankAmount, "BANK");
    const allRecords = await this.bankingRepository.getRecords();
    const globalBanked = allRecords
      .filter((entry) => entry.type === "BANK")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const globalApplied = allRecords
      .filter((entry) => entry.type === "APPLY")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalBanked = globalBanked - globalApplied;

    return {
      shipId,
      year,
      record,
      cbBefore,
      applied,
      cbAfter: availableToBank - bankAmount,
      totalBanked,
    };
  }
}
