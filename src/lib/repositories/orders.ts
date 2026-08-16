import { getPool } from "../../../lib/db";

export type OrderCartItem = { id: number; quantity: number };

export async function createOrder(input: {
  name: string;
  lastName: string;
  phone: string;
  paymentMethod: string;
  address: string;
  locationLink: string;
  cart: OrderCartItem[];
}): Promise<number> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `
      INSERT INTO orders (name, last_name, phone, payment_method, address, location_link, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      RETURNING id
      `,
      [input.name, input.lastName, input.phone, input.paymentMethod, input.address, input.locationLink]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of input.cart) {
      if (!item.id || !item.quantity) {
        throw new Error("Invalid cart item");
      }
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [orderId, item.id, item.quantity]
      );
    }

    await client.query("COMMIT");
    return orderId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listOrders() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const result = await client.query(`
      WITH settings_data AS (
        SELECT
          REPLACE(REPLACE(discount, '%', ''), '$', '')::numeric AS discount_percent,
          REPLACE(delivery, '$', '')::numeric AS delivery_charge
        FROM settings
        LIMIT 1
      ),
      order_totals AS (
        SELECT
          o.id AS order_id,
          SUM(
            REPLACE(p.price, '$', '')::numeric * oi.quantity
          ) AS subtotal
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        GROUP BY o.id
      )
      SELECT
        jsonb_build_object(
          'id', o.id,
          'customerName', o.name,
          'customerLastName', o.last_name,
          'phone', o.phone,
          'address', o.address,
          'locationLink', o.location_link,
          'paymentMethod', o.payment_method,
          'status', o.status,
          'createdAt', o.created_at,

          'subtotal', ot.subtotal,
          'discount', ROUND(ot.subtotal * (sd.discount_percent / 100), 2),
          'delivery', sd.delivery_charge,
          'total',
            ROUND(
              ot.subtotal
              - (ot.subtotal * (sd.discount_percent / 100))
              + sd.delivery_charge,
              2
            ),

          'items', jsonb_agg(
            jsonb_build_object(
              'productId', p.id,
              'name', p.name,
              'price', p.price,
              'quantity', oi.quantity
            )
          )
        ) AS "order"
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      JOIN order_totals ot ON ot.order_id = o.id
      CROSS JOIN settings_data sd
      GROUP BY
        o.id,
        ot.subtotal,
        sd.discount_percent,
        sd.delivery_charge
      ORDER BY o.created_at DESC;
    `);

    return result.rows.map((r) => r.order);
  } finally {
    client.release();
  }
}

export async function deleteOrder(orderId: number | string) {
  const pool = getPool();
  await pool.query("DELETE FROM orders WHERE id = $1", [orderId]);
}

export async function updateOrderStatus(
  orderId: number | string,
  status: string
): Promise<{ result: "ok" | "not_found" | "finalized" }> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const currentRes = await client.query("SELECT status FROM orders WHERE id = $1", [
      orderId,
    ]);

    if (currentRes.rowCount === 0) {
      return { result: "not_found" };
    }

    const currentStatus = currentRes.rows[0].status;
    if (currentStatus === "Delivered" || currentStatus === "Cancelled") {
      return { result: "finalized" };
    }

    await client.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, orderId]);
    return { result: "ok" };
  } finally {
    client.release();
  }
}
