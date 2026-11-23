const validateEnv = () => {
  const requiredVariables = ["DATABASE_URL", "JWT_SECRET"];

  // 1. Check required environment variables.
  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]?.trim(),
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }

  // 2. Validate JWT secret length in production.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.JWT_SECRET.length < 32
  ) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters long in production.",
    );
  }

  // 3. Validate CLIENT_URL in production.
  if (process.env.NODE_ENV === "production") {
    if (!process.env.CLIENT_URL?.trim()) {
      throw new Error("CLIENT_URL is required in production.");
    }

    let clientUrl;

    try {
      clientUrl = new URL(process.env.CLIENT_URL);
    } catch {
      throw new Error("CLIENT_URL must be a valid URL.");
    }

    if (clientUrl.protocol !== "https:") {
      throw new Error("CLIENT_URL must use HTTPS in production.");
    }

    if (clientUrl.origin !== process.env.CLIENT_URL) {
      throw new Error(
        "CLIENT_URL must contain only the origin, without a path or trailing slash.",
      );
    }
  }
};

export default validateEnv;
