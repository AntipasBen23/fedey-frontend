import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"
import LinkedIn from "next-auth/providers/linkedin"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
    }),
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.platform = account.provider
      }
      return token
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken
      session.platform = token.platform
      return session
    },
  },
})

export const { GET, POST } = handlers
