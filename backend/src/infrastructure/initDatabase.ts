import { routes } from "../data/routes";
import { db } from "./db";

export async function initDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS routes (
      id SERIAL PRIMARY KEY,
      route_id TEXT NOT NULL UNIQUE,
      ship_id TEXT NOT NULL,
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
    ALTER TABLE routes
    ADD COLUMN IF NOT EXISTS ship_id TEXT;
  `);

  await db.query(`
    UPDATE routes
    SET ship_id = CONCAT('SHIP-', LPAD(id::text, 3, '0'))
    WHERE ship_id IS NULL;
  `);

  await db.query(`
    ALTER TABLE routes
    ALTER COLUMN ship_id SET NOT NULL;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS bank_entries (
      id SERIAL PRIMARY KEY,
      ship_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('BANK', 'APPLY'))
    );
  `);

  await db.query(`
    ALTER TABLE bank_entries
    ADD COLUMN IF NOT EXISTS ship_id TEXT;
  `);

  await db.query(`
    UPDATE bank_entries
    SET ship_id = 'LEGACY-SHIP'
    WHERE ship_id IS NULL;
  `);

  await db.query(`
    ALTER TABLE bank_entries
    ALTER COLUMN ship_id SET NOT NULL;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ship_compliance (
      id SERIAL PRIMARY KEY,
      ship_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      cb_gco2eq DOUBLE PRECISION NOT NULL,
      ghg_intensity DOUBLE PRECISION NOT NULL,
      energy_in_scope DOUBLE PRECISION NOT NULL,
      UNIQUE (ship_id, year)
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
      ship_id TEXT NOT NULL,
      route_id TEXT NOT NULL,
      cb_before DOUBLE PRECISION NOT NULL,
      cb_after DOUBLE PRECISION NOT NULL
    );
  `);

  await db.query(`
    ALTER TABLE pool_members
    ADD COLUMN IF NOT EXISTS ship_id TEXT;
  `);

  await db.query(`
    UPDATE pool_members AS members
    SET ship_id = routes.ship_id
    FROM routes
    WHERE members.ship_id IS NULL
      AND members.route_id = routes.route_id;
  `);

  await db.query(`
    UPDATE pool_members
    SET ship_id = 'LEGACY-SHIP'
    WHERE ship_id IS NULL;
  `);

  await db.query(`
    ALTER TABLE pool_members
    ALTER COLUMN ship_id SET NOT NULL;
  `);

  for (const route of routes) {
    await db.query(
      `
        INSERT INTO routes (
          route_id,
          ship_id,
          vessel_type,
          fuel_type,
          year,
          ghg_intensity,
          fuel_consumption,
          distance,
          total_emissions,
          is_baseline
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (route_id) DO UPDATE
        SET ship_id = EXCLUDED.ship_id,
            vessel_type = EXCLUDED.vessel_type,
            fuel_type = EXCLUDED.fuel_type,
            year = EXCLUDED.year,
            ghg_intensity = EXCLUDED.ghg_intensity,
            fuel_consumption = EXCLUDED.fuel_consumption,
            distance = EXCLUDED.distance,
            total_emissions = EXCLUDED.total_emissions,
            is_baseline = EXCLUDED.is_baseline
      `,
      [
        route.routeId,
        route.shipId,
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
