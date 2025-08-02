// https://github.com/AlexRubik/rude-frontend/blob/main/src/server-utils.ts
// Modified code to make it work with current codebase

import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { IDL as ADRENA_IDL } from "./adrena";
import BigNumber from "bignumber.js";

// Define interfaces for the return data structure
export interface StakingRound {
  startTime: string;
  endTime: string;
  rate: string;
  totalStake: string;
  totalClaim: string;
  lmRate: string;
  lmTotalStake: string;
  lmTotalClaim: string;
}

export interface StakingAccountSummary {
  stakingType: string;
  lockedTokens: string;
  liquidTokens: string;
  totalStaked: string;
  stakedTokenMint: string;
  resolvedRewardTokenAmount: string;
  resolvedStakedTokenAmount: string;
  resolvedLmRewardTokenAmount: string;
  resolvedLmStakedTokenAmount: string;
  currentStakingRound: {
    startTime: string;
    endTime: string;
    rate: string;
    totalStake: string;
    totalClaim: string;
    lmRate: string;
    lmTotalStake: string;
    lmTotalClaim: string;
  };
  usdcRewardVaultBalance: string;
  pendingUsdcRewards: string;
  totalSupply: string;
  percentageStaked: string;
  tokenPrice: string;
  priceTimestamp: string;
  lockedTokensUsd: string;
  liquidTokensUsd: string;
  totalStakedUsd: string;
  totalSupplyUsd: string;
  fullData: Record<string, any>;
}

export interface AccountBasicInfo {
  address: string;
  owner: string;
  lamports: number;
  solBalance: number;
}

export interface AdrenaAccountData {
  basicInfo: AccountBasicInfo;
  accountType: string;
  availableAccountTypes: string[];
  processedAccount: Record<string, any>;
  summary: StakingAccountSummary | null;
}

// Helper function to get token account balance
async function getTokenAccountBalance(
  connection: Connection,
  tokenAccountAddress: string
): Promise<string> {
  try {
    const publicKey = new PublicKey(tokenAccountAddress);
    const tokenAccountInfo = await connection.getTokenAccountBalance(publicKey);

    if (tokenAccountInfo && tokenAccountInfo.value) {
      const amount = tokenAccountInfo.value.amount;
      const decimals = tokenAccountInfo.value.decimals;
      const formattedAmount = new BigNumber(amount)
        .shiftedBy(-decimals)
        .toFormat();
      return formattedAmount;
    }

    return "0";
  } catch (error) {
    console.error(
      `Error fetching token balance for ${tokenAccountAddress}:`,
      error
    );
    return "Error fetching balance";
  }
}

// Helper function to get token supply
async function getTokenSupply(
  connection: Connection,
  mintAddress: string
): Promise<string> {
  try {
    const publicKey = new PublicKey(mintAddress);
    const supply = await connection.getTokenSupply(publicKey);

    if (supply && supply.value) {
      const amount = supply.value.amount;
      const decimals = supply.value.decimals;
      const formattedAmount = new BigNumber(amount)
        .shiftedBy(-decimals)
        .toFormat();
      return formattedAmount;
    }

    return "0";
  } catch (error) {
    console.error(`Error fetching token supply for ${mintAddress}:`, error);
    return "Error fetching supply";
  }
}

export async function readAdrenaAccount(
  accountAddress: string
): Promise<AdrenaAccountData> {
  const primaryRpcUrl = "https://api.mainnet-beta.solana.com";
  const fallbackRpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ||
    "https://solana-mainnet.g.alchemy.com/v2/demo";

  async function attemptConnection(rpcUrl: string): Promise<Connection> {
    return new Connection(rpcUrl, "confirmed");
  }

  try {
    let connection: Connection;
    try {
      connection = await attemptConnection(primaryRpcUrl);
      await connection.getLatestBlockhash();
    } catch (error) {
      console.warn("Error connecting to primary RPC:", error);
      console.log("Falling back to alternative RPC URL...");
      connection = await attemptConnection(fallbackRpcUrl);
      await connection.getLatestBlockhash();
    }

    const dummyWallet = new NodeWallet(Keypair.generate());
    const provider = new AnchorProvider(connection, dummyWallet, {
      commitment: "confirmed",
    });

    const pubkey = new PublicKey(accountAddress);
    const accountInfo = await connection.getAccountInfo(pubkey);

    if (!accountInfo) {
      throw new Error("Account not found");
    }

    const programId = new PublicKey(
      "13gDzEXCdocbj8iAiqrScGo47NiSuYENGsRqi3SEAwet"
    );
    const program = new Program(ADRENA_IDL, programId, provider);
    const accountTypes = ADRENA_IDL.accounts.map((acc) => acc.name);

    let decodedAccount = null;
    let accountType = "";

    for (const type of accountTypes) {
      try {
        decodedAccount = program.coder.accounts.decode(type, accountInfo.data);
        accountType = type;
        break;
      } catch (e) {}
    }

    if (!decodedAccount) {
      throw new Error("Could not decode account data");
    }

    const processValue = (value: any, key: string): any => {
      if (
        value instanceof BN ||
        (typeof value === "string" && /^[0-9a-f]+$/i.test(value))
      ) {
        const bnValue = value instanceof BN ? value : new BN(value, 16);
        if (
          key.toLowerCase().includes("time") &&
          bnValue.toNumber() > 1600000000 &&
          bnValue.toNumber() < 2000000000
        ) {
          return new Date(bnValue.toNumber() * 1000).toISOString();
        }
        if (
          key.toLowerCase().includes("amount") ||
          key.toLowerCase().includes("tokens") ||
          key.toLowerCase().includes("stake") ||
          key.toLowerCase().includes("claim")
        ) {
          const decimals = 6;
          return `${bnValue.toString(10)} (${new BigNumber(bnValue.toString())
            .shiftedBy(-decimals)
            .toFormat()} tokens)`;
        }
        return bnValue.toString(10);
      }

      if (Array.isArray(value)) {
        return value.map((v) => processValue(v, key));
      }

      if (typeof value === "object" && value !== null) {
        const processed: Record<string, any> = {};
        Object.entries(value).forEach(([k, v]) => {
          processed[k] = processValue(v, k);
        });
        return processed;
      }

      return value;
    };

    const processedAccount: Record<string, any> = {};
    Object.entries(decodedAccount).forEach(([key, value]) => {
      processedAccount[key] = processValue(value, key);
    });

    let summary: StakingAccountSummary | null = null;

    if (accountType === "staking") {
      const stakingType = decodedAccount.stakingType === 1 ? "ADX" : "ALP";
      const stakedTokenDecimals = decodedAccount.stakedTokenDecimals;
      const nbLockedTokens = new BigNumber(
        decodedAccount.nbLockedTokens.toString()
      ).shiftedBy(-stakedTokenDecimals);
      const nbLiquidTokens = new BigNumber(
        decodedAccount.nbLiquidTokens.toString()
      ).shiftedBy(-stakedTokenDecimals);
      const totalStaked = nbLockedTokens.plus(nbLiquidTokens);

      const usdcRewardVaultAddress =
        "A3UJxhPtieUr1mjgJhJaTPqDReDaB2H9q7hzs2icrUeS";
      const usdcRewardVaultBalance = await getTokenAccountBalance(
        connection,
        usdcRewardVaultAddress
      );

      let pendingUsdcRewards = "0";
      try {
        const resolvedRewardMatch =
          processedAccount.resolvedRewardTokenAmount.match(/\(([\d,\.]+)/);
        const resolvedRewardAmount = resolvedRewardMatch
          ? resolvedRewardMatch[1].replace(/,/g, "")
          : "0";

        const vaultBalance = new BigNumber(
          usdcRewardVaultBalance.replace(/,/g, "")
        );
        const resolvedReward = new BigNumber(resolvedRewardAmount);

        if (vaultBalance.isGreaterThan(resolvedReward)) {
          pendingUsdcRewards = vaultBalance.minus(resolvedReward).toFormat();
        }
      } catch (error) {
        console.error("Error calculating pending USDC rewards:", error);
        pendingUsdcRewards = "Error calculating";
      }

      const totalSupply = await getTokenSupply(
        connection,
        new PublicKey(decodedAccount.stakedTokenMint).toString()
      );

      // Calculate percentage staked
      const adxTreasuryBalanceStr = await getTokenAccountBalance(
        connection,
        "7KR5Km1NkUJsL1CLnXPmMxoE3Fq2kZyoWYSwrv5YkJ9T" // Treasury token account
      );
      const adxTreasuryBalance = new BigNumber(
        adxTreasuryBalanceStr.replace(/,/g, "")
      );
      const totalSupplyBN = new BigNumber(totalSupply.replace(/,/g, ""));
      // Remove treasury balance from supply.
      const circulating = totalSupplyBN.minus(adxTreasuryBalance);

      const percentageStaked =
        totalSupply !== "0" && !totalSupply.includes("Error")
          ? totalStaked.dividedBy(circulating).multipliedBy(100).toFixed(2)
          : "0";

      summary = {
        stakingType,
        lockedTokens: nbLockedTokens.toFormat(),
        liquidTokens: nbLiquidTokens.toFormat(),
        totalStaked: totalStaked.toFormat(),
        stakedTokenMint: new PublicKey(
          decodedAccount.stakedTokenMint
        ).toString(),
        resolvedRewardTokenAmount: processedAccount.resolvedRewardTokenAmount,
        resolvedStakedTokenAmount: processedAccount.resolvedStakedTokenAmount,
        resolvedLmRewardTokenAmount:
          processedAccount.resolvedLmRewardTokenAmount,
        resolvedLmStakedTokenAmount:
          processedAccount.resolvedLmStakedTokenAmount,
        currentStakingRound: {
          startTime: processedAccount.currentStakingRound.startTime,
          endTime: processedAccount.currentStakingRound.endTime,
          rate: processedAccount.currentStakingRound.rate,
          totalStake: processedAccount.currentStakingRound.totalStake,
          totalClaim: processedAccount.currentStakingRound.totalClaim,
          lmRate: processedAccount.currentStakingRound.lmRate,
          lmTotalStake: processedAccount.currentStakingRound.lmTotalStake,
          lmTotalClaim: processedAccount.currentStakingRound.lmTotalClaim,
        },
        usdcRewardVaultBalance: usdcRewardVaultBalance,
        pendingUsdcRewards,
        totalSupply,
        percentageStaked: `${percentageStaked}%`,
        tokenPrice: "0", // Placeholder for token price
        priceTimestamp: "", // Placeholder for price timestamp
        lockedTokensUsd: "0", // Placeholder for USD value
        liquidTokensUsd: "0", // Placeholder for USD value
        totalStakedUsd: "0", // Placeholder for USD value
        totalSupplyUsd: "0", // Placeholder for USD value
        fullData: processedAccount,
      };
    }

    return {
      basicInfo: {
        address: accountAddress,
        owner: accountInfo.owner.toString(),
        lamports: accountInfo.lamports,
        solBalance: accountInfo.lamports / LAMPORTS_PER_SOL,
      },
      accountType,
      availableAccountTypes: accountTypes,
      processedAccount,
      summary,
    };
  } catch (error) {
    console.error("Error reading account:", error);
    throw error;
  }
}

function isConnectionError(error: any): boolean {
  if (!error) return false;

  const errorString = error.toString().toLowerCase();
  const message = error.message ? error.message.toLowerCase() : "";

  return (
    errorString.includes("network") ||
    errorString.includes("connection") ||
    errorString.includes("timeout") ||
    errorString.includes("econnrefused") ||
    errorString.includes("econnreset") ||
    errorString.includes("socket") ||
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("timeout")
  );
}
