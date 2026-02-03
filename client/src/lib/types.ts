import React from 'react';

export interface TokenData {
  totalSupply: number; // Changed to number for easier formatting
  marketPrice: number; // Actual market price from API (USD base)
  navPrice: number;    // Calculated "Burn Price" (USD base)
  marketCap: number;   // (USD base)
  symbol: string;
  name: string;
  btcPrice: number;    // BTC Price in USD
}

export interface VaultData {
  wbtcBalance: string;
  wbtcValue: number;   // USD value
  deposits24h: number; // Total volume in last 24h
  recentDeposits: DepositTransaction[];
}

export interface DepositTransaction {
  hash: string;
  amount: number;
  timestamp: number; // Approx timestamp
  timeString: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  tooltip?: string;
}

export interface DashboardData {
  token: TokenData;
  vault: VaultData;
}