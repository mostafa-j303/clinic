// One-off script: uploads every bytea image currently in Postgres to Vercel Blob
// and writes the resulting URL back into the new image_url column.
// Run with: npx tsx scripts/migrate-images-to-blob.ts
// Requires BLOB_READ_WRITE_TOKEN to be set (in .env or the shell environment).
// Safe to re-run: rows that already have an image_url are skipped.

import "dotenv/config";
import { put } from "@vercel/blob";
import { Pool } from "pg";

async function migrateTable(pool: Pool, table: "images" | "product_images", pathPrefix: string) {
  const { rows } = await pool.query(
    `SELECT id, filename, mimetype, image FROM ${table} WHERE image_url IS NULL`
  );

  console.log(`${table}: ${rows.length} row(s) to migrate`);

  for (const row of rows) {
    const filename = row.filename || `${row.id}.jpg`;
    const contentType = row.mimetype || "image/jpeg";

    const blob = await put(`${pathPrefix}/${row.id}-${filename}`, row.image, {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });

    await pool.query(`UPDATE ${table} SET image_url = $1 WHERE id = $2`, [blob.url, row.id]);

    console.log(`  ${table}.id=${row.id} -> ${blob.url}`);
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Error: BLOB_READ_WRITE_TOKEN is not set. Aborting.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL is not set. Aborting.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await migrateTable(pool, "product_images", "product-images");
    await migrateTable(pool, "images", "settings-images");
    console.log("Migration complete.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
