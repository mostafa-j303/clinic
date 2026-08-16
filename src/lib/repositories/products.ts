import { getPool } from "../../../lib/db";

export async function listProductsWithCategories() {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT * FROM view_products_with_image`);

  const products = rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    details: row.details,
    categories: row.category,
    image: row.image_url || null,
    filename: row.filename || null,
  }));

  const categoryResult = await pool.query(`SELECT * FROM get_all_category_names();`);

  return { products, categories: categoryResult.rows };
}

export async function findCategoryIdByName(name: string): Promise<number | null> {
  const pool = getPool();
  const res = await pool.query("SELECT id FROM categories WHERE name = $1", [name]);
  return res.rows?.[0]?.id ?? null;
}

export async function insertProduct(input: {
  name: string;
  price: string;
  details: string;
  categoryId: number;
}): Promise<number> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO products (name, price, details, category_id)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [input.name, input.price, input.details, input.categoryId]
  );
  return result.rows[0].id;
}

export async function updateProductFields(input: {
  id: number;
  name: string;
  price: string;
  details: string;
  categoryId: number;
}) {
  const pool = getPool();
  await pool.query(
    `UPDATE products
     SET name = $1, price = $2, details = $3, category_id = $4
     WHERE id = $5`,
    [input.name, input.price, input.details, input.categoryId, input.id]
  );
}

export async function insertProductImage(input: {
  productId: number;
  imageUrl: string;
  mimetype: string;
  filename: string;
}) {
  const pool = getPool();
  await pool.query(
    `INSERT INTO product_images (product_id, image_url, mimetype, filename)
     VALUES ($1, $2, $3, $4)`,
    [input.productId, input.imageUrl, input.mimetype, input.filename]
  );
}

export async function deleteProductImages(productId: number) {
  const pool = getPool();
  await pool.query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
}

export async function deleteProduct(id: number | string) {
  const pool = getPool();
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
}
