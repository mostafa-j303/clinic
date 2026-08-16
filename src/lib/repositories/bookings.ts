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

/**
 * Day-level availability (has at least one open slot, or not) for every day
 * in a given month — powers the client-facing booking calendar's month grid
 * so it can grey out fully-booked/closed days without the browser having to
 * call the single-day endpoint once per visible cell. Reuses
 * `getAvailableSlots` per day (same weekly-hours/closures/confirmed-booking
 * rules, including "today" excluding already-past times) rather than
 * duplicating that logic — a month is at most 31 days, so 31 parallel
 * queries is cheap and keeps this a single source of truth.
 */
export async function getMonthAvailability(
  year: number,
  month: number
): Promise<Record<string, boolean>> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dateStrs = Array.from(
    { length: daysInMonth },
    (_, i) => `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
  );

  const entries = await Promise.all(
    dateStrs.map(async (dateStr) => {
      const slots = await getAvailableSlots(dateStr);
      return [dateStr, slots.length > 0] as const;
    })
  );

  return Object.fromEntries(entries);
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
 * Creates a booking request. Two very different things go through this:
 *
 * 1. A "package request" — the client is just requesting to buy a
 *    multi-visit package (the linked appointment has `visit_count`), never
 *    with a `slotStart`. No visit credit exists yet at this point — the
 *    admin has to *approve the package itself* (see `confirmBookingRequest`'s
 *    slot_start-null branch) before the client's `client_package_credits`
 *    bundle is created. This is deliberate: "you get your X visits once the
 *    package is accepted," not the moment you ask for it.
 * 2. A direct appointment booking — either a plain single-visit service
 *    (`visit_count` null, always has a `slotStart`), or an admin walk-in
 *    booking that picks a package AND a slot in one step (the only case
 *    `slotStart` and `visit_count` are both present — see
 *    `AdminBookingModal.tsx`/`admin/create-booking.ts`, which immediately
 *    confirms afterward, so the admin is the authority granting the credit
 *    there, not a client self-service request).
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

    // Only touches client_package_credits when a slot is being booked
    // immediately (the admin walk-in case) — a plain client package request
    // (visit_count set, no slotStart) leaves creditId null; the bundle gets
    // created later, when the admin approves the package.
    if (visit_count && input.slotStart) {
      const existing = await client.query(
        `SELECT id, remaining_visits FROM client_package_credits
         WHERE client_id = $1 AND appointment_id = $2
           AND (expires_at IS NULL OR expires_at > now())
         ORDER BY created_at DESC LIMIT 1`,
        [input.clientId, input.appointmentId]
      );

      if (existing.rows.length > 0) {
        const bundle = existing.rows[0];
        if (bundle.remaining_visits <= 0) {
          await client.query("ROLLBACK");
          return { ok: false, reason: "no_credits" };
        }
        await client.query(
          "UPDATE client_package_credits SET remaining_visits = remaining_visits - 1 WHERE id = $1",
          [bundle.id]
        );
        creditId = bundle.id;
      } else {
        const expiresAt = validity_days
          ? `now() + interval '${Number(validity_days)} days'`
          : "NULL";
        const created = await client.query(
          `INSERT INTO client_package_credits (client_id, appointment_id, total_visits, remaining_visits, expires_at)
           VALUES ($1, $2, $3, $3 - 1, ${expiresAt})
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
 * Books a specific time using a visit the client already has credit for
 * (from an approved package) — the client-facing "book an appointment" page,
 * reached from their visit-count badge, not the package-purchase flow.
 * Always creates a brand-new `appointment_requests` row (unlike the old
 * one-shot "schedule my first visit" design this replaced, a client can call
 * this as many times as they have remaining visits — each booking is its own
 * row, all sharing the same `credit_id`). Leaves the new row Pending — the
 * admin still confirms the actual time, same as any other booking.
 */
export type CreateFromCreditResult =
  | { ok: true; requestId: number }
  | { ok: false; reason: "not_found" | "no_credits" | "expired" | "slot_unavailable" };

export async function createAppointmentFromCredit(input: {
  clientId: number;
  creditId: number;
  slotStart: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<CreateFromCreditResult> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const creditRes = await client.query(
      `SELECT c.id, c.client_id, c.remaining_visits, c.expires_at, c.appointment_id,
              a.name AS appointment_name, a.price, a.offer_price
       FROM client_package_credits c
       JOIN appointments a ON a.id = c.appointment_id
       WHERE c.id = $1 FOR UPDATE`,
      [input.creditId]
    );
    if (creditRes.rows.length === 0 || creditRes.rows[0].client_id !== input.clientId) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }
    const credit = creditRes.rows[0];
    if (credit.expires_at && new Date(credit.expires_at) < new Date()) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "expired" };
    }
    if (credit.remaining_visits <= 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "no_credits" };
    }

    const slotTaken = await client.query(
      `SELECT id FROM appointment_requests WHERE status = 'Confirmed' AND slot_start = $1::timestamp`,
      [input.slotStart]
    );
    if (slotTaken.rows.length > 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "slot_unavailable" };
    }

    await client.query(
      "UPDATE client_package_credits SET remaining_visits = remaining_visits - 1 WHERE id = $1",
      [credit.id]
    );

    const insertResult = await client.query(
      `INSERT INTO appointment_requests
        (first_name, last_name, phone_number, appointment_id, appointment_name, selected_date,
         payment_method, price_used, status, client_id, slot_start, slot_end, credit_id)
       VALUES (
         $1,$2,$3,$4,$5,$6::timestamp,$7,$8,'Pending',$9,
         $6::timestamp, $6::timestamp + interval '${SLOT_MINUTES} minutes',
         $10
       )
       RETURNING id`,
      [
        input.firstName,
        input.lastName,
        input.phone,
        credit.appointment_id,
        credit.appointment_name,
        input.slotStart,
        "Package Credit",
        credit.offer_price || credit.price,
        input.clientId,
        credit.id,
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

export type StatusTransitionResult =
  | { ok: true }
  | { ok: false, reason: "not_found" | "finalized" | "slot_taken" };

export async function confirmBookingRequest(id: number): Promise<StatusTransitionResult> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT status, slot_start, appointment_id, client_id FROM appointment_requests WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }
    const { status, slot_start, appointment_id, client_id } = current.rows[0];
    if (status === "Cancelled" || status === "Completed" || status === "Confirmed") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "finalized" };
    }

    // A package request (no slot) isn't "confirming a time" — it's approving
    // the package itself, which is the moment the client actually receives
    // their X visits. See createBookingRequest's doc comment for why no
    // credit bundle exists yet at this point.
    if (!slot_start) {
      const pkgRes = await client.query(
        "SELECT visit_count, validity_days FROM appointments WHERE id = $1",
        [appointment_id]
      );
      const visitCount = pkgRes.rows[0]?.visit_count || 1;
      const validityDays = pkgRes.rows[0]?.validity_days;
      const expiresAt = validityDays ? `now() + interval '${Number(validityDays)} days'` : "NULL";

      const created = await client.query(
        `INSERT INTO client_package_credits (client_id, appointment_id, total_visits, remaining_visits, expires_at)
         VALUES ($1, $2, $3, $3, ${expiresAt})
         RETURNING id`,
        [client_id, appointment_id, visitCount]
      );

      await client.query(
        "UPDATE appointment_requests SET status = 'Confirmed', credit_id = $1 WHERE id = $2",
        [created.rows[0].id, id]
      );

      await client.query("COMMIT");
      return { ok: true };
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
