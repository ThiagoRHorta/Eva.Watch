import { ethers } from 'ethers';
import { DashboardData, DepositTransaction } from './types';

// Constants
const ARB_RPC = 'https://arb1.arbitrum.io/rpc';
const TOKEN_ADDRESS = '0x45D9831d8751B2325f3DBf48db748723726e1C8c'; // "EVA"
const VAULT_ADDRESS = '0xA89d65deF0A001947d8D5fDda93F9C4f8453902e'; // The Vault
const WBTC_ADDRESS = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'; // WBTC
const CHAINLINK_BTC_USD = '0x6ce185860a4963106506C203335A2910413708e9'; // Chainlink BTC/USD Feed

const CACHE_DURATION_MS = 60000; // 1 minute cache for prices

let priceCache = {
    btcPriceUsd: 0,
    evaMarketPrice: 0,
    lastUpdated: 0
};

// ABIs
const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const CHAINLINK_ABI = [
    "function latestAnswer() view returns (int256)",
    "function decimals() view returns (uint8)"
];

const provider = new ethers.JsonRpcProvider(ARB_RPC);

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
  const wbtcContract = new ethers.Contract(WBTC_ADDRESS, ERC20_ABI, provider);
  const chainlinkContract = new ethers.Contract(CHAINLINK_BTC_USD, CHAINLINK_ABI, provider);

  // 1. Fetch On-Chain Contract Data (Always Live & Cheap)
  const [
    tokenSupply,
    tokenDecimals,
    tokenSymbol,
    tokenName,
    vaultWbtcBalance,
    wbtcDecimals
  ] = await Promise.all([
    tokenContract.totalSupply(),
    tokenContract.decimals(),
    tokenContract.symbol(),
    tokenContract.name(),
    wbtcContract.balanceOf(VAULT_ADDRESS),
    wbtcContract.decimals()
  ]);

  // 2. Fetch Prices (Cached)
  const nowTime = Date.now();
  if ((nowTime - priceCache.lastUpdated) > CACHE_DURATION_MS) {
    try {
        const [btcRes, tokenRes] = await Promise.allSettled([
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'),
            fetch(`https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${TOKEN_ADDRESS}&vs_currencies=usd`)
        ]);

        let newBtc = priceCache.btcPriceUsd;
        let newEva = priceCache.evaMarketPrice;

        if (btcRes.status === 'fulfilled' && btcRes.value.ok) {
            const d = await btcRes.value.json();
            if (d.bitcoin?.usd) newBtc = d.bitcoin.usd;
        }
        if (tokenRes.status === 'fulfilled' && tokenRes.value.ok) {
            const d = await tokenRes.value.json();
            const lower = TOKEN_ADDRESS.toLowerCase();
            if (d[lower]?.usd) newEva = d[lower].usd;
        }
        priceCache = { btcPriceUsd: newBtc, evaMarketPrice: newEva, lastUpdated: nowTime };
    } catch (e) { console.warn("Price API Error", e); }
  }

  // Fallback BTC Price from Chainlink if API fails
  let btcPriceUsd = priceCache.btcPriceUsd;
  if (btcPriceUsd === 0) {
      try {
          const [price, decimals] = await Promise.all([
              chainlinkContract.latestAnswer(),
              chainlinkContract.decimals()
          ]);
          btcPriceUsd = parseFloat(ethers.formatUnits(price, decimals));
      } catch (e) { btcPriceUsd = 65000; }
  }

  const supplyFormatted = parseFloat(ethers.formatUnits(tokenSupply, tokenDecimals));
  const wbtcBalanceFormatted = parseFloat(ethers.formatUnits(vaultWbtcBalance, wbtcDecimals));
  const totalValueLocked = wbtcBalanceFormatted * btcPriceUsd;
  const navPrice = supplyFormatted > 0 ? totalValueLocked / supplyFormatted : 0;
  const marketCap = supplyFormatted * (priceCache.evaMarketPrice || navPrice);

  // 3. Transactions: Client-Side Scan (Month to Date)
  const recentDeposits: DepositTransaction[] = [];
  let volume24h = 0;

  try {
      const currentBlock = await provider.getBlockNumber();
      const now = new Date();
      // Start of the current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Calculate how many blocks to scan back to reach the 1st of the month
      // Arbitrum block time is approx 0.25s - 0.26s
      const msSinceStart = now.getTime() - startOfMonth.getTime();
      const secondsSinceStart = msSinceStart / 1000;
      // Using 0.25s per block to estimate count
      const estimatedBlocksSinceStart = Math.ceil(secondsSinceStart / 0.25);
      
      // Limit scan to reasonable max (e.g., 2M blocks) if month is very long/full, 
      // but usually this covers the month on L2.
      const scanLimit = 5000000; 
      const blocksToScan = Math.min(estimatedBlocksSinceStart, scanLimit);
      
      const fromBlock = currentBlock - blocksToScan;
      const filter = wbtcContract.filters.Transfer(null, VAULT_ADDRESS);

      // Chunking for performance
      const CHUNK_SIZE = 100000;
      const chunks = [];
      for (let i = fromBlock; i < currentBlock; i += CHUNK_SIZE) {
          chunks.push({
              from: i,
              to: Math.min(i + CHUNK_SIZE - 1, currentBlock)
          });
      }

      // Execute scans (Batched for minor concurrency)
      const BATCH_SIZE = 5;
      const allEvents: any[] = [];
      
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
          const batch = chunks.slice(i, i + BATCH_SIZE);
          const results = await Promise.all(batch.map((c: any) => 
              wbtcContract.queryFilter(filter, c.from, c.to).catch((e: any) => [])
          ));
          results.forEach((r: any) => allEvents.push(...r));
      }

      // Process Events
      for (const event of allEvents) {
          if ('args' in event) {
              const amount = parseFloat(ethers.formatUnits((event as any).args[2], wbtcDecimals));
              
              // Approximate timestamp from block difference to avoid thousands of getBlock calls
              const blockDiff = currentBlock - event.blockNumber;
              const approxTimestamp = now.getTime() - (blockDiff * 0.25 * 1000);

              // Filter 1: Must be in current month (redundant due to block calc, but good for precision)
              if (approxTimestamp >= startOfMonth.getTime()) {
                  recentDeposits.push({
                      hash: event.transactionHash,
                      amount: amount,
                      timestamp: approxTimestamp,
                      timeString: new Date(approxTimestamp).toLocaleString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' 
                      })
                  });

                  // Filter 2: Calculate 24h Volume
                  if (now.getTime() - approxTimestamp < 24 * 60 * 60 * 1000) {
                      volume24h += amount;
                  }
              }
          }
      }
      
      // Sort: Newest First
      recentDeposits.sort((a, b) => b.timestamp - a.timestamp);

  } catch (e) {
      console.warn("Client-side scan error:", e);
  }

  return {
    token: {
      totalSupply: supplyFormatted,
      btcPrice: btcPriceUsd, 
      marketPrice: priceCache.evaMarketPrice,
      navPrice: navPrice,
      marketCap: marketCap,
      symbol: tokenSymbol,
      name: tokenName
    },
    vault: {
      wbtcBalance: wbtcBalanceFormatted.toFixed(4),
      wbtcValue: totalValueLocked,
      deposits24h: volume24h,
      recentDeposits: recentDeposits
    }
  };
};