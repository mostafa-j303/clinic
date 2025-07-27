// pages/api/settings.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { poolPromise } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pool = await poolPromise;

    // Fetch images and settings
    const [imagesResult, settingsResult] = await Promise.all([
      pool.query('SELECT id, mimetype, filename, image FROM images ORDER BY id ASC'),
      pool.query('SELECT * FROM settings LIMIT 1')
    ]);

    const settings = settingsResult.rows[0];
    const imageMap: { [key: string]: string } = {};

    // Convert bytea to base64 and map to known image names
    const expectedKeys = ['background', 'background2', 'logo', 'missoPic', 'whishlogo'];

   imagesResult.rows.forEach((img, index) => {
  if (index < expectedKeys.length) {
    imageMap[expectedKeys[index]] = `data:${img.mimetype};base64,${img.image.toString('base64')}`;
  }
});

    const response = {
      images: imageMap,
      myLocation: settings.my_location,
      webtitle: settings.web_title,
      colors: {
        primary: settings.primary_color,
        hovprimary: settings.hover_primary,
        secondary: settings.secondary_color,
        hovsecondary: settings.hover_secondary,
      },
      addressdetail: {
        address: settings.address,
        building: settings.building,
        floor: settings.floor
      },
      social: {
        facebook: settings.facebook,
        tiktok: settings.tiktok,
        insta: settings.instagram,
        mail: settings.mail,
        number: settings.phone_number,
        wishnb: settings.wahtsapp_number
      },
      discount: settings.discount,
      minOrder: settings.min_order,
      delivery: settings.delivery
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
