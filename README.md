# Adrena Discord Bot (TypeScript)

A Discord bot that tracks token prices, staking rewards, and trading positions for the Adrena ecosystem on Solana.

# Adrena Links:

- Website: https://www.adrena.trade/
- X: https://x.com/AdrenaProtocol
- Discord: https://discord.gg/Z3UZAVA2ch
- Docs: https://docs.adrena.trade/

## Features

- Real-time token price tracking for ADX tokens
- Staking rewards monitoring and notifications
- Mutagen points tracking and leaderboard rank display
- Automated round-end notifications for staking rewards
- Position tracking with status updates
- Multi-user position tracking support
- Persistent storage using SQLite database
- Embedded message formatting with Discord Markdown

## Commands
- `/tutorial` - Guide on how to set up position tracking
  - Response: Step-by-step tutorial with images to help configure position tracking
- `/help` – Display all available bot commands and usage
  - Response: Embedded list of all bot commands pulled from the README (ephemeral)
- `/price` - Get Adrena token prices and liquidity
  - Response: Get the current prices and liquidity for ADX, ALP, SOL, WBTC, and BONK (ephemeral)
- `/adx` - Get ADX token price and staking APR information
  - Response: Current price and detailed staking APR breakdown for different lock periods (ephemeral)
- `/alp` - Get ALP token price, APR information, 24h mint/redeem fees and TVL. 
  - Response: Current price, 7-day APR, 24h mint/redeem fees, and TVL statistics (ephemeral)
- `/liquidity` - View the latest locked and available liquidity by token
  - Response: Embedded snapshot showing remaining liquidity (in USD) and locked % for BTC, BONK, SOL, and USDC, based on the latest custody data
- `/mutagen <wallet>` - Get mutagen points and rank
  - Parameters: `wallet` - Solana wallet address
  - Response: Total points and global rank in formatted embed (ephemeral)
- `/tip` - Support the bot by sending a tip
  - Response: Display the ADX tip address with embed formatting (ephemeral)
- `/rewards` - Check staking rewards
  - Response: Current pending USDC rewards and time remaining (ephemeral)
- `/position-track <wallet>` - Track a trader's positions
  - Parameters: `wallet` - Solana wallet address
  - Response: Interactive menu to select positions to track (ephemeral)
- `/position-status` - Check your tracked positions
  - Response: List of all positions you're tracking with details (ephemeral)
- `/position-untrack` - Stop tracking a position
  - Response: Interactive menu to select position to untrack (ephemeral)

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Discord bot token
- Discord channel for rewards notifications
- Solana wallet for staking account monitoring

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ts-discord-bot.git
cd ts-discord-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Discord bot token:
```env
DISCORD_TOKEN=your_token_here
BIRDEYE_TOKEN=your_token_here
```

4. Configure settings in `src/config.ts`:
```typescript
export const config = {
  // Price Display Settings
  PRICE_DECIMAL_PLACES: 2,        // Number of decimal places for price display
  
  // Status Update Settings
  UPDATE_INTERVAL: 60,            // Bot status update interval (seconds)
  
  // Discord Settings
  DEFAULT_GUILD_ID: "guild_id",   // Your Discord server ID

  // Rewards Notification Settings
  REWARDS_CHECK_INTERVAL: 60,     // How often to check rewards (seconds)
  REWARDS_NOTIFICATION_THRESHOLD: 21600, // When to notify before round end (6 hours in seconds)
  REWARDS_NOTIFICATION_CHANNEL: "channel_id", // Channel ID for notifications

  // Position Tracking Settings
  POSITION_CHECK_INTERVAL: 60,    // How often to check positions (seconds)
  POSITION_NOTIFICATION_CHANNEL: "channel_id" // Channel ID for position updates
} as const;
```

The config file controls various aspects of the bot's behavior:
- Price updates and formatting
- Status refresh intervals
- Discord server settings
- Staking rewards notifications
- Position tracking notifications

Make sure to replace `guild_id` and `channel_id` with your actual Discord server and channel IDs.

## Development

1. Start in development mode with hot-reload:
```bash
npm run dev
```

2. Run tests:
```bash
npm test
# or in watch mode
npm run test:watch
```

3. Build for production:
```bash
npm run build
npm start
```

## Project Structure

### Source Code
```
src/
├── commands/                  # Discord command implementations
│   ├── index.ts             # Command registration and routing
│   ├── price.ts             # Price checking command
│   ├── mutagen.ts           # Mutagen points/rank command
│   ├── rewards.ts           # Staking rewards command
│   ├── track.ts            # Position tracking command
│   ├── status.ts           # Position status command
│   └── untrack.ts          # Position untracking command
│
├── services/                 # Core background services
│   ├── statusManager.ts     # Handles bot status/price updates
│   ├── rewardsManager.ts    # Manages staking rewards notifications
│   ├── positionTracker.ts   # Tracks trading positions
│   └── database.ts         # SQLite database service
│
├── utils/                    # Shared utility functions
│   ├── api.ts              # External API interaction functions
│   ├── formatters.ts       # Value formatting (USD, addresses, etc)
│   ├── timeUtils.ts        # Time calculations and formatting
│   ├── constants.ts        # Shared configuration constants
│   ├── solanaUtils.ts      # Solana blockchain interactions
│   ├── types.ts            # TypeScript type definitions
│   └── adrena.ts           # Adrena-specific blockchain utils
│
├── client.ts                 # Discord bot client setup
├── config.ts                # Environment & bot configuration
└── index.ts                 # Application entry point
```

## Testing

The project uses Jest for testing. Test files are located in the `tests` directory:

```
tests/
├── utils/
│   ├── formatters.test.ts    # Tests for number/text formatting
│   └── timeUtils.test.ts     # Tests for time calculations
└── commands/
    └── price.test.ts         # Tests for price command
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add new features
4. Ensure all tests pass
5. Open a pull request
