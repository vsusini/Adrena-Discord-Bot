import axios from "axios";
import { PositionResponse, Position, DetailedPosition } from "./types";

interface MutagenEntry {
  user_wallet: string;
  rank: number;
  total_points: number;
}

export async function fetchTokenPrice(token: string): Promise<number | null> {
  const response = await fetch(
    `https://datapi.adrena.xyz/last-price?token=${token}`
  );
  if (!response.ok) {
    console.error("Failed to fetch token price:", response.statusText);
    return null;
  }
  const data = await response.json();
  return data.success ? data.data[token.toLowerCase()].price : null;
}

export async function fetchTokenPrices(): Promise<{
  adx: number | null;
  alp: number | null;
}> {
  const response = await fetch(`https://datapi.adrena.xyz/last-price`);

  if (!response.ok) {
    console.error("Failed to fetch token prices:", response.statusText);
    return { adx: null, alp: null };
  }

  const data = await response.json();

  return data.success
    ? {
        adx: data.data["adx"]?.price ?? null,
        alp: data.data["alp"]?.price ?? null,
      }
    : { adx: null, alp: null };
}

export async function fetchMutagenData(
  walletAddress: string
): Promise<{ points: number | null; rank: number | null }> {
  const pointsResponse = await fetch(
    `https://datapi.adrena.xyz/mutagen?user_wallet=${walletAddress}`
  );
  const rankResponse = await fetch(
    `https://datapi.adrena.xyz/mutagen-leaderboard`
  );

  if (!pointsResponse.ok || !rankResponse.ok) {
    console.error(
      "Failed to fetch mutagen data:",
      pointsResponse.statusText,
      rankResponse.statusText
    );
    return { points: null, rank: null };
  }

  const pointsData = await pointsResponse.json();
  const rankData = await rankResponse.json();

  const points = pointsData.success ? pointsData.data.total_total_points : null;
  const rank = rankData.success
    ? rankData.data.find(
        (entry: MutagenEntry) =>
          entry.user_wallet.toLowerCase() === walletAddress.toLowerCase()
      )?.rank
    : null;

  return { points, rank };
}

export const fetchPositions = async (wallet: string): Promise<Position[]> => {
  try {
    const response = await axios.get<PositionResponse>(
      `https://datapi.adrena.xyz/position?user_wallet=${wallet}&status=open&limit=10`,
      { headers: { accept: "application/json" } }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching positions:", error);
    return [];
  }
};

export const fetchPosition = async (
  positionId: number,
  wallet: string
): Promise<DetailedPosition | null> => {
  try {
    const response = await axios.get<PositionResponse>(
      `https://datapi.adrena.xyz/position?position_id=${positionId}&user_wallet=${wallet}&limit=1`,
      { headers: { accept: "application/json" } }
    );
    return response.data.data[0] || null;
  } catch (error) {
    console.error("Error fetching position:", error);
    return null;
  }
};

/**
 * Fetches daily trading volume (USD) for a given date range.
 * @param startDate ISO string (e.g. "2025-08-14T00:00:00.000Z")
 * @param endDate ISO string (e.g. "2025-08-14T00:00:00.000Z")
 */
export async function fetchDailyTradingVolumeUSD(
  startDate: string,
  endDate: string
): Promise<number | null> {
  try {
    const url = `https://datapi.adrena.xyz/poolinfodaily?cumulative_trading_volume_usd=true&start_date=${encodeURIComponent(
      startDate
    )}&end_date=${encodeURIComponent(endDate)}`;
    console.log("Trading Volume URL:", url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch trading volume:", response.statusText);
      return null;
    }
    const data = await response.json();
    if (
      data.success &&
      data.data.cumulative_trading_volume_usd &&
      data.data.cumulative_trading_volume_usd.length >= 2
    ) {
      const arr = data.data.cumulative_trading_volume_usd;
      const dailyVolume = arr[arr.length - 1] - arr[arr.length - 2];
      return dailyVolume;
    }
    return null;
  } catch (error) {
    console.error("Error fetching trading volume:", error);
    return null;
  }
}

/**
 * Fetches total open interest (long + short) in USD for the latest day.
 * @param startDate ISO string (yesterday)
 * @param endDate ISO string (today)
 * @returns { totalLong: number, totalShort: number, totalOI: number }
 */
export async function fetchCurrentOpenInterestUSD(): Promise<{
  totalLong: number;
  totalShort: number;
  totalOI: number;
} | null> {
  try {
    const query = `https://datapi.adrena.xyz/custodyinfo?open_interest_long_usd=true&open_interest_short_usd=true&limit=1&sort=DESC`;
    const response = await fetch(query);
    const data = await response.json();

    if (!data.success || !data.data) return null;

    // Get the last values for each key (should be only one if limit=1)
    let totalLong = 0;
    let totalShort = 0;

    const longs = data.data.open_interest_long_usd;
    const shorts = data.data.open_interest_short_usd;

    // Sum the last value of each account (should be only one value per array)
    for (const arr of Object.values(longs)) {
      if (Array.isArray(arr) && arr.length > 0) {
        totalLong += Number(arr[arr.length - 1]);
      }
    }
    for (const arr of Object.values(shorts)) {
      if (Array.isArray(arr) && arr.length > 0) {
        totalShort += Number(arr[arr.length - 1]);
      }
    }

    return {
      totalLong,
      totalShort,
      totalOI: totalLong + totalShort,
    };
  } catch (error) {
    console.error("Error fetching open interest:", error);
    return null;
  }
}
