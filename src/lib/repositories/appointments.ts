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

/** Only one appointment package can be featured at a time — starring one un-stars any previously featured package. */
export async function toggleFeaturedAppointment(id: number | string) {
  const pool = connectToDatabase();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT is_featured FROM appointments WHERE id = $1",
      [id]
    );
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return { notFound: true as const };
    }

    const willBeFeatured = !current.rows[0].is_featured;

    await client.query("UPDATE appointments SET is_featured = false");
    if (willBeFeatured) {
      await client.query("UPDATE appointments SET is_featured = true WHERE id = $1", [
        id,
      ]);
    }

    await client.query("COMMIT");
    return { notFound: false as const, isFeatured: willBeFeatured };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
