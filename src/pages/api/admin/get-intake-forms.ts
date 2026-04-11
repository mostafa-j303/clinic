import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { connectToDatabase } from "../../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const pool = connectToDatabase();

  try {
    const result = await pool.query(`
      SELECT
        f.id,
        f.client_id,
        c.email,
        c.full_name AS account_full_name,
        c.profile_completed,
        c.created_at AS client_created_at,
        f.full_name,
        f.age,
        f.phone_number,
        f.gender,
        f.occupation,
        f.reason,
        f.goals,
        f.specific_goal,
        f.medical_conditions,
        f.past_surgeries,
        f.food_allergies,
        f.medications,
        f.current_weight,
        f.height_cm,
        f.usual_weight,
        f.typical_day_eating,
        f.meals_per_day,
        f.water_intake,
        f.eat_out_frequency,
        f.eating_behaviors,
        f.eating_challenges,
        f.exercises,
        f.exercise_details,
        f.sleep_hours,
        f.stress_level,
        f.menstrual_regular,
        f.women_conditions,
        f.has_lab_tests,
        f.lab_results,
        f.readiness_scale,
        f.expected_challenges,
        f.expectations,
        f.additional_info
      FROM client_intake_forms f
      JOIN clients c ON c.id = f.client_id
      ORDER BY c.created_at DESC, f.id DESC
    `);

    return res.status(200).json({ intakeForms: result.rows });
  } catch (error) {
    console.error("Error fetching intake forms:", error);
    return res.status(500).json({ message: "Failed to fetch intake forms" });
  }
}
