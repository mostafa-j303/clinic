// pages/api/update-settings.ts
import { NextApiRequest, NextApiResponse } from "next";
import { poolPromise } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const {
      myLocation,
      webtitle,
      colors,
      addressdetail,
      social,
      discount,
      minOrder,
      delivery,
    } = req.body;

    const pool = await poolPromise;

    await pool.query(
      `
      UPDATE settings
      SET
        my_location = $1,
        web_title = $2,
        primary_color = $3,
        hover_primary = $4,
        secondary_color = $5,
        hover_secondary = $6,
        address = $7,
        building = $8,
        floor = $9,
        facebook = $10,
        tiktok = $11,
        instagram = $12,
        mail = $13,
        phone_number = $14,
        whatsapp_number = $15,
        discount = $16,
        min_order = $17,
        delivery = $18
      `,
      [
        myLocation,
        webtitle,
        colors.primary,
        colors.hovprimary,
        colors.secondary,
        colors.hovsecondary,
        addressdetail.address,
        addressdetail.building,
        addressdetail.floor,
        social.facebook,
        social.tiktok,
        social.insta,
        social.mail,
        social.number,
        social.wishnb,
        discount,
        minOrder,
        delivery,
      ]
    );

    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
