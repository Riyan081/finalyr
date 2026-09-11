import { Polar } from "@polar-sh/sdk";

/**
 * Polar client — international payments.
 * Set POLAR_ACCESS_TOKEN in apps/https/.env to activate.
 */
export const polar = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN })
  : null;

export const POLAR_ORGANIZATION_ID = process.env.POLAR_ORGANIZATION_ID ?? "";
export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET ?? "";
