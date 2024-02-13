import { db } from "@/lib/db/index";
import { DrizzleAdapter as OriginalDrizzleAdapter } from "@auth/drizzle-adapter";
import { Adapter } from "next-auth/adapters"; 
import { DefaultSession, getServerSession, NextAuthOptions } from "next-auth";
import { redirect } from "next/navigation";
import { env } from "@/lib/env.mjs"
import GithubProvider from "next-auth/providers/github";


declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
  }
}

export type AuthSession = {
  session: {
    user: {
      id: string;
      name?: string;
      email?: string;
    };
  } | null;
};

const DrizzleAdapter: Adapter = OriginalDrizzleAdapter(db) as Adapter;

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter, // Use the casted adapter here
  callbacks: {
    session: ({ session, user }) => {
      session.user.id = user.id; // Ensure the session includes the user's ID
      return session;
    },
  },
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    })
  ],
};



export const getUserAuth = async () => {
  const session = await getServerSession(authOptions);
  return { session } as AuthSession;
};

export const checkAuth = async () => {
  const { session } = await getUserAuth();
  if (!session) redirect("/api/auth/signin");
};

