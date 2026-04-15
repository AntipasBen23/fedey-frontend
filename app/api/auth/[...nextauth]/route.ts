import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"
import LinkedIn from "next-auth/providers/linkedin"

const providers: any[] = []

if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
  providers.push(
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
      authorization: {
        params: {
          scope: "users.read tweet.read tweet.write offline.access",
        },
      },
    })
  )
}

if (process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET) {
  providers.push(
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
      authorization: {
        params: { scope: "openid profile email w_member_social" },
      },
    }) as any
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.platform = account.provider
        token.tokenType = account.token_type
      }
      return token
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.platform = token.platform
      return session
    },
  },
})

export const { GET, POST } = handlers
