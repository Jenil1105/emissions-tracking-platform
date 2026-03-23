import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.fn();

vi.mock("../infrastructure/db", () => ({
  db: {
    query,
  },
}));

describe("initDatabase", () => {
  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValue({ rows: [] });
  });

  it("creates tables, applies upgrade queries, and seeds routes", async () => {
    const { initDatabase } = await import("../infrastructure/initDatabase.js");

    await initDatabase();

    const sqlStatements = query.mock.calls.map((call) => String(call[0]));
    expect(sqlStatements.some((sql) => sql.includes("CREATE TABLE IF NOT EXISTS routes"))).toBe(true);
    expect(sqlStatements.some((sql) => sql.includes("CREATE TABLE IF NOT EXISTS ship_compliance"))).toBe(true);
    expect(sqlStatements.some((sql) => sql.includes("ALTER TABLE bank_entries"))).toBe(true);
    expect(sqlStatements.some((sql) => sql.includes("ALTER TABLE pool_members"))).toBe(true);
    expect(sqlStatements.filter((sql) => sql.includes("INSERT INTO routes")).length).toBeGreaterThan(0);
  });
});
