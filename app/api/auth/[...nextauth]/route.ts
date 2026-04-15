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
        params: {
          scope: "openid profile email w_member_social",
        },
      },
    }) as any
  )
}

const nextAuth = NextAuth({
  providers,
  // Custom error page — shows details in the browser
  pages: {
    error: "/auth/error",
  },
  debug: true,
  logger: {
    error(code, ...message) {
      console.error("[NextAuth][error]", JSON.stringify(code), ...message)
    },
    warn(code, ...message) {
      console.warn("[NextAuth][warn]", code, ...message)
    },
    debug(code, ...message) {
      console.log("[NextAuth][debug]", code, ...message)
    },
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

export const { auth, signIn, signOut } = nextAuth

async function withLogging(req: Request, handler: (req: Request) => Promise<Response>) {
  const url = new URL(req.url)
  const path = url.pathname + url.search

  try {
    const res = await handler(req)
    const location = res.headers.get("location") ?? ""

    // When NextAuth redirects to our custom error page, add request context as detail
    if (location.includes("/auth/error")) {
      const errorUrl = new URL(location, url.origin)
      // Add the incoming query params as context so the error page can show them
      const incoming = Object.fromEntries(url.searchParams.entries())
      if (Object.keys(incoming).length > 0) {
        errorUrl.searchParams.set("detail", JSON.stringify(incoming))
      }
      errorUrl.searchParams.set("path", path)
      const headers = new Headers(res.headers)
      headers.set("location", errorUrl.toString())
      return new Response(null, { status: res.status, headers })
    }

    return res
  } catch (err: any) {
    console.error("[Auth] handler threw:", err?.message ?? err)
    // Redirect to error page with the thrown error message
    const errUrl = new URL("/auth/error", url.origin)
    errUrl.searchParams.set("error", "ServerError")
    errUrl.searchParams.set("detail", String(err?.message ?? err).substring(0, 300))
    return Response.redirect(errUrl.toString(), 302)
  }
}

export async function GET(req: Request) {
  return withLogging(req, (r) => nextAuth.handlers.GET(r))
}

export async function POST(req: Request) {
  return withLogging(req, (r) => nextAuth.handlers.POST(r))
}
