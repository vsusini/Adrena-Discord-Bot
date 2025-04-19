# Adrena Discord Bot (TypeScript)

A Discord bot that tracks token prices, staking rewards, and wallet balances for the Adrena ecosystem on Solana.

## Features

- Real-time token price tracking for ADX and ALP tokens
- Staking rewards monitoring and notifications
- Mutagen points and leaderboard rank display
- Automatic status updates showing current token prices
- Discord command integration

## Commands

- `/price` - Get current token price
  - Options: `ALP Token`, `ADX Token`
  - Response: Current price in USD (ephemeral)
- `/mutagen <wallet>` - Get mutagen points and rank
  - Parameters: `wallet` - Solana wallet address
  - Response: Total points and global rank (ephemeral)
- `/rewards` - Check staking rewards
  - Response: Current pending USDC rewards and time remaining in round (ephemeral)

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- A Discord bot token
- Discord channel for rewards notifications

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
  UPDATE_INTERVAL: 60 * 1, // Update interval in seconds
  PRICE_DECIMAL_PLACES: 4, // Decimal places for price display
  DEFAULT_GUILD_ID: "your_guild_id", // Your Discord server ID
  REWARDS_CHECK_INTERVAL: 60 * 1, // Rewards check interval in seconds
  REWARDS_NOTIFICATION_CHANNEL: "your_channel_id", // Channel for rewards notifications
  REWARDS_NOTIFICATION_THRESHOLD: 60 // Notify when less than 60 seconds remaining
} as const;
```

5. Build and start the bot:
```bash
npm run build
npm start
```

For development with hot-reload:
```bash
npm run dev
```

## Required Permissions

The bot needs the following Discord permissions:
- View Channels
- Send Messages
- Change Nickname
- Read Message History
- Use Slash Commands
- Embed Links

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run the bot in development mode with hot-reload
- `npm start` - Run the compiled bot
- `npm test` - Run unit tests

## Project Structure

```
├── src/
│   ├── commands/
│   │   ├── price.ts          # Price command implementation
│   │   ├── mutagen.ts        # Mutagen command implementation
│   │   ├── rewards.ts        # Rewards command implementation
│   │   └── index.ts
│   ├── services/
│   │   ├── statusManager.ts   # Bot status management
│   │   ├── rewardsManager.ts  # Rewards notification service
│   │   └── index.ts
│   ├── utils/
│   │   ├── api.ts            # API utility functions
│   │   ├── timeUtils.ts      # Time formatting utilities
│   │   ├── solanaUtils.ts    # Solana interaction utilities
│   │   └── types.ts          # Type definitions
│   ├── config.ts             # Configuration settings
│   ├── client.ts             # Main bot implementation
│   └── index.ts              # Entry point
├── tests/
│   ├── commands/
│   │   └── price.test.ts      # Unit tests for price command
│   └── utils/
│       └── api.test.ts        # Unit tests for utility functions
├── .env                        # Environment variables
├── .gitignore                  # Git ignore file
├── .eslintrc.json              # ESLint configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Project dependencies
└── README.md                   # Project documentation
```

## Dependencies

### Production
- `discord.js` - Discord API wrapper
- `dotenv` - Environment variable management
- `axios` - HTTP client

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution engine
- `@types/node` - Node.js type definitions
- `nodemon` - Development auto-reload
- `jest` - Testing framework
- `@types/jest` - Jest type definitions
- `eslint` - Code linting
- `prettier` - Code formatting

## Development

1. Make sure you have Node.js and npm installed
2. Install dependencies: `npm install`
3. Create `.env` file with your bot token
4. Start development server: `npm run dev`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request