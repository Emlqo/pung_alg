import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const requiredFirebaseEnvKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missingKeys = requiredFirebaseEnvKeys.filter((key) => !process.env[key]);

if (missingKeys.length > 0) {
  console.error("Firebase environment variables are missing:");
  for (const key of missingKeys) {
    console.error(`- ${key}`);
  }
  console.error(
    "Add these variables in Vercel Project Settings > Environment Variables, then create a new deployment.",
  );
  process.exit(1);
}

console.log(
  `Firebase environment variables found: ${requiredFirebaseEnvKeys.length}/${requiredFirebaseEnvKeys.length}`,
);
