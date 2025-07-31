// pages/api/edit-product.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";
import { getPool } from "../../lib/db";

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const form = new IncomingForm({ keepExtensions: true, multiples: true });

  const data = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { fields, files } = data;
  const id = parseInt(fields.id?.[0], 10);
  const name = fields.name?.[0] ?? "";
  const price = fields.price?.[0] ?? "";
  const details = fields.details?.[0] ?? "";
  const categories = fields.categories?.[0] ?? "";
  const file = Array.isArray(files.file) ? files.file[0] : files.file;

  if (!id || !name || !price || !details || !categories) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const pool = getPool();

    // Get category ID
    const catRes = await pool.query("SELECT id FROM categories WHERE name = $1", [categories]);
    const category_id = catRes.rows?.[0]?.id;

    if (!category_id) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Update product
    await pool.query(
      `UPDATE products SET name = $1, price = $2, details = $3, category_id = $4 WHERE id = $5`,
      [name, price, details, category_id, id]
    );

    if (file) {
      // Delete existing image and insert new one
      await pool.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);

      const imageBuffer = fs.readFileSync(file.filepath);
      const mimetype = file.mimetype || "image/jpeg";
      const filename = file.originalFilename || "image.jpg";

      await pool.query(
        `INSERT INTO product_images (product_id, image, mimetype, filename)
         VALUES ($1, $2, $3, $4)`,
        [id, imageBuffer, mimetype, filename]
      );
    }

    return res.status(200).json({ message: "Product updated successfully", id });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database error" });
  }
}
