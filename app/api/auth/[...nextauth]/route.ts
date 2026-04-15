import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"
import LinkedIn from "next-auth/providers/linkedin"

// ── Startup diagnostics (visible in Netlify Function logs) ──────────────────
console.log("[Auth] Initializing NextAuth...")
console.log("[Auth] AUTH_SECRET set:", !!process.env.AUTH_SECRET, "| length:", process.env.AUTH_SECRET?.length ?? 0)
console.log("[Auth] AUTH_URL:", process.env.AUTH_URL)
console.log("[Auth] AUTH_TRUST_HOST:", process.env.AUTH_TRUST_HOST)
console.log("[Auth] AUTH_TWITTER_ID set:", !!process.env.AUTH_TWITTER_ID, "| length:", process.env.AUTH_TWITTER_ID?.length ?? 0)
console.log("[Auth] AUTH_TWITTER_SECRET set:", !!process.env.AUTH_TWITTER_SECRET, "| length:", process.env.AUTH_TWITTER_SECRET?.length ?? 0)
console.log("[Auth] AUTH_LINKEDIN_ID set:", !!process.env.AUTH_LINKEDIN_ID)

const providers: any[] = []

if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
  console.log("[Auth] Adding Twitter provider")
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
} else {
  console.error("[Auth] MISSING Twitter credentials — AUTH_TWITTER_ID or AUTH_TWITTER_SECRET is not set!")
}

if (process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET) {
  console.log("[Auth] Adding LinkedIn provider")
  providers.push(
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
      authorization: {
        params: {
          scope: "openid profile email w_member_social",
        },
      },
    })
  )
}

if (providers.length === 0) {
  console.error("[Auth] FATAL — no providers configured. Auth will fail with Configuration error.")
}

let auth: any, handlers: any, signIn: any, signOut: any

try {
  const nextAuth = NextAuth({
    providers,
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
  auth = nextAuth.auth
  handlers = nextAuth.handlers
  signIn = nextAuth.signIn
  signOut = nextAuth.signOut
  console.log("[Auth] NextAuth initialized successfully")
} catch (err) {
  console.error("[Auth] FATAL — NextAuth() threw during initialization:", err)
  throw err
}

export { auth, signIn, signOut }

async function withLogging(req: Request, handler: (req: Request) => Promise<Response>) {
  console.log("[Auth] Incoming request:", req.method, new URL(req.url).pathname)
  try {
    const res = await handler(req)
    console.log("[Auth] Response status:", res.status)
    return res
  } catch (err) {
    console.error("[Auth] Handler threw:", err)
    throw err
  }
}

export async function GET(req: Request) {
  return withLogging(req, (r) => handlers.GET(r))
}

export async function POST(req: Request) {
  return withLogging(req, (r) => handlers.POST(r))
}
