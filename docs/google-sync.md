# Ezra Google Sync Setup

Ezra syncs **Gmail** and **Google Calendar** through Firebase Auth + Cloud Functions into Firestore. The UI never calls Google APIs directly after connect.

## Architecture

1. User signs in with Google (Firebase Auth).
2. Google Identity Services returns an offline OAuth **authorization code** (Gmail + Calendar readonly scopes).
3. Callable `linkGoogle` exchanges the code for a **refresh token** (stored under `users/{uid}/secrets/google`, Admin-only).
4. `syncGoogle` / `scheduledSyncGoogle` pull inbox + calendar into Firestore.
5. Dashboard pods and `/mail` + `/calendar` subscribe to Firestore.

## Console prerequisites

Firebase project: `athlete-os-a0986` (Blaze plan required for Functions).

### 1. Enable APIs

In Google Cloud Console for this project, enable:

- Gmail API
- Google Calendar API
- Identity Toolkit / Firebase Auth (already on with Firebase)

### 2. OAuth consent screen

Add scopes:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/calendar.readonly`

Add your Google account as a test user while the app is in Testing.

### 3. OAuth Web client

Firebase Console → Authentication → Sign-in method → Google → enable.

Copy the **Web client ID** and **Web client secret** from the Google Cloud Credentials page (OAuth 2.0 Client IDs → Web client).

Authorized JavaScript origins should include:

- `http://localhost:5173`
- your production origin
- `https://athlete-os-a0986.firebaseapp.com`

### 4. Frontend env

Create `.env.local` in the repo root:

```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Use the same Web client ID Firebase Google sign-in uses.

### 5. Functions secrets

```bash
firebase login
firebase use athlete-os-a0986

# Set secrets used by linkGoogle / syncGoogle / scheduledSyncGoogle
firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_ID
firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_SECRET
```

Paste the Web client ID and secret when prompted.

Optional override (defaults to `postmessage` for GIS popup code flow):

```bash
# only if you change the OAuth redirect model
# GOOGLE_OAUTH_REDIRECT_URI=postmessage
```

### 6. Deploy

```bash
npm --prefix functions install
npm --prefix functions run build

firebase deploy --only firestore:rules,firestore:indexes,functions
```

Deploy the Vite app separately (`npm run build` / your host).

## Local app

```bash
npm install
npm run dev
```

In the header, click **Connect Google** → grant Gmail + Calendar → Ezra runs an initial sync.

Use the refresh icon to call `syncGoogle` manually. Scheduled sync runs every **15 minutes**.

## Firestore paths

| Path | Access |
|---|---|
| `users/{uid}` | owner read |
| `users/{uid}/mail/{id}` | owner read |
| `users/{uid}/events/{id}` | owner read |
| `users/{uid}/secrets/google` | **denied** to clients (Admin SDK only) |

## Troubleshooting

- **No refresh token**: Revoke Ezra under [Google Account → Third-party access](https://myaccount.google.com/permissions), then Connect Google again so consent is re-granted.
- **`invalid_grant` / redirect mismatch**: Ensure Functions exchange uses `redirect_uri=postmessage` (default) to match GIS popup code client.
- **Callable CORS / not-found**: Confirm functions deployed to `us-central1` and the web app uses `getFunctions(app, "us-central1")`.
- **Empty mail/calendar**: Check Functions logs; confirm Gmail/Calendar APIs are enabled and consent scopes include readonly Gmail + Calendar.
