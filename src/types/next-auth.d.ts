import type { Session, User } from "inspector/promises";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
    };
  }
}
