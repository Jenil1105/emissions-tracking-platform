import { routes } from "../data/routes";
import { db } from "./db";

export async function initDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS routes (
      id SERIAL PRIMARY KEY,
      route_id TEXT NOT NULL UNIQUE,
      vessel_type TEXT NOT NULL,
      fuel_type TEXT NOT NULL,
      year INTEGER NOT NULL,
      ghg_intensity DOUBLE PRECISION NOT NULL,
      fuel_consumption DOUBLE PRECISION NOT NULL,
      distance DOUBLE PRECISION NOT NULL,
      total_emissions DOUBLE PRECISION NOT NULL,
      is_baseline BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS bank_entries (
      id SERIAL PRIMARY KEY,
      year INTEGER NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('BANK', 'APPLY'))
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS pools (
      id SERIAL PRIMARY KEY,
      year INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS pool_members (
      id SERIAL PRIMARY KEY,
      pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
      route_id TEXT NOT NULL,
      cb_before DOUBLE PRECISION NOT NULL,
      cb_after DOUBLE PRECISION NOT NULL
    );
  `);

  for (const route of routes) {
    await db.query(
      `
        INSERT INTO routes (
          route_id,
          vessel_type,
          fuel_type,
          year,
          ghg_intensity,
          fuel_consumption,
          distance,
          total_emissions,
          is_baseline
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (route_id) DO NOTHING
      `,
      [
        route.routeId,
        route.vesselType,
        route.fuelType,
        route.year,
        route.ghgIntensity,
        route.fuelConsumption,
        route.distance,
        route.totalEmissions,
        route.isBaseline,
      ]
    );
  }
}
