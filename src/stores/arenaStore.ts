"use client";

import { create } from "zustand";
import { config } from "@/lib/config";
import {
  type Bot,
  type FeedItem,
  type GameName,
  type RoundResult,
  type ViewId,
  simulateBotRound,
} from "@/lib/games";
import {
  getAccount,
  getTables,
  ID,
  Query,
  type BetRow,
  type PlayerRow,
} from "@/lib/appwrite";

export type NotifyType = "info" | "success" | "error";

export type Notification = {
  id: string;
  message: string;
  type: NotifyType;
};

type ArenaState = {
  ready: boolean;
  view: ViewId;
  balance: number;
  displayName: string;
  userId: string | null;
  platformVolume: number;
  platformProfit: number;
  bots: Bot[];
  feed: FeedItem[];
  notifications: Notification[];
  roundSummary: RoundResult[] | null;
  syncing: boolean;

  init: () => Promise<void>;
  setView: (view: ViewId) => void;
  updateBalance: (delta: number) => void;
  setBalance: (balance: number) => void;
  addFunds: () => void;
  notify: (message: string, type?: NotifyType) => void;
  dismissNotification: (id: string) => void;
  addFeedItem: (item: Omit<FeedItem, "id" | "at">) => void;
  processRound: (
    gameName: GameName,
    userBet: number,
    userWinAmount: number,
    extraData?: number,
  ) => void;
  closeRoundSummary: () => void;
  persistBalance: () => Promise<void>;
  refreshGlobalFeed: () => Promise<void>;
};

const defaultBots = (): Bot[] => [
  { id: 1, name: "CryptoKing", balance: 1000 },
  { id: 2, name: "Degen99", balance: 1000 },
  { id: 3, name: "WhaleAlert", balance: 1000 },
];

async function ensureSession() {
  const account = getAccount();
  try {
    return await account.get();
  } catch {
    await account.createAnonymousSession();
    return account.get();
  }
}

async function loadOrCreatePlayer(
  userId: string,
  name: string,
): Promise<PlayerRow | null> {
  const tables = getTables();
  const { databaseId, playersTableId } = config.appwrite;
  try {
    const existing = await tables.listRows<PlayerRow>({
      databaseId,
      tableId: playersTableId,
      queries: [Query.equal("userId", userId), Query.limit(1)],
    });
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }
    return await tables.createRow<PlayerRow>({
      databaseId,
      tableId: playersTableId,
      rowId: ID.unique(),
      data: {
        userId,
        displayName: name,
        balance: config.startingBalance,
      },
    });
  } catch {
    return null;
  }
}

export const useArenaStore = create<ArenaState>((set, get) => ({
  ready: false,
  view: "lobby",
  balance: config.startingBalance,
  displayName: "Ty",
  userId: null,
  platformVolume: 0,
  platformProfit: 0,
  bots: defaultBots(),
  feed: [],
  notifications: [],
  roundSummary: null,
  syncing: false,

  init: async () => {
    try {
      const user = await ensureSession();
      const name = user.name || `Hráč-${user.$id.slice(0, 5)}`;
      const player = await loadOrCreatePlayer(user.$id, name);

      set({
        userId: user.$id,
        displayName: player?.displayName ?? name,
        balance: player?.balance ?? config.startingBalance,
        ready: true,
      });

      await get().refreshGlobalFeed();
    } catch (err) {
      console.warn("Appwrite init failed, using offline mode", err);
      set({ ready: true, displayName: "Host" });
    }
  },

  setView: (view) => set({ view }),

  updateBalance: (delta) => {
    set((s) => ({ balance: Math.max(0, +(s.balance + delta).toFixed(2)) }));
    void get().persistBalance();
  },

  setBalance: (balance) => set({ balance: +balance.toFixed(2) }),

  addFunds: () => {
    get().updateBalance(config.freeFundsAmount);
    get().notify(`+${config.freeFundsAmount} 🪙 přidáno do peněženky!`, "success");
  },

  notify: (message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    set((s) => ({
      notifications: [...s.notifications, { id, message, type }],
    }));
    setTimeout(() => get().dismissNotification(id), 3000);
  },

  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  addFeedItem: (item) =>
    set((s) => ({
      feed: [
        {
          ...item,
          id: `${Date.now()}-${Math.random()}`,
          at: Date.now(),
        },
        ...s.feed,
      ].slice(0, 40),
    })),

  processRound: (gameName, userBet, userWinAmount, extraData) => {
    const state = get();
    const roundResults: RoundResult[] = [];
    const bots = state.bots.map((b) => ({ ...b }));

    if (userBet > 0) {
      const multi = userWinAmount > 0 ? +(userWinAmount / userBet).toFixed(2) : 0;
      const net = userWinAmount - userBet;
      get().addFeedItem({
        name: state.displayName,
        game: gameName,
        bet: userBet,
        multi,
        isWin: userWinAmount > 0,
        payout: userWinAmount,
      });
      roundResults.push({
        name: state.displayName,
        isMe: true,
        bet: userBet,
        multi,
        net,
        isWin: userWinAmount > 0,
      });

      if (state.userId) {
        void (async () => {
          try {
            await getTables().createRow({
              databaseId: config.appwrite.databaseId,
              tableId: config.appwrite.betsTableId,
              rowId: ID.unique(),
              data: {
                userId: state.userId,
                displayName: state.displayName,
                game: gameName,
                bet: userBet,
                multi,
                payout: userWinAmount,
                isWin: userWinAmount > 0,
              },
            });
          } catch {
            /* optional */
          }
        })();
      }
    }

    let roundBotVolume = 0;
    let roundBotPayouts = 0;

    bots.forEach((bot, i) => {
      const result = simulateBotRound(gameName, bot, extraData);
      roundBotVolume += result.bet;
      roundBotPayouts += result.winAmount;

      roundResults.push({
        name: bot.name,
        bet: result.bet,
        multi: result.isWin ? +result.multi.toFixed(2) : 0,
        net: result.net,
        isWin: result.isWin,
      });

      setTimeout(() => {
        get().addFeedItem({
          name: bot.name,
          game: gameName,
          bet: +result.bet.toFixed(2),
          multi: result.isWin ? +result.multi.toFixed(2) : 0,
          isWin: result.isWin,
          payout: result.winAmount,
        });
        set({ bots: [...bots] });
      }, (i + 1) * 250);
    });

    const totalRoundBet = (userBet > 0 ? userBet : 0) + roundBotVolume;
    const totalRoundPayout =
      (userWinAmount > 0 ? userWinAmount : 0) + roundBotPayouts;
    const casinoNet = totalRoundBet - totalRoundPayout;

    roundResults.push({
      name: "Kasino (House)",
      isCasino: true,
      bet: totalRoundBet,
      multi: "-",
      net: casinoNet,
      isWin: casinoNet >= 0,
    });

    set((s) => ({
      bots,
      platformVolume: +(s.platformVolume + userBet + roundBotVolume).toFixed(2),
      platformProfit: +(
        s.platformProfit +
        (userBet - userWinAmount) +
        (roundBotVolume - roundBotPayouts)
      ).toFixed(2),
    }));

    setTimeout(
      () => set({ roundSummary: roundResults }),
      bots.length * 250 + 600,
    );
  },

  closeRoundSummary: () => set({ roundSummary: null }),

  persistBalance: async () => {
    const { userId, balance, displayName } = get();
    if (!userId) return;
    set({ syncing: true });
    try {
      const tables = getTables();
      const { databaseId, playersTableId } = config.appwrite;
      const existing = await tables.listRows<PlayerRow>({
        databaseId,
        tableId: playersTableId,
        queries: [Query.equal("userId", userId), Query.limit(1)],
      });
      if (existing.rows[0]) {
        await tables.updateRow({
          databaseId,
          tableId: playersTableId,
          rowId: existing.rows[0].$id,
          data: { balance, displayName },
        });
      }
    } catch {
      /* offline / missing table */
    } finally {
      set({ syncing: false });
    }
  },

  refreshGlobalFeed: async () => {
    try {
      const docs = await getTables().listRows<BetRow>({
        databaseId: config.appwrite.databaseId,
        tableId: config.appwrite.betsTableId,
        queries: [Query.orderDesc("$createdAt"), Query.limit(25)],
      });
      const remote: FeedItem[] = docs.rows.map((doc) => ({
        id: doc.$id,
        name: doc.displayName,
        game: doc.game,
        bet: doc.bet,
        multi: doc.multi,
        isWin: doc.isWin,
        payout: doc.payout,
        at: new Date(doc.$createdAt).getTime(),
      }));
      if (remote.length) {
        set((s) => {
          const localOnly = s.feed.filter(
            (f) => !remote.some((r) => r.id === f.id),
          );
          return {
            feed: [...localOnly, ...remote]
              .sort((a, b) => b.at - a.at)
              .slice(0, 40),
          };
        });
      }
    } catch {
      /* optional */
    }
  },
}));
