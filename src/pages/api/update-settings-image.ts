import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import { put } from "@vercel/blob";
import { getPool } from "../../../lib/db";
import { requireAdmin } from "../../../lib/session";

export const config = {
  api: {
    bodyParser: false,
  },
};

const VALID_KEYS = ["background", "background2", "logo", "missoPic", "whishlogo"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const form = new IncomingForm({ keepExtensions: true });

  const data = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { fields, files } = data;
  const imageKey = fields.imageKey?.[0];
  const file: File | undefined = Array.isArray(files.file) ? files.file[0] : files.file;

  if (!imageKey || !VALID_KEYS.includes(imageKey) || !file) {
    return res.status(400).json({ message: "Missing or invalid image key / file" });
  }

  try {
    const pool = getPool();

    const imageBuffer = fs.readFileSync(file.filepath);
    const mimetype = file.mimetype || "image/jpeg";
    const filename = file.originalFilename || `${imageKey}.jpg`;

    const blob = await put(`settings-images/${imageKey}-${filename}`, imageBuffer, {
      access: "public",
      contentType: mimetype,
      addRandomSuffix: true,
    });

    await pool.query(
      `INSERT INTO images (image_key, image_url, mimetype, filename)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (image_key)
       DO UPDATE SET image_url = EXCLUDED.image_url, mimetype = EXCLUDED.mimetype, filename = EXCLUDED.filename`,
      [imageKey, blob.url, mimetype, filename]
    );

    return res.status(200).json({ message: "Image updated successfully", url: blob.url });
  } catch (error) {
    console.error("Error updating settings image:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
