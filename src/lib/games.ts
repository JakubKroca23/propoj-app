export const SLOT_SYMBOLS = ["🍒", "🍋", "🍇", "🔔", "💎"] as const;
export type SlotSymbol = (typeof SLOT_SYMBOLS)[number];

export const SLOT_PAYTABLE: Record<SlotSymbol, number> = {
  "💎": 14,
  "🔔": 10,
  "🍇": 5,
  "🍋": 2,
  "🍒": 1,
};

export const PLINKO_ROWS = 8;
export const PLINKO_MULTIS = [34.5, 4.0, 1.1, 0.4, 0.2, 0.4, 1.1, 4.0, 34.5];

export type GameName =
  | "Space Rush"
  | "Toxic Vault"
  | "Neon Slip"
  | "Neon 81"
  | "Gravity Drop";

export type ViewId = "lobby" | "crash" | "mines" | "dice" | "slot" | "plinko";

export type RoundResult = {
  name: string;
  isMe?: boolean;
  isCasino?: boolean;
  bet: number;
  multi: number | string;
  net: number;
  isWin: boolean;
};

export type FeedItem = {
  id: string;
  name: string;
  game: string;
  bet: number;
  multi: number | string;
  isWin: boolean;
  payout: number;
  at: number;
};

export type Bot = {
  id: number;
  name: string;
  balance: number;
};

export function generateCrashPoint(): number {
  const e = 100;
  const h = Math.random() * e;
  if (h < 1) return 1.0;
  return e / (e - h);
}

export function calculateMinesMulti(mines: number, hits: number): number {
  let n = 25;
  let x = 25 - mines;
  let p = 1.0;
  for (let i = 0; i < hits; i++) {
    p *= (x - i) / (n - i);
  }
  return 0.99 / p;
}

export function getDiceMulti(chance: number): number {
  return 99 / chance;
}

export function rollSlotOutcome(): { winMulti: number; winSym: SlotSymbol | null } {
  const r = Math.random() * 100;
  if (r >= 60 && r < 80) return { winMulti: 1, winSym: "🍒" };
  if (r >= 80 && r < 90) return { winMulti: 2, winSym: "🍋" };
  if (r >= 90 && r < 95) return { winMulti: 5, winSym: "🍇" };
  if (r >= 95 && r < 97) return { winMulti: 10, winSym: "🔔" };
  if (r >= 97) return { winMulti: 14, winSym: "💎" };
  return { winMulti: 0, winSym: null };
}

export function simulateBotRound(
  gameName: GameName,
  bot: Bot,
  extraData?: number,
): { bet: number; multi: number; isWin: boolean; winAmount: number; net: number } {
  if (bot.balance < 10) bot.balance += 500;

  const betPercent = 0.05 + Math.random() * 0.15;
  const bet = Math.floor(bot.balance * betPercent);

  let isWin = false;
  let multi = 0;

  if (gameName === "Space Rush") {
    const target = 1.01 + Math.random() * 5;
    if (extraData !== undefined && target <= extraData) {
      isWin = true;
      multi = target;
    }
  } else if (gameName === "Toxic Vault") {
    isWin = Math.random() > 0.6;
    multi = isWin ? 1.2 + Math.random() * 2 : 0;
  } else if (gameName === "Neon Slip") {
    isWin = Math.random() > 0.52;
    multi = isWin ? 1.98 : 0;
  } else if (gameName === "Neon 81") {
    const r = Math.random() * 100;
    if (r < 60) multi = 0;
    else if (r < 80) multi = 1;
    else if (r < 90) multi = 2;
    else if (r < 95) multi = 5;
    else if (r < 97) multi = 10;
    else multi = 14;
    isWin = multi > 0;
  } else if (gameName === "Gravity Drop") {
    let pos = 0;
    for (let j = 0; j < 8; j++) if (Math.random() > 0.5) pos++;
    multi = PLINKO_MULTIS[pos];
    isWin = multi >= 1;
  }

  const winAmount = isWin ? bet * multi : 0;
  const net = winAmount - bet;
  bot.balance -= bet;
  bot.balance += winAmount;

  return { bet, multi, isWin, winAmount, net };
}
