import { config } from "../config";

export const formatters = {
  usdValue: (value: string | number): string => {
    // Remove any existing commas
    const cleanValue = typeof value === "string" ? value.replace(/,/g, "") : value.toString();
    // Parse to float and fix decimal places
    const numberValue = parseFloat(cleanValue);
    // Format with locale string to handle grouping correctly
    return numberValue.toLocaleString("en-US", {
      minimumFractionDigits: config.PRICE_DECIMAL_PLACES,
      maximumFractionDigits: config.PRICE_DECIMAL_PLACES,
    });
  },

  walletAddress: (address: string): string => {
    if (!address) return '';
    if (address.length <= 8) return address;
    
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  },

  codeBlock: (value: string | number): string => {
    return `\`${value}\``;
  },

  rewardsSummary: (rewards: string, roundEndTimestamp: number): string => {
    return `USDC Rewards: \`$${formatters.usdValue(rewards)}\`\nRound completion <t:${Math.floor(roundEndTimestamp)}:R>`;
  },
};
