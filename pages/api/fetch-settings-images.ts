// pages/api/settings.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { poolPromise } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pool = await poolPromise;

    // Fetch images and settings using stored procedures
    const [imagesResult, settingsResult] = await Promise.all([
      pool.query('SELECT * FROM get_image_data()'),
      // pool.query('SELECT id, mimetype, filename, image FROM images ORDER BY id ASC'),
      pool.query('SELECT * FROM get_settings_data()'),
      // pool.query('SELECT * FROM settings LIMIT 1')
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
        floor: settings.floor,
      },
      social: {
        facebook: settings.facebook,
        tiktok: settings.tiktok,
        insta: settings.instagram,
        mail: settings.mail,
        number: settings.phone_number,
        wishnb: settings.whatsapp_number,
      },
      discount: settings.discount,
      minOrder: settings.min_order,
      delivery: settings.delivery,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// CREATE OR REPLACE FUNCTION public.get_image_data()
// RETURNS TABLE (
//     id integer,
//     filename text,
//     mimetype text,
//     image bytea
// )
// LANGUAGE plpgsql
// AS $$
// BEGIN
//   RETURN QUERY
//   SELECT
//     i.id,
//     i.filename::TEXT,
//     i.mimetype::TEXT,
//     i.image::bytea
//   FROM images i
//   ORDER BY i.id ASC;
// END;
// $$;

// CREATE OR REPLACE FUNCTION public.get_settings_data()
// RETURNS TABLE (
//     my_location text,
//     web_title text,
//     primary_color text,
//     hover_primary text,
//     secondary_color text,
//     hover_secondary text,
//     address text,
//     building text,
//     floor text,
//     facebook text,
//     tiktok text,
//     instagram text,
//     mail text,
//     phone_number text,
//     whatsapp_number text,
//     discount text,
//     min_order text,
//     delivery text
// )
// LANGUAGE plpgsql
// AS $$
// BEGIN
//   RETURN QUERY
//   SELECT
//     s.my_location,
//     s.web_title,
//     s.primary_color,
//     s.hover_primary,
//     s.secondary_color,
//     s.hover_secondary,
//     s.address,
//     s.building,
//     s.floor,
//     s.facebook,
//     s.tiktok,
//     s.instagram,
//     s.mail,
//     s.phone_number,
//     s.whatsapp_number,
//     s.discount,
//     s.min_order,
//     s.delivery
//   FROM settings s
//   LIMIT 1;
// END;
// $$;
