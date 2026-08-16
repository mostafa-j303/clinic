import { connectToDatabase } from "../../../lib/db";

export type ClinicHourRow = {
  day_of_week: number;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
};

/** Always returns exactly 7 rows (0=Sunday..6=Saturday), one per day of week. */
export async function listClinicHours(): Promise<ClinicHourRow[]> {
  const pool = connectToDatabase();
  const result = await pool.query(
    "SELECT day_of_week, is_closed, open_time, close_time FROM clinic_hours ORDER BY day_of_week"
  );
  return result.rows;
}

// Slots are 30 minutes wide, so an open/close time that isn't on a :00/:30
// boundary (e.g. "13:07") would produce a schedule that doesn't line up with
// the slot grid at all. The UI only ever sends half-hour values, but this is
// enforced here too in case the API is ever hit directly.
const HALF_HOUR = /^([01]\d|2[0-3]):(00|30)$/;

function assertHalfHour(value: string | null, label: string) {
  if (value !== null && !HALF_HOUR.test(value)) {
    throw new Error(`${label} must be on a 30-minute boundary (e.g. 13:00 or 13:30), got "${value}"`);
  }
}

export async function updateClinicHours(
  hours: { dayOfWeek: number; isClosed: boolean; openTime: string | null; closeTime: string | null }[]
) {
  for (const h of hours) {
    if (!h.isClosed) {
      assertHalfHour(h.openTime, `Opening time for day ${h.dayOfWeek}`);
      assertHalfHour(h.closeTime, `Closing time for day ${h.dayOfWeek}`);
    }
  }

  const pool = connectToDatabase();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const h of hours) {
      await client.query(
        `UPDATE clinic_hours SET is_closed = $1, open_time = $2, close_time = $3 WHERE day_of_week = $4`,
        [h.isClosed, h.isClosed ? null : h.openTime, h.isClosed ? null : h.closeTime, h.dayOfWeek]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
