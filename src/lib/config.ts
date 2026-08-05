export const config = {
  appwrite: {
    endpoint:
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??
      "https://appwrite.propoj.app/v1",
    projectId:
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "propoj-app",
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "dopamine_arena",
    playersTableId:
      process.env.NEXT_PUBLIC_APPWRITE_PLAYERS_TABLE_ID ?? "players",
    betsTableId: process.env.NEXT_PUBLIC_APPWRITE_BETS_TABLE_ID ?? "bets",
  },
  startingBalance: 1000,
  freeFundsAmount: 1000,
} as const;
