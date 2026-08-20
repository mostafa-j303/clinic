import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "../../../../lib/db";
import bcrypt from "bcrypt";
import { notifyNewRegistration } from "../../../lib/registrationNotification";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const pool = connectToDatabase();
        const result = await pool.query(
          "SELECT * FROM clients WHERE email = $1",
          [credentials.email]
        );

        const client = result.rows[0];
        if (!client || !client.password_hash) return null;

        if (client.is_suspended) {
          throw new Error("SUSPENDED");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          client.password_hash
        );
        if (!isValid) return null;

        return {
          id: String(client.id),
          email: client.email,
          name: client.full_name,
          profileCompleted: client.profile_completed,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const pool = connectToDatabase();
        const existing = await pool.query(
          "SELECT id, is_suspended FROM clients WHERE google_id = $1 OR email = $2",
          [user.id, user.email]
        );

        if (existing.rows.length === 0) {
          const created = await pool.query(
            `INSERT INTO clients (google_id, email, full_name, profile_completed)
             VALUES ($1, $2, $3, false) RETURNING id`,
            [user.id, user.email, user.name]
          );
          // Unlike every other "something happened" event in this app, a
          // first-time Google sign-in used to create the client row here
          // with no notification at all — the admin only ever heard about
          // credentials registrations (register.ts). Fire-and-forget so a
          // slow/failed notification never blocks sign-in itself.
          notifyNewRegistration(created.rows[0].id, user.name || "New client", user.email || "").catch(
            (err) => console.error("Error sending Google registration notification:", err)
          );
        } else if (existing.rows[0].is_suspended) {
          return "/client-portal?error=SUSPENDED";
        } else if (!existing.rows[0].google_id) {
          // Link Google to existing email account
          await pool.query(
            "UPDATE clients SET google_id = $1 WHERE email = $2",
            [user.id, user.email]
          );
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const pool = connectToDatabase();
      // 🔥 when session.update() is called
      if (trigger === "update" && session?.profileCompleted !== undefined) {
        token.profileCompleted = session.profileCompleted;
      }
      if (trigger === "update" && session?.phoneNumber !== undefined) {
        token.phoneNumber = session.phoneNumber;
      }
      if (trigger === "update" && session?.gender !== undefined) {
        token.gender = session.gender;
      }
      // 🔥 always ensure DB sync
      const result = await pool.query(
        "SELECT id, profile_completed, phone_number, gender, is_suspended FROM clients WHERE email = $1",
        [token.email]
      );

      if (result.rows[0]) {
        token.clientId = result.rows[0].id;
        token.profileCompleted = result.rows[0].profile_completed;
        token.phoneNumber = result.rows[0].phone_number;
        token.gender = result.rows[0].gender;
        token.isSuspended = result.rows[0].is_suspended;
      }
      return token;
    },

    async session({ session, token }) {
      session.clientId = token.clientId as number;
      session.profileCompleted = token.profileCompleted as boolean;
      session.phoneNumber = (token.phoneNumber as string | null) ?? null;
      session.gender = (token.gender as string | null) ?? null;
      session.needsBasicInfo = !token.phoneNumber || !token.gender;
      session.isSuspended = Boolean(token.isSuspended);
      return session;
    },
  },
  pages: {
    signIn: "/client-portal",
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);