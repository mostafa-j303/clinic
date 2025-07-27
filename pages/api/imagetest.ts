import fs from 'fs';
import path from 'path';
import { getPool } from '../../lib/db';

// Configure your DB connection string
const pool = getPool();

// Function to upload one image to DB
async function uploadImage(filePath: string) {
  const filename = path.basename(filePath);
  const mimetype = 'image/' + filename.split('.').pop(); // naive mimetype by extension
  const imageBuffer = fs.readFileSync(filePath);

  const query = `
    INSERT INTO (filename, mimetype, image)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

  const values = [ filename, mimetype, imageBuffer];

  const res = await pool.query(query, values);
  return res.rows[0].id;
}

// Example: upload multiple images mapped to product IDs
async function batchUpload() {
  try {
    // Example mapping: productId => local image file path
    const uploads = [
      {filePath: './public/Image/bg1.png' },
      {filePath: './public/Image/bg2.jpeg' },
      {filePath: './public/Image/logo.jpg' },
      {filePath: './public/Image/missopic.png' },
      {filePath: './public/Image/whish-money.png' },
    ];

    for (const {filePath } of uploads) {
      const imageId = await uploadImage( filePath);
      console.log(`Uploaded image ${imageId}`);
    }
  } catch (err) {
    console.error('Upload error:', err);
  } finally {
    await pool.end();
  }
}

batchUpload();
