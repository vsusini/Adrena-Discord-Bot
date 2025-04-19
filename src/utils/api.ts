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
