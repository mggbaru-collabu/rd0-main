import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const emailWhitelists = process.env.EMAIL_WHITELISTS.split(",");

export default NextAuth({
  session: {
    // 1 day
    maxAge: 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return (
        account.provider === "google" &&
        !!profile.email &&
        profile.email_verified === true &&
        emailWhitelists.includes(profile.email)
      );
    },
  },
});
