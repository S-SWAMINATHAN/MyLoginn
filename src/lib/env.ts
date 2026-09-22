import "server-only";

/**
 * Returns a server-only configuration value or fails safely when deployment
 * configuration is incomplete. Do not use this helper from client components.
 */
export function getRequiredServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}
