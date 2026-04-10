import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "../../../../lib/db";
import bcrypt from "bcrypt";

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
          "SELECT id FROM clients WHERE google_id = $1 OR email = $2",
          [user.id, user.email]
        );

        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO clients (google_id, email, full_name, profile_completed)
             VALUES ($1, $2, $3, false)`,
            [user.id, user.email, user.name]
          );
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
      // 🔥 always ensure DB sync
      const result = await pool.query(
        "SELECT id, profile_completed FROM clients WHERE email = $1",
        [token.email]
      );

      if (result.rows[0]) {
        token.clientId = result.rows[0].id;
        token.profileCompleted = result.rows[0].profile_completed;
      }
      return token;
    },

    async session({ session, token }) {
      session.clientId = token.clientId as number;
      session.profileCompleted = token.profileCompleted as boolean;
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