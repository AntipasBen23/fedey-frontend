import { NextResponse } from "next/server"

// Temporary debug endpoint — shows auth config state WITHOUT exposing secret values
// Hit https://furciai.com/api/debug-auth in your browser to see the output
export async function GET() {
  const twitterId = process.env.AUTH_TWITTER_ID
  const twitterSecret = process.env.AUTH_TWITTER_SECRET
  const authSecret = process.env.AUTH_SECRET
  const authUrl = process.env.AUTH_URL
  const nextauthUrl = process.env.NEXTAUTH_URL
  const trustHost = process.env.AUTH_TRUST_HOST
  const linkedinId = process.env.AUTH_LINKEDIN_ID

  return NextResponse.json({
    AUTH_SECRET: {
      set: !!authSecret,
      length: authSecret?.length ?? 0,
    },
    AUTH_URL: authUrl ?? "(not set)",
    NEXTAUTH_URL: nextauthUrl ?? "(not set)",
    AUTH_TRUST_HOST: trustHost ?? "(not set)",
    AUTH_TWITTER_ID: {
      set: !!twitterId,
      length: twitterId?.length ?? 0,
      // Show first and last 3 chars so you can verify it's correct (no full value)
      preview: twitterId ? `${twitterId.slice(0, 3)}...${twitterId.slice(-3)}` : "(not set)",
      hasLeadingQuote: twitterId?.startsWith('"') ?? false,
      hasTrailingQuote: twitterId?.endsWith('"') ?? false,
    },
    AUTH_TWITTER_SECRET: {
      set: !!twitterSecret,
      length: twitterSecret?.length ?? 0,
      hasLeadingQuote: twitterSecret?.startsWith('"') ?? false,
      hasTrailingQuote: twitterSecret?.endsWith('"') ?? false,
    },
    AUTH_LINKEDIN_ID: {
      set: !!linkedinId,
    },
    nodeEnv: process.env.NODE_ENV,
  })
}
