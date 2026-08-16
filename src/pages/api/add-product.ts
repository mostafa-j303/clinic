import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import { put } from "@vercel/blob";
import getFieldValue from "@/app/utils/getFieldValue";
import { requireAdmin } from '../../../lib/session';
import { findCategoryIdByName, insertProduct, insertProductImage } from '../../lib/repositories/products';

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

 const session = await requireAdmin(req, res);
  if (!session) return;

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
    const category_id = await findCategoryIdByName(categories);

    if (!category_id) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const product_id = await insertProduct({ name, price, details, categoryId: category_id });

    const imageBuffer = fs.readFileSync(file.filepath);
    const mimetype = file.mimetype || "image/jpeg";
    const filename = file.originalFilename || "image.jpg";

    const blob = await put(`product-images/${product_id}-${filename}`, imageBuffer, {
      access: "public",
      contentType: mimetype,
      addRandomSuffix: true,
    });

    await insertProductImage({ productId: product_id, imageUrl: blob.url, mimetype, filename });

    return res.status(200).json({ message: "Product added successfully", id: product_id });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database error" });
  }
}
