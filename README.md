# Adrena Discord Bot (TypeScript)

A Discord bot that tracks token prices, staking rewards, and wallet balances for the Adrena ecosystem on Solana.

## Features

- Real-time token price tracking for ADX tokens
- Staking rewards monitoring and notifications
- Mutagen points tracking and leaderboard rank display
- Automated round-end notifications for staking rewards
- Embedded message formatting with Discord Markdown

## Commands

- `/price` - Get current token price
  - Options: `ADX Token`
  - Response: Current price in USD with 4 decimal places (ephemeral)
- `/mutagen <wallet>` - Get mutagen points and rank
  - Parameters: `wallet` - Solana wallet address
  - Response: Total points and global rank in formatted embed (ephemeral)
- `/rewards` - Check staking rewards
  - Response: Current pending USDC rewards and time remaining using Discord timestamps (ephemeral)

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
```

4. Configure settings in `src/config.ts`:
```typescript
export const config = {
  PRICE_DECIMAL_PLACES: 4,              // Decimal places for price display
  REWARDS_CHECK_INTERVAL: 60,           // Rewards check interval in seconds
  REWARDS_NOTIFICATION_THRESHOLD: 60,    // Notify when less than 60 seconds remaining
  REWARDS_NOTIFICATION_CHANNEL: "id"     // Discord channel ID for notifications
} as const;
```

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
│   ├── price.ts             # Price checking command handler
│   ├── mutagen.ts           # Mutagen points/rank command handler
│   └── rewards.ts           # Staking rewards command handler
│
├── services/                 # Core background services
│   ├── statusManager.ts     # Handles bot status/price updates
│   └── rewardsManager.ts    # Manages staking rewards notifications
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

### Testing Structure
```
tests/
├── utils/                    # Utility function tests
│   ├── formatters.test.ts   # Tests for value formatting
│   └── timeUtils.test.ts    # Tests for time calculations
│
└── commands/                 # Command handler tests
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

Run tests with coverage:
```bash
npm test -- --coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Open a pull request