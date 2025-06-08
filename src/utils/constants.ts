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
        LOGO: 'https://static.coinpaprika.com/coin/adx-adrena/logo.png?rev=11318359',
        ALP_LOGO: 'https://punoijxqkoh5mtdlpd23glshgbf4cnksb7imbx5coxl4rj63jfxa.arweave.net/fRrkJvBTj9ZMa3j1sy5HMEvBNVIP0MDfonXXyKfbSW4'
,    },
    ACCOUNTS: {
        STAKING: '5Feq2MKbimA44dqgFHLWr7h77xAqY9cet5zn9eMCj78p'
    }
} as const;