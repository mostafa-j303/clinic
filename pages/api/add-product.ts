import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import { getPool } from "../../lib/db";
import getFieldValue from "@/app/utils/getFieldValue";

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

  const name = fields.name?.[0] ?? "";
  const price = fields.price?.[0] ?? "";
  const details = fields.details?.[0] ?? "";
  const categories = fields.categories?.[0] ?? "";
  const file = Array.isArray(files.file) ? files.file[0] : files.file;

  if (!name || !price || !details || !categories || !file) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const pool = getPool();

    const catRes = await pool.query("SELECT id FROM categories WHERE name = $1", [categories]);
    const category_id = catRes.rows?.[0]?.id;

    if (!category_id) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const insertProduct = await pool.query(
      `INSERT INTO products (name, price, details, category_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, price, details, category_id]
    );

    const product_id = insertProduct.rows[0].id;

    const imageBuffer = fs.readFileSync(file.filepath);
    const mimetype = file.mimetype || "image/jpeg";
    const filename = file.originalFilename || "image.jpg";

    await pool.query(
      `INSERT INTO product_images (product_id, image, mimetype, filename)
       VALUES ($1, $2, $3, $4)`,
      [product_id, imageBuffer, mimetype, filename]
    );

    return res.status(200).json({ message: "Product added successfully", id: product_id });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database error" });
  }
}
