import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../../../lib/db";
import { requireAdmin } from '../../../../lib/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

 const session = await requireAdmin(req, res);
  if (!session) return;

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

    return res.status(200).json({
      orders: result.rows.map(r => r.order),
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  } finally {
    client.release();
  }
}
