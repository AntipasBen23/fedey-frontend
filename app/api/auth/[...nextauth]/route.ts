import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"
import LinkedIn from "next-auth/providers/linkedin"

// ── Startup diagnostics ─────────────────────────────────────────────────────
console.log("[Auth] Initializing NextAuth...")
console.log("[Auth] AUTH_URL:", process.env.AUTH_URL)
console.log("[Auth] AUTH_TRUST_HOST:", process.env.AUTH_TRUST_HOST)
console.log("[Auth] AUTH_TWITTER_ID set:", !!process.env.AUTH_TWITTER_ID, "len:", process.env.AUTH_TWITTER_ID?.length)
console.log("[Auth] AUTH_TWITTER_SECRET set:", !!process.env.AUTH_TWITTER_SECRET, "len:", process.env.AUTH_TWITTER_SECRET?.length)

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

let auth: any, handlers: any, signIn: any, signOut: any

try {
  const nextAuth = NextAuth({
    providers,
    debug: true, // verbose server-side logging — visible in Netlify function logs
    logger: {
      error(code, ...message) {
        console.error("[NextAuth][error]", code, ...message)
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
          console.log("[Auth] jwt callback — account provider:", account.provider, "token_type:", account.token_type)
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
  auth = nextAuth.auth
  handlers = nextAuth.handlers
  signIn = nextAuth.signIn
  signOut = nextAuth.signOut
  console.log("[Auth] NextAuth initialized successfully")
} catch (err) {
  console.error("[Auth] FATAL — NextAuth() threw during init:", err)
  throw err
}

export { auth, signIn, signOut }

async function withLogging(req: Request, handler: (req: Request) => Promise<Response>) {
  const url = new URL(req.url)
  console.log("[Auth] →", req.method, url.pathname + url.search)
  try {
    const res = await handler(req)
    const location = res.headers.get("location") ?? ""
    console.log("[Auth] ←", res.status, location ? `redirect → ${location}` : "")
    // Flag if NextAuth is redirecting to the error page
    if (location.includes("/api/auth/error")) {
      console.error("[Auth] ERROR REDIRECT detected:", location)
    }
    return res
  } catch (err) {
    console.error("[Auth] handler threw:", err)
    throw err
  }
}

export async function GET(req: Request) {
  return withLogging(req, (r) => handlers.GET(r))
}

export async function POST(req: Request) {
  return withLogging(req, (r) => handlers.POST(r))
}
