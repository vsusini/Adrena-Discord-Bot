import { BN } from "@coral-xyz/anchor";

export const ROUND_MIN_DURATION_SECONDS = 6 * 60 * 60; // 6 hours in seconds

export function getNextStakingRoundStartTime(timestamp: BN): Date {
  const d = new Date();
  d.setTime((timestamp.toNumber() + ROUND_MIN_DURATION_SECONDS) * 1000);
  return d;
}

export function formatMilliseconds(milliseconds: number): string {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  let formatted = "";

  if (days) {
    formatted = `${days}d`;
  }

  if (hours || formatted.length) {
    const h = `${hours < 0 ? "-" : ""}${
      Math.abs(hours) < 10 ? `0${Math.abs(hours)}` : Math.abs(hours)
    }`;
    formatted = `${formatted}${formatted.length ? " " : ""}${h}h`;
  }

  if (minutes || formatted.length) {
    const m = `${minutes < 0 ? "-" : ""}${
      Math.abs(minutes) < 10 ? `0${Math.abs(minutes)}` : Math.abs(minutes)
    }`;
    formatted = `${formatted}${formatted.length ? " " : ""}${m}m`;
  }

  if (seconds || formatted.length) {
    const s = `${seconds < 0 ? "-" : ""}${
      Math.abs(seconds) < 10 ? `0${Math.abs(seconds)}` : Math.abs(seconds)
    }`;
    formatted = `${formatted}${formatted.length ? " " : ""}${s}s`;
  }

  return formatted;
}
