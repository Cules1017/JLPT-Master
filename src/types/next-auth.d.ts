import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "GUEST" | "USER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "GUEST" | "USER" | "ADMIN";
  }
}
