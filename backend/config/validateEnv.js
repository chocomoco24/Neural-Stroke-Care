// Fail fast at boot if required environment variables are missing or unsafe.
// Prevents the app from starting in a broken/insecure state (e.g. signing
// JWTs with an undefined secret).

const REQUIRED = ["JWT_SECRET", "DB_NAME", "DB_USER", "DB_HOST", "ML_API_URL"];

function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`[Config] Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  const secret = process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === "production";
  const weak = !secret || secret.length < 32 || secret === "replace_with_a_long_random_secret_string";

  if (weak) {
    const msg = "[Config] JWT_SECRET is missing or too weak (needs >= 32 random chars).";
    if (isProd) {
      console.error(msg + " Refusing to start in production.");
      process.exit(1);
    }
    console.warn(msg + " Continuing in non-production mode.");
  }
}

module.exports = { validateEnv };
