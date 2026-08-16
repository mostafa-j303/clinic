// pages/api/update-settings.ts
import { NextApiRequest, NextApiResponse } from "next";
import { poolPromise } from "../../../lib/db";
import { requireAdmin } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

 const session = await requireAdmin(req, res);
  if (!session) return;

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
      rewardThreshold,
      rewardBonus,
      siteUrl,
    } = req.body;

    // Normalize: trim, strip a trailing slash, add https:// if the admin left the protocol off.
    let normalizedSiteUrl: string | null = siteUrl ? String(siteUrl).trim() : null;
    if (normalizedSiteUrl) {
      normalizedSiteUrl = normalizedSiteUrl.replace(/\/+$/, "");
      if (!/^https?:\/\//i.test(normalizedSiteUrl)) {
        normalizedSiteUrl = `https://${normalizedSiteUrl}`;
      }
    }

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
        accent_color = $7,
        address = $8,
        building = $9,
        floor = $10,
        facebook = $11,
        tiktok = $12,
        instagram = $13,
        mail = $14,
        phone_number = $15,
        whatsapp_number = $16,
        discount = $17,
        min_order = $18,
        delivery = $19,
        reward_threshold = $20,
        reward_bonus = $21,
        site_url = $22
      `,
      [
        myLocation,
        webtitle,
        colors.primary,
        colors.hovprimary,
        colors.secondary,
        colors.hovsecondary,
        colors.accent,
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
        rewardThreshold || null,
        rewardBonus || null,
        normalizedSiteUrl,
      ]
    );

    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
