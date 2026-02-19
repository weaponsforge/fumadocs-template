import {
  getAllowedEmails,
  getHostedDomain,
  getMultipleHostedDomains,
} from "@/lib/utils";

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const singleHostedDomain = getHostedDomain();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          // Use Google's hosted domain parameter if a single email domain is specified
          // This restricts the account picker to only show accounts from that email domain
          ...(singleHostedDomain && { hd: singleHostedDomain }),
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      const email = (profile?.email || "").toLowerCase().trim();

      if (!email || !email.includes("@")) {
        return false;
      }

      // Check domain restriction (if ALLOWED_EMAIL_DOMAINS is set)
      const allowedDomains = getMultipleHostedDomains();
      const allowedEmails = getAllowedEmails();
      const domain = email.split("@")[1];

      const isAllowedDomain =
        allowedDomains.length === 0
          ? true // If no domains specified, allow all domains
          : allowedDomains.includes(domain);

      // Check email restriction (if ALLOWED_EMAILS is set)
      const isAllowedEmail =
        allowedEmails.length === 0
          ? true // If no emails specified, allow all emails
          : allowedEmails.includes(email);

      return isAllowedDomain && isAllowedEmail;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
