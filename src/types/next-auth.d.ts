import "next-auth";

declare module "next-auth" {
  interface Session {
    clientId: number;
    profileCompleted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    clientId: number;
    profileCompleted: boolean;
  }
}