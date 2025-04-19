export const config = {
  UPDATE_INTERVAL: 60 * 1, // 1 minute in seconds
  PRICE_DECIMAL_PLACES: 4,
  DEFAULT_GUILD_ID: "952044361334550548",
  REWARDS_CHECK_INTERVAL: 60 * 1, // 1 minute in seconds
  REWARDS_NOTIFICATION_CHANNEL: "1087064876930838590",
  REWARDS_NOTIFICATION_THRESHOLD: 60, // Notify when less than 60 seconds remaining
} as const;
