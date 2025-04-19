import { Idl, IdlAccounts } from "@coral-xyz/anchor";
import { Adrena } from "./adrena";
import { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";

export type TokenType = "ADX" | "ALP";

export interface CommandOption {
  name: string;
  type: number;
  value: string;
}

export interface AdrenaIdl extends Idl {
  version: "1.2.1";
  name: "adrena";
  instructions: Idl["instructions"];
  accounts: Array<{
    name: string;
    discriminator: number[];
    type: {
      kind: "struct";
      fields: Array<{
        name: string;
        type: IdlType;
      }>;
    };
  }>;
  types: Array<{
    name: string;
    type: {
      kind: "struct";
      fields: Array<{
        name: string;
        type: IdlType;
      }>;
    };
  }>;
  errors: Adrena["errors"];
  metadata: Idl["metadata"];
  address: string;
}

export interface TokenPriceResponse {
  success: boolean;
  data: {
    [key in TokenType]: {
      price: number;
    };
  };
}

export interface MutagenDataResponse {
  success: boolean;
  data: {
    totalPoints: number;
    rank: number;
  };
}

export interface StakingAccountSummary {
  stakingType: string;
  totalStaked: string;
  totalStakedUsd: string;
  pendingUsdcRewards: string;
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
  lockedTokens?: string;
  liquidTokens?: string;
  percentageStaked?: string;
  tokenPrice?: string;
}

export interface AdrenaAccountData {
  accountType: string;
  basicInfo: {
    owner: string;
    solBalance: string;
  };
  summary?: StakingAccountSummary;
}

type Accounts = IdlAccounts<AdrenaIdl>;
export type UserStaking = Accounts["userStaking"];
