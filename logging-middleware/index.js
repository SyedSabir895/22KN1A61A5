import axios from "axios";

const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzYWJpcnN5ZWQyMDA1QGdtYWlsLmNvbSIsImV4cCI6MTc1NDExMTYwNCwiaWF0IjoxNzU0MTEwNzA0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOTU1ZjNhODQtZjY0OS00NjM4LTgzZGQtNTBiN2JiNjdiMzAzIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic3llZCBzYWJpciIsInN1YiI6IjRiZmFiYmE5LTEwZTctNDA0MC1iMmI1LWIyM2FjMmNiYzA5ZiJ9LCJlbWFpbCI6InNhYmlyc3llZDIwMDVAZ21haWwuY29tIiwibmFtZSI6InN5ZWQgc2FiaXIiLCJyb2xsTm8iOiIyMmtuMWE2MWE1IiwiYWNjZXNzQ29kZSI6Inp1UGRrdyIsImNsaWVudElEIjoiNGJmYWJiYTktMTBlNy00MDQwLWIyYjUtYjIzYWMyY2JjMDlmIiwiY2xpZW50U2VjcmV0IjoiREp5cHV3Qk5oQ21oeEpCUiJ9.6vLob6TzLWxAFxLdRd2u38RYMiDefN2FhNAJEUfcg1M';

const ALLOWED_VALUES = {
  stack: ["backend", "frontend"],
  level: ["debug", "info", "warn", "error", "fatal"],
  package: {
    backend: [
      "cache",
      "controller",
      "cron job",
      "db",
      "domain",
      "handler",
      "repository",
      "route",
      "service",
    ],
    frontend: ["api", "component", "hook", "page", "state", "style"],
    both: ["auth", "config", "middleware", "utils"],
  },
};


function validateParams(stack, level, pkg) {
  if (!ALLOWED_VALUES.stack.includes(stack)) {
    console.error(
      `Invalid stack value: ${stack}. Allowed values: ${ALLOWED_VALUES.stack.join(
        ", "
      )}`
    );
    return false;
  }

  if (!ALLOWED_VALUES.level.includes(level)) {
    console.error(
      `Invalid level value: ${level}. Allowed values: ${ALLOWED_VALUES.level.join(
        ", "
      )}`
    );
    return false;
  }

  const validPackages = [
    ...ALLOWED_VALUES.package.both,
    ...(stack === "backend" ? ALLOWED_VALUES.package.backend : []),
    ...(stack === "frontend" ? ALLOWED_VALUES.package.frontend : []),
  ];

  if (!validPackages.includes(pkg)) {
    console.error(
      `Invalid package value: ${pkg} for stack: ${stack}. Allowed values: ${validPackages.join(
        ", "
      )}`
    );
    return false;
  }

  return true;
}


async function Log(stack, level, pkg, message) {
  stack = stack.toLowerCase();
  level = level.toLowerCase();
  pkg = pkg.toLowerCase();

  if (!validateParams(stack, level, pkg)) {
    return null;
  }

  const logData = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (API_KEY) {
      headers["Authorization"] = `Bearer ${API_KEY}`;
    }

    const response = await axios.post(LOG_API_URL, logData, { headers });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.warn(
        "Logging API authentication failed. Please set LOGGING_API_KEY environment variable."
      );
      console.warn("Log data:", JSON.stringify(logData, null, 2));
      return null;
    }

    console.error("Failed to send log:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return null;
  }
}

export { Log };
