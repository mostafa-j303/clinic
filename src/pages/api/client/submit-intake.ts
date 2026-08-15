import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../../lib/db";
import { generateIntakeEmailHTML } from "../../../app/utils/emailTemplates";
import { sendWhatsAppMessage } from "../../../lib/whatsapp";
import { intakeFormWhatsAppParams } from "../../../app/utils/whatsappTemplates";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@yourapp.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Your Business";

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
    const clientResult = await pool.query(
      "SELECT email, full_name FROM clients WHERE id = $1",
      [session.clientId]
    );

    const client = clientResult.rows[0];
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
        food_dislikes, budget_constraints,
        eating_behaviors, eating_challenges,
        exercises, exercise_details,
        sleep_hours, stress_level, smokes, drinks_alcohol,
        menstrual_regular, women_conditions, pregnant_breastfeeding,
        has_lab_tests, lab_results,
        readiness_scale, expected_challenges, expectations,
        additional_info
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
        $17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36,$37,$38,$39
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
        f.foodDislikes, f.budgetConstraints,
        f.eatingBehaviors, f.eatingChallenges,
        f.exercises, f.exerciseDetails,
        f.sleepHours, f.stressLevel, toBool(f.smokes), toBool(f.drinksAlcohol),
        toBool(f.menstrualRegular), f.womenConditions, toBool(f.pregnantBreastfeeding),
        toBool(f.hasLabTests), f.labResults,
        f.readinessScale, f.expectedChallenges, f.expectations,
        f.additionalInfo,
      ]
    );

    await pool.query(
      "UPDATE clients SET profile_completed = true WHERE id = $1",
      [session.clientId]
    );

    try {
      const settingsResult = await pool.query(
        "SELECT mail, primary_color, accent_color FROM settings LIMIT 1"
      );
      const adminEmail = settingsResult.rows[0]?.mail;
      const brandPrimary = settingsResult.rows[0]?.primary_color;
      const brandAccent = settingsResult.rows[0]?.accent_color;

      if (adminEmail && BREVO_API_KEY) {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: {
              name: BREVO_SENDER_NAME,
              email: BREVO_SENDER_EMAIL,
            },
            to: [
              {
                email: adminEmail,
                name: "Admin",
              },
            ],
            subject: `New Intake Form Submission from ${f.fullName}`,
            htmlContent: generateIntakeEmailHTML({
              fullName: f.fullName,
              email: client?.email || session.user?.email || "-",
              phoneNumber: f.phoneNumber,
              age: String(f.age),
              gender: f.gender,
              occupation: f.occupation,
              reason: f.reason,
              currentWeight: String(f.currentWeight),
              heightCm: String(f.heightCm),
              usualWeight: String(f.usualWeight),
              exercises: f.exercises === "Yes" && f.exerciseDetails
                ? `Yes - ${f.exerciseDetails}`
                : f.exercises,
              brandPrimary,
              brandAccent,
            }),
          }),
        });
      }
    } catch (emailError) {
      console.error("Error sending intake form email:", emailError);
    }

    try {
      await sendWhatsAppMessage(intakeFormWhatsAppParams(f.fullName, f.reason));
    } catch (whatsappError) {
      console.error("Error sending intake form WhatsApp notification:", whatsappError);
    }

    return res.status(200).json({ message: "Form submitted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
