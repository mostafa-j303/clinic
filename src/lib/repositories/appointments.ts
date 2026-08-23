import { connectToDatabase } from "../../../lib/db";

// Appointment "packages" (the admin-managed pricing packages shown on the
// public Appointments section) — not to be confused with appointment
// *requests* (a client booking one of these), which live in appointments-requests.ts.

export type AppointmentDetailsInput = string[] | undefined;

export async function listAppointments() {
  const pool = connectToDatabase();
  const result = await pool.query(`SELECT * FROM get_appointments()`);
  return result.rows;
}

export async function createAppointment(input: {
  name: string;
  price: string;
  offerprice?: string;
  duration?: string;
  details?: AppointmentDetailsInput;
  visitCount?: number | null;
  validityDays?: number | null;
}) {
  const pool = connectToDatabase();
  const insertAppointment = await pool.query(
    `
      INSERT INTO appointments (name, price, offer_price, duration, visit_count, validity_days)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [input.name, input.price, input.offerprice, input.duration, input.visitCount ?? null, input.validityDays ?? null]
  );

  const appointmentId = insertAppointment.rows[0].id;

  if (Array.isArray(input.details) && input.details.length > 0) {
    await Promise.all(
      input.details.map((detail: string) =>
        pool.query(
          `INSERT INTO appointment_details (appointment_id, detail) VALUES ($1, $2)`,
          [appointmentId, detail]
        )
      )
    );
  }

  return appointmentId;
}

export async function updateAppointment(input: {
  id: number;
  name: string;
  price: string;
  offerprice?: string;
  duration?: string;
  details?: AppointmentDetailsInput;
  visitCount?: number | null;
  validityDays?: number | null;
}) {
  const pool = connectToDatabase();

  await pool.query(
    `
      UPDATE appointments
      SET name = $1, price = $2, offer_price = $3, duration = $4, visit_count = $5, validity_days = $6
      WHERE id = $7
    `,
    [input.name, input.price, input.offerprice, input.duration, input.visitCount ?? null, input.validityDays ?? null, input.id]
  );

  await pool.query(`DELETE FROM appointment_details WHERE appointment_id = $1`, [
    input.id,
  ]);

  if (Array.isArray(input.details) && input.details.length > 0) {
    await Promise.all(
      input.details.map((detail: string) =>
        pool.query(
          `INSERT INTO appointment_details (appointment_id, detail) VALUES ($1, $2)`,
          [input.id, detail]
        )
      )
    );
  }
}

export async function deleteAppointment(id: number | string) {
  const pool = connectToDatabase();
  await pool.query(`DELETE FROM appointment_details WHERE appointment_id = $1`, [id]);
  await pool.query(`DELETE FROM appointments WHERE id = $1`, [id]);
}

export type FeaturedTier = "gold" | "silver" | "bronze";
const FEATURED_TIERS: FeaturedTier[] = ["gold", "silver", "bronze"];

/**
 * Only one package can hold a given tier (gold/silver/bronze) at a time —
 * setting a tier on one package clears it from whichever other package
 * previously held it. Passing `tier: null` clears this package's own tier.
 */
export async function setAppointmentTier(id: number | string, tier: FeaturedTier | null) {
  if (tier !== null && !FEATURED_TIERS.includes(tier)) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  const pool = connectToDatabase();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT id FROM appointments WHERE id = $1",
      [id]
    );
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return { notFound: true as const };
    }

    if (tier !== null) {
      // Only one package per tier — clear it from whoever else has it.
      await client.query("UPDATE appointments SET featured_tier = NULL WHERE featured_tier = $1", [tier]);
    }
    await client.query("UPDATE appointments SET featured_tier = $1 WHERE id = $2", [tier, id]);

    await client.query("COMMIT");
    return { notFound: false as const, tier };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
