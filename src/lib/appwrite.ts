"use client";

import { Account, Client, TablesDB, ID, Query, type Models } from "appwrite";
import { config } from "./config";

let client: Client | null = null;

export function getClient() {
  if (typeof window === "undefined") {
    throw new Error("Appwrite client is browser-only");
  }
  if (!client) {
    client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId);
  }
  return client;
}

export function getAccount() {
  return new Account(getClient());
}

export function getTables() {
  return new TablesDB(getClient());
}

export { ID, Query };

export type PlayerRow = Models.DefaultRow & {
  userId: string;
  displayName: string;
  balance: number;
};

export type BetRow = Models.DefaultRow & {
  userId: string;
  displayName: string;
  game: string;
  bet: number;
  multi: number;
  payout: number;
  isWin: boolean;
};
