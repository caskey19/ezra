# Ezra

Student athlete command OS — dashboard, mail, and calendar synced from Gmail and Google Calendar via Firebase.

## Stack

- React + TypeScript + Vite
- Firebase Auth, Firestore, Cloud Functions
- Tailwind CSS + Framer Motion

## Quick start

```bash
npm install
cp .env.example .env.local
# set VITE_GOOGLE_OAUTH_CLIENT_ID
npm run dev
```

Google sync setup (APIs, secrets, deploy): see [docs/google-sync.md](docs/google-sync.md).

```bash
npm run functions:build
npm run deploy:firebase
```
