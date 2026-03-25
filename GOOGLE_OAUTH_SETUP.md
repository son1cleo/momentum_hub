# Google OAuth Setup for Momentum Grid

## Prerequisites
- Google Cloud account (create at https://console.cloud.google.com)
- A deployed instance URL (for production: your Vercel URL)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click **New Project**
4. Name: `momentum-grid`
5. Click **Create**
6. Wait for creation (1-2 mins)

## Step 2: Enable Google OAuth 2.0 API

1. In Cloud Console, search for **"OAuth consent screen"**
2. Click **Configure Consent Screen**
3. Choose **External** user type → **Create**
4. Fill in:
   - App name: `Momentum Grid`
   - User support email: your email
   - Developer email: your email
5. Click **Save and Continue**
6. Skip scopes (next page)
7. Add test users: add your email as a test user
8. Click **Save and Continue** → **Back to Dashboard**

## Step 3: Create OAuth 2.0 Credentials

1. In Cloud Console, go to **Credentials** (left sidebar)
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Name: `Momentum Grid Web`
5. Under **Authorized redirect URIs**, add both:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://[YOUR-VERCEL-DOMAIN].vercel.app/api/auth/callback/google` (production)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret** (save these!)

## Step 4: Add Environment Variables

Add to `.env.local`:
```
GOOGLE_ID=your-client-id-here
GOOGLE_SECRET=your-client-secret-here
```

For production on Vercel:
- Go to Project Settings → Environment Variables
- Add `GOOGLE_ID` and `GOOGLE_SECRET`
- Redeploy

## Step 5: Update Auth Configuration

In `src/auth.ts`, add the Google provider:

\`\`\`typescript
import Google from "next-auth/providers/google";

const config: NextAuthConfig = {
  providers: [
    // ... existing Credentials provider ...
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  // ... rest of config
};
\`\`\`

## Step 6: Update Login Page

Add Google sign-in button to `src/app/login/page.tsx`:

\`\`\`tsx
<form
  action={async () => {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }}
>
  <button className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-gray-100 transition flex items-center justify-center gap-2">
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      {/* Google icon SVG */}
    </svg>
    Sign in with Google
  </button>
</form>
\`\`\`

## Step 7: Install next-auth Google Provider

\`\`\`bash
npm install @auth/core
# Google provider is included in auth.js/next-auth
\`\`\`

## Testing

**Local:**
1. Run `npm run dev`
2. Go to http://localhost:3000/login
3. Click "Sign in with Google"
4. Use your test account

**Production:**
1. Deploy to Vercel with GOOGLE_ID and GOOGLE_SECRET set
2. Visit your production URL login
3. Test with Google account

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid redirect URI" | Ensure redirect URIs exactly match your domain + `/api/auth/callback/google` |
| "Unauthorized client" | Check GOOGLE_ID and GOOGLE_SECRET are correctly set in .env |
| "Consent screen error" | Revisit OAuth Consent Screen setup; ensure test users added if External type |
| "Sign in fails on mobile" | Verify your Vercel domain is added to authorized redirect URIs |

## Security Notes

- **Don't commit** `.env.local` (it's in `.gitignore`)
- In production, use Vercel's environment variable UI (never paste in code)
- Email account linking is disabled by default for safety
- Google accounts automatically create users in your DB

## Auto User Creation

When a user signs in with Google:
1. Auth.js creates a session
2. A `jwt()` callback verifies/creates the user in your database
3. The user is assigned VISITOR role by default (update in `src/auth.ts` if needed)

Update the JWT callback to auto-create users:

\`\`\`typescript
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.role = user.role || Role.VISITOR;
  }
  return token;
},
\`\`\`

And update session:

\`\`\`typescript
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role as Role;
  }
  return session;
},
\`\`\`
