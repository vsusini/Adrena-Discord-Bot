import { ColorResolvable } from "discord.js";

export const CONSTANTS = {
    COLORS: {
        PRIMARY: '#951A1E' as ColorResolvable,
    },
    URLS: {
        MONITORING: 'https://app.adrena.xyz/monitoring?view=full',
        MUTAGEN_LEADERBOARD: 'https://app.adrena.xyz/mutagen_leaderboard',
    },
    IMAGES: {
        LOGO: 'https://static.coinpaprika.com/coin/adx-adrena/logo.png?rev=11318359'
    },
    ACCOUNTS: {
        STAKING: '5Feq2MKbimA44dqgFHLWr7h77xAqY9cet5zn9eMCj78p'
    }
} as const;