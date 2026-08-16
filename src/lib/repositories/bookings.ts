import { getPool } from "../../../lib/db";
import { listClinicHours } from "./clinicHours";
import { getClosuresForDate } from "./closures";

const SLOT_MINUTES = 30;

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

async function getConfirmedSlotTimes(dateStr: string): Promise<Set<string>> {
  const pool = getPool();
  const taken = await pool.query(
    `SELECT slot_start FROM appointment_requests
     WHERE status = 'Confirmed' AND slot_start >= $1::timestamp AND slot_start < ($1::timestamp + interval '1 day')`,
    [dateStr]
  );
  return new Set(
    taken.rows.map((r) => {
      const d = new Date(r.slot_start);
      return `${d.getHours().toString().padStart(2, "0")}:${d
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    })
  );
}

/**
 * Returns every 30-min slot ("HH:mm") for the given YYYY-MM-DD date that
 * falls within the clinic's opening hours for that weekday, isn't already
 * taken by a *confirmed* booking, and hasn't been manually closed by the
 * admin (either the whole day, or that specific slot — see closures.ts).
 * Pending requests never block a slot — only a confirmed one does (multiple
 * people can request the same slot; the first one the admin confirms wins,
 * per how the clinic actually operates).
 */
export async function getAvailableSlots(dateStr: string): Promise<string[]> {
  const day = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = day.getDay();

  const hours = await listClinicHours();
  const dayHours = hours.find((h) => h.day_of_week === dayOfWeek);
  if (!dayHours || dayHours.is_closed || !dayHours.open_time || !dayHours.close_time) {
    return [];
  }

  const { fullDayClosed, closedSlots } = await getClosuresForDate(dateStr);
  if (fullDayClosed) return [];
  const closedSet = new Set(closedSlots);

  const openMin = toMinutes(dayHours.open_time.slice(0, 5));
  const closeMin = toMinutes(dayHours.close_time.slice(0, 5));

  const allSlots: string[] = [];
  for (let t = openMin; t + SLOT_MINUTES <= closeMin; t += SLOT_MINUTES) {
    allSlots.push(fromMinutes(t));
  }

  const takenTimes = await getConfirmedSlotTimes(dateStr);

  const now = new Date();
  const isToday = day.toDateString() === now.toDateString();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return allSlots.filter((t) => {
    if (takenTimes.has(t)) return false;
    if (closedSet.has(t)) return false;
    if (isToday && toMinutes(t) <= nowMin) return false;
    return true;
  });
}

export type DaySlotStatus = "available" | "closed" | "confirmed" | "past";

/**
 * The admin-facing view of a day's schedule — every slot within opening
 * hours, each labeled with its actual status, not just filtered down to
 * what's bookable. Used by the "manage this day" panel so the admin can see
 * (and toggle) closed slots, not just the ones still open.
 */
export async function getDaySchedule(dateStr: string): Promise<{
  dayOpen: boolean;
  fullDayClosed: boolean;
  slots: { time: string; status: DaySlotStatus }[];
}> {
  const day = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = day.getDay();

  const hours = await listClinicHours();
  const dayHours = hours.find((h) => h.day_of_week === dayOfWeek);
  if (!dayHours || dayHours.is_closed || !dayHours.open_time || !dayHours.close_time) {
    return { dayOpen: false, fullDayClosed: false, slots: [] };
  }

  const { fullDayClosed, closedSlots } = await getClosuresForDate(dateStr);
  const closedSet = new Set(closedSlots);
  const takenTimes = await getConfirmedSlotTimes(dateStr);

  const openMin = toMinutes(dayHours.open_time.slice(0, 5));
  const closeMin = toMinutes(dayHours.close_time.slice(0, 5));

  const now = new Date();
  const isToday = day.toDateString() === now.toDateString();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slots: { time: string; status: DaySlotStatus }[] = [];
  for (let t = openMin; t + SLOT_MINUTES <= closeMin; t += SLOT_MINUTES) {
    const time = fromMinutes(t);
    let status: DaySlotStatus = "available";
    if (takenTimes.has(time)) status = "confirmed";
    else if (closedSet.has(time)) status = "closed";
    else if (isToday && t <= nowMin) status = "past";
    slots.push({ time, status });
  }

  return { dayOpen: true, fullDayClosed, slots };
}

export type CreateBookingResult =
  | { ok: true; requestId: number }
  | { ok: false; reason: "no_credits" | "slot_unavailable" | "package_not_found" };

/**
 * Creates a booking request. `slotStart` is optional — a client can choose a
 * package without picking a time yet ("schedule my first visit now" left
 * unchecked); the request is still created (so both the client and admin can
 * see the package was chosen) with `slot_start` left null, and no visit
 * credit is consumed since none has actually been scheduled. Scheduling a
 * time later — by the client themselves or by the admin — goes through
 * `scheduleRequestSlot`, which is what actually consumes the credit.
 */
export async function createBookingRequest(input: {
  clientId: number;
  firstName: string;
  lastName: string;
  phone: string;
  appointmentId: number;
  appointmentName: string;
  slotStart?: string | null; // "YYYY-MM-DDTHH:mm:ss"
  paymentMethod: string;
  priceUsed: string;
  /** Admin-created bookings skip the "already confirmed" checks a self-service client booking needs, since the admin is authoritative. */
  status?: "Pending" | "Confirmed";
}): Promise<CreateBookingResult> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const pkgRes = await client.query(
      "SELECT visit_count, validity_days FROM appointments WHERE id = $1",
      [input.appointmentId]
    );
    if (pkgRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "package_not_found" };
    }
    const { visit_count, validity_days } = pkgRes.rows[0];

    if (input.slotStart) {
      // A slot already confirmed by someone else can't be requested.
      const slotTaken = await client.query(
        `SELECT id FROM appointment_requests WHERE status = 'Confirmed' AND slot_start = $1::timestamp`,
        [input.slotStart]
      );
      if (slotTaken.rows.length > 0) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "slot_unavailable" };
      }
    }

    let creditId: number | null = null;

    if (visit_count) {
      const existing = await client.query(
        `SELECT id, remaining_visits FROM client_package_credits
         WHERE client_id = $1 AND appointment_id = $2
           AND (expires_at IS NULL OR expires_at > now())
         ORDER BY created_at DESC LIMIT 1`,
        [input.clientId, input.appointmentId]
      );

      if (existing.rows.length > 0) {
        const bundle = existing.rows[0];
        // Only a *scheduled* visit actually consumes a credit — picking the
        // package without a time yet doesn't spend anything.
        if (input.slotStart && bundle.remaining_visits <= 0) {
          await client.query("ROLLBACK");
          return { ok: false, reason: "no_credits" };
        }
        if (input.slotStart) {
          await client.query(
            "UPDATE client_package_credits SET remaining_visits = remaining_visits - 1 WHERE id = $1",
            [bundle.id]
          );
        }
        creditId = bundle.id;
      } else {
        const expiresAt = validity_days
          ? `now() + interval '${Number(validity_days)} days'`
          : "NULL";
        const remaining = input.slotStart ? "$3 - 1" : "$3";
        const created = await client.query(
          `INSERT INTO client_package_credits (client_id, appointment_id, total_visits, remaining_visits, expires_at)
           VALUES ($1, $2, $3, ${remaining}, ${expiresAt})
           RETURNING id`,
          [input.clientId, input.appointmentId, visit_count]
        );
        creditId = created.rows[0].id;
      }
    }

    const status = input.status ?? "Pending";
    const insertResult = await client.query(
      `INSERT INTO appointment_requests
        (first_name, last_name, phone_number, appointment_id, appointment_name, selected_date,
         payment_method, price_used, status, client_id, slot_start, slot_end, credit_id)
       VALUES (
         $1,$2,$3,$4,$5,COALESCE($6::timestamp, now()),$7,$8,$9,$10,
         $6::timestamp,
         CASE WHEN $6::timestamp IS NULL THEN NULL ELSE $6::timestamp + interval '${SLOT_MINUTES} minutes' END,
         $11
       )
       RETURNING id`,
      [
        input.firstName,
        input.lastName,
        input.phone,
        input.appointmentId,
        input.appointmentName,
        input.slotStart ?? null,
        input.paymentMethod,
        input.priceUsed,
        status,
        input.clientId,
        creditId,
      ]
    );

    await client.query("COMMIT");
    return { ok: true, requestId: insertResult.rows[0].id };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Assigns a time slot to a request that was created without one (the client
 * deferred scheduling their first visit). This is the moment a visit credit
 * is actually consumed. `asAdmin: true` also confirms the booking in the
 * same step (and runs the same "other pending requests for this slot lose
 * out" cleanup as `confirmBookingRequest`) since the admin placing it is
 * authoritative; a client scheduling their own deferred visit leaves it
 * Pending for the admin to confirm, same as a normal booking.
 */
export async function scheduleRequestSlot(
  id: number,
  slotStart: string,
  opts: { asAdmin?: boolean; clientId?: number } = {}
): Promise<StatusTransitionResult> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT status, slot_start, credit_id, client_id FROM appointment_requests WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }
    const row = current.rows[0];
    if (row.status !== "Pending" || row.slot_start) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "finalized" };
    }
    if (opts.clientId && row.client_id !== opts.clientId) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }

    const slotTaken = await client.query(
      `SELECT id FROM appointment_requests WHERE status = 'Confirmed' AND slot_start = $1::timestamp`,
      [slotStart]
    );
    if (slotTaken.rows.length > 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "slot_taken" };
    }

    if (row.credit_id) {
      await client.query(
        "UPDATE client_package_credits SET remaining_visits = remaining_visits - 1 WHERE id = $1",
        [row.credit_id]
      );
    }

    const newStatus = opts.asAdmin ? "Confirmed" : "Pending";
    await client.query(
      `UPDATE appointment_requests
       SET slot_start = $1::timestamp, slot_end = $1::timestamp + interval '${SLOT_MINUTES} minutes', status = $2
       WHERE id = $3`,
      [slotStart, newStatus, id]
    );

    if (opts.asAdmin) {
      const others = await client.query(
        `SELECT id, credit_id FROM appointment_requests
         WHERE status = 'Pending' AND slot_start = $1::timestamp AND id != $2`,
        [slotStart, id]
      );
      for (const other of others.rows) {
        if (other.credit_id) {
          await client.query(
            "UPDATE client_package_credits SET remaining_visits = remaining_visits + 1 WHERE id = $1",
            [other.credit_id]
          );
        }
        await client.query(`UPDATE appointment_requests SET status = 'Cancelled' WHERE id = $1`, [
          other.id,
        ]);
      }
    }

    await client.query("COMMIT");
    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getUnscheduledRequestsForClient(clientId: number) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, appointment_id, appointment_name, price_used, created_at
     FROM appointment_requests
     WHERE client_id = $1 AND status = 'Pending' AND slot_start IS NULL
     ORDER BY created_at DESC`,
    [clientId]
  );
  return result.rows;
}

export type StatusTransitionResult =
  | { ok: true }
  | { ok: false, reason: "not_found" | "finalized" | "slot_taken" };

export async function confirmBookingRequest(id: number): Promise<StatusTransitionResult> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT status, slot_start FROM appointment_requests WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }
    const { status, slot_start } = current.rows[0];
    if (status === "Cancelled" || status === "Completed") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "finalized" };
    }

    if (slot_start) {
      const clash = await client.query(
        `SELECT id FROM appointment_requests WHERE status = 'Confirmed' AND slot_start = $1 AND id != $2`,
        [slot_start, id]
      );
      if (clash.rows.length > 0) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "slot_taken" };
      }
    }

    await client.query(`UPDATE appointment_requests SET status = 'Confirmed' WHERE id = $1`, [id]);

    // Other pending requests for the exact same slot lose out — refund their credit.
    if (slot_start) {
      const others = await client.query(
        `SELECT id, credit_id FROM appointment_requests
         WHERE status = 'Pending' AND slot_start = $1 AND id != $2`,
        [slot_start, id]
      );
      for (const other of others.rows) {
        if (other.credit_id) {
          await client.query(
            "UPDATE client_package_credits SET remaining_visits = remaining_visits + 1 WHERE id = $1",
            [other.credit_id]
          );
        }
        await client.query(`UPDATE appointment_requests SET status = 'Cancelled' WHERE id = $1`, [
          other.id,
        ]);
      }
    }

    await client.query("COMMIT");
    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function cancelBookingRequest(id: number): Promise<StatusTransitionResult> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT status, credit_id FROM appointment_requests WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }
    const { status, credit_id } = current.rows[0];
    if (status === "Cancelled" || status === "Completed") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "finalized" };
    }

    if (credit_id) {
      await client.query(
        "UPDATE client_package_credits SET remaining_visits = remaining_visits + 1 WHERE id = $1",
        [credit_id]
      );
    }
    await client.query(`UPDATE appointment_requests SET status = 'Cancelled' WHERE id = $1`, [id]);

    await client.query("COMMIT");
    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/** Marks a confirmed visit as actually having happened, and applies the reward rule if it's due. */
export async function completeBookingRequest(id: number): Promise<StatusTransitionResult> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT status, credit_id FROM appointment_requests WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }
    const { status, credit_id } = current.rows[0];
    if (status !== "Confirmed") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "finalized" };
    }

    await client.query(`UPDATE appointment_requests SET status = 'Completed' WHERE id = $1`, [id]);

    if (credit_id) {
      const bundleRes = await client.query(
        "UPDATE client_package_credits SET completed_visits = completed_visits + 1 WHERE id = $1 RETURNING completed_visits",
        [credit_id]
      );
      const completedVisits = bundleRes.rows[0].completed_visits;

      const settingsRes = await client.query(
        "SELECT reward_threshold, reward_bonus FROM settings LIMIT 1"
      );
      const { reward_threshold, reward_bonus } = settingsRes.rows[0] || {};

      if (reward_threshold && reward_bonus && completedVisits % reward_threshold === 0) {
        await client.query(
          `UPDATE client_package_credits
           SET remaining_visits = remaining_visits + $1, total_visits = total_visits + $1
           WHERE id = $2`,
          [reward_bonus, credit_id]
        );
      }
    }

    await client.query("COMMIT");
    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getClientCredits(clientId: number) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT c.id, c.appointment_id, a.name AS appointment_name, c.total_visits, c.remaining_visits,
            c.completed_visits, c.expires_at
     FROM client_package_credits c
     JOIN appointments a ON a.id = c.appointment_id
     WHERE c.client_id = $1
     ORDER BY c.created_at DESC`,
    [clientId]
  );
  return result.rows;
}
