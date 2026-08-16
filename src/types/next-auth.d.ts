import "next-auth";

declare module "next-auth" {
  interface Session {
    clientId: number;
    profileCompleted: boolean;
    phoneNumber: string | null;
    gender: string | null;
    needsBasicInfo: boolean;
    isSuspended: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    clientId: number;
    profileCompleted: boolean;
    phoneNumber: string | null;
    gender: string | null;
    isSuspended: boolean;
  }
}