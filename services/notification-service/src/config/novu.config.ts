import { Novu } from "@novu/node";
import { config } from "dotenv";

config({ path: ".env" });

if (!process.env.NOVU_API_KEY) {
  throw new Error("NOVU_API_KEY is required");
}

export const novuClient = new Novu(process.env.NOVU_API_KEY);