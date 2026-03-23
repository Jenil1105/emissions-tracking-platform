import type { Pool } from "pg";
import type { BankEntry } from "../../core/domain/BankEntry";
import type { BankingRepository } from "../../core/ports/bankingRepository";

type BankEntryRow = {
  id: number;
  year: number;
  amount: number;
  type: "BANK" | "APPLY";
};

function mapBankEntry(row: BankEntryRow): BankEntry {
  return {
    id: row.id,
    year: row.year,
    amount: row.amount,
    type: row.type,
  };
}

export class PostgresBankingRepository implements BankingRepository {
  constructor(private readonly db: Pool) {}

  async getRecords(year: number): Promise<BankEntry[]> {
    const result = await this.db.query<BankEntryRow>(
      `
        SELECT id, year, amount, type
        FROM bank_entries
        WHERE year = $1
        ORDER BY id ASC
      `,
      [year]
    );

    return result.rows.map(mapBankEntry);
  }

  async create(year: number, amount: number, type: "BANK" | "APPLY"): Promise<BankEntry> {
    const result = await this.db.query<BankEntryRow>(
      `
        INSERT INTO bank_entries (year, amount, type)
        VALUES ($1, $2, $3)
        RETURNING id, year, amount, type
      `,
      [year, amount, type]
    );

    return mapBankEntry(result.rows[0]);
  }
}
