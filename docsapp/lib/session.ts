import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

/**
 * Returns the server session from next-auth`
 */
export const getAuthSession = async (): Promise<Session | null> => {
  return await getServerSession(authOptions);
};
