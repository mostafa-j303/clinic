import { connectToDatabase, getPool } from "../../../lib/db";

export async function findClientByEmail(email: string) {
  const pool = connectToDatabase();
  const result = await pool.query("SELECT id FROM clients WHERE email = $1", [email]);
  return result.rows[0] ?? null;
}

export async function createClient(input: {
  email: string;
  passwordHash: string;
  fullName: string;
}) {
  const pool = connectToDatabase();
  await pool.query(
    `INSERT INTO clients (email, password_hash, full_name, profile_completed)
     VALUES ($1, $2, $3, false)`,
    [input.email, input.passwordHash, input.fullName]
  );
}

export async function getClientAccountInfo(clientId: number) {
  const pool = connectToDatabase();
  const result = await pool.query(
    "SELECT email, full_name FROM clients WHERE id = $1",
    [clientId]
  );
  return result.rows[0] ?? null;
}

/** Admin notification email + brand colors, shared by every server-side email trigger (registration, intake). */
export async function getAdminNotificationSettings() {
  const pool = connectToDatabase();
  const result = await pool.query(
    "SELECT mail, primary_color, accent_color FROM settings LIMIT 1"
  );
  const row = result.rows[0];
  return {
    adminEmail: row?.mail as string | undefined,
    brandPrimary: row?.primary_color as string | undefined,
    brandAccent: row?.accent_color as string | undefined,
  };
}

export async function getIntakeFormForClient(clientId: number) {
  const pool = connectToDatabase();
  const result = await pool.query(
    "SELECT * FROM client_intake_forms WHERE client_id = $1",
    [clientId]
  );
  return result.rows[0] ?? null;
}

export async function intakeFormExistsForClient(clientId: number) {
  const pool = connectToDatabase();
  const result = await pool.query(
    "SELECT id FROM client_intake_forms WHERE client_id = $1",
    [clientId]
  );
  return result.rows.length > 0;
}

export type IntakeFormInput = {
  fullName: string;
  age: unknown;
  phoneNumber: unknown;
  gender: unknown;
  occupation: unknown;
  reason: unknown;
  goals: unknown;
  specificGoal: unknown;
  medicalConditions: unknown;
  pastSurgeries: unknown;
  foodAllergies: unknown;
  medications: unknown;
  currentWeight: unknown;
  heightCm: unknown;
  usualWeight: unknown;
  typicalDayEating: unknown;
  mealsPerDay: unknown;
  waterIntake: unknown;
  eatOutFrequency: unknown;
  foodDislikes: unknown;
  budgetConstraints: unknown;
  eatingBehaviors: unknown;
  eatingChallenges: unknown;
  exercises: unknown;
  exerciseDetails: unknown;
  sleepHours: unknown;
  stressLevel: unknown;
  smokes: unknown;
  drinksAlcohol: unknown;
  menstrualRegular: unknown;
  womenConditions: unknown;
  pregnantBreastfeeding: unknown;
  hasLabTests: unknown;
  labResults: unknown;
  readinessScale: unknown;
  expectedChallenges: unknown;
  expectations: unknown;
  additionalInfo: unknown;
};

const toBool = (val: unknown) => (val === "Yes" ? true : val === "No" ? false : null);

export async function insertIntakeForm(clientId: number, f: IntakeFormInput) {
  const pool = connectToDatabase();
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
    )`,
    [
      clientId,
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
}

export async function markProfileCompleted(clientId: number, completed: boolean) {
  const pool = connectToDatabase();
  await pool.query("UPDATE clients SET profile_completed = $1 WHERE id = $2", [
    completed,
    clientId,
  ]);
}

export async function listClientsWithIntakeSummary() {
  const pool = connectToDatabase();
  const result = await pool.query(`
    SELECT
      c.id, c.email, c.full_name, c.profile_completed, c.created_at,
      f.age, f.gender, f.phone_number, f.current_weight, f.height_cm,
      f.goals, f.medical_conditions, f.readiness_scale
    FROM clients c
    LEFT JOIN client_intake_forms f ON f.client_id = c.id
    ORDER BY c.created_at DESC
  `);
  return result.rows;
}

export async function listIntakeFormsFull() {
  const pool = connectToDatabase();
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
      f.food_dislikes,
      f.budget_constraints,
      f.eating_behaviors,
      f.eating_challenges,
      f.exercises,
      f.exercise_details,
      f.sleep_hours,
      f.stress_level,
      f.smokes,
      f.drinks_alcohol,
      f.menstrual_regular,
      f.women_conditions,
      f.pregnant_breastfeeding,
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
  return result.rows;
}

/** Deletes an intake form and un-marks its client's profile as completed, transactionally. */
export async function deleteIntakeForm(
  intakeFormId: number | string
): Promise<{ notFound: boolean }> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const formResult = await client.query(
      "SELECT client_id FROM client_intake_forms WHERE id = $1",
      [intakeFormId]
    );

    if (formResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return { notFound: true };
    }

    const clientId = formResult.rows[0].client_id;

    await client.query("DELETE FROM client_intake_forms WHERE id = $1", [intakeFormId]);
    await client.query("UPDATE clients SET profile_completed = false WHERE id = $1", [
      clientId,
    ]);

    await client.query("COMMIT");
    return { notFound: false };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
