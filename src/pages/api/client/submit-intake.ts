import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.clientId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const pool = connectToDatabase();
  const f = req.body;




  try {
    const existing = await pool.query(
      "SELECT id FROM client_intake_forms WHERE client_id = $1",
      [session.clientId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "You have already submitted the form",
      });
    }
    if (!f.fullName || !f.age || !f.gender || !f.reason || !f.currentWeight || !f.heightCm || !f.exercises || !f.usualWeight) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }
    const toBool = (val: string) =>
      val === "Yes" ? true : val === "No" ? false : null;

    await pool.query(
      `INSERT INTO client_intake_forms (
        client_id, full_name, age, phone_number, gender, occupation,
        reason, goals, specific_goal,
        medical_conditions, past_surgeries, food_allergies,
        medications,
        current_weight, height_cm, usual_weight,
        typical_day_eating, meals_per_day, water_intake, eat_out_frequency,
        eating_behaviors, eating_challenges,
        exercises, exercise_details,
        sleep_hours, stress_level,
        menstrual_regular, women_conditions,
        has_lab_tests, lab_results,
        readiness_scale, expected_challenges, expectations,
        additional_info
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
        $17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34
      )
     `,
      [
        session.clientId,
        f.fullName, f.age, f.phoneNumber, f.gender, f.occupation,
        f.reason, f.goals, f.specificGoal,
        f.medicalConditions, f.pastSurgeries, f.foodAllergies,
        f.medications,
        f.currentWeight, f.heightCm, f.usualWeight,
        f.typicalDayEating, f.mealsPerDay, f.waterIntake, f.eatOutFrequency,
        f.eatingBehaviors, f.eatingChallenges,
        f.exercises, f.exerciseDetails,
        f.sleepHours, f.stressLevel,
        toBool(f.menstrualRegular), f.womenConditions,
        toBool(f.hasLabTests), f.labResults,
        f.readinessScale, f.expectedChallenges, f.expectations,
        f.additionalInfo,
      ]
    );

    await pool.query(
      "UPDATE clients SET profile_completed = true WHERE id = $1",
      [session.clientId]
    );

    return res.status(200).json({ message: "Form submitted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}