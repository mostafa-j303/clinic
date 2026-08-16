import { getPool } from "../../../lib/db";

export type CloseSlotResult =
  | { ok: true }
  | { ok: false; reason: "already_confirmed" };

/**
 * Closes the whole day to new bookings. Doesn't touch any already-Confirmed
 * appointment that day — closing a day means "stop taking new bookings here",
 * not "cancel what's already booked". Safe to call even if bookings exist.
 */
export async function closeDay(date: string): Promise<void> {
  const pool = getPool();
  const existing = await pool.query(
    "SELECT id FROM clinic_closures WHERE closure_date = $1 AND slot_time IS NULL",
    [date]
  );
  if (existing.rows.length === 0) {
    await pool.query(
      "INSERT INTO clinic_closures (closure_date, slot_time) VALUES ($1, NULL)",
      [date]
    );
  }
}

export async function openDay(date: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    "DELETE FROM clinic_closures WHERE closure_date = $1 AND slot_time IS NULL",
    [date]
  );
}

/**
 * Blocks a single 30-min slot from being booked. Refuses if that slot
 * already has a Confirmed appointment — closing a slot someone is already
 * confirmed into is a contradiction; the admin has to cancel that booking
 * first if they really want the time closed.
 */
export async function closeSlot(date: string, slotTime: string): Promise<CloseSlotResult> {
  const pool = getPool();

  const confirmed = await pool.query(
    `SELECT id FROM appointment_requests
     WHERE status = 'Confirmed' AND slot_start = ($1::date + $2::time)::timestamp`,
    [date, slotTime]
  );
  if (confirmed.rows.length > 0) {
    return { ok: false, reason: "already_confirmed" };
  }

  const existing = await pool.query(
    "SELECT id FROM clinic_closures WHERE closure_date = $1 AND slot_time = $2",
    [date, slotTime]
  );
  if (existing.rows.length === 0) {
    await pool.query(
      "INSERT INTO clinic_closures (closure_date, slot_time) VALUES ($1, $2)",
      [date, slotTime]
    );
  }
  return { ok: true };
}

export async function openSlot(date: string, slotTime: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    "DELETE FROM clinic_closures WHERE closure_date = $1 AND slot_time = $2",
    [date, slotTime]
  );
}

export async function getClosuresForDate(
  date: string
): Promise<{ fullDayClosed: boolean; closedSlots: string[] }> {
  const pool = getPool();
  const result = await pool.query(
    "SELECT slot_time FROM clinic_closures WHERE closure_date = $1",
    [date]
  );
  let fullDayClosed = false;
  const closedSlots: string[] = [];
  for (const row of result.rows) {
    if (row.slot_time === null) {
      fullDayClosed = true;
    } else {
      closedSlots.push(row.slot_time.slice(0, 5));
    }
  }
  return { fullDayClosed, closedSlots };
}
