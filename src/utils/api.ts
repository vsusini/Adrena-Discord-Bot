import axios from 'axios';
import { PositionResponse, Position, DetailedPosition } from './types';

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

export async function fetchTokenPrices(): Promise<{ adx: number | null; alp: number | null }> {
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
      { headers: { accept: 'application/json' } }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
};

export const fetchPosition = async (positionId: number, wallet: string): Promise<DetailedPosition | null> => {
  try {
    const response = await axios.get<PositionResponse>(
      `https://datapi.adrena.xyz/position?position_id=${positionId}&user_wallet=${wallet}&limit=1`,
      { headers: { accept: 'application/json' } }
    );
    return response.data.data[0] || null;
  } catch (error) {
    console.error('Error fetching position:', error);
    return null;
  }
};
