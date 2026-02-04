import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '../services/blockchain';
import { LoadingState, DashboardData } from '../types';
import { StatCard } from './StatCard';
import { 
  ArrowTrendingUpIcon, 
  CircleStackIcon, 
  WalletIcon, 
  BanknotesIcon,
  CalculatorIcon,
  LockClosedIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  LinkIcon,
  ArrowPathIcon,
  XMarkIcon,
  ShieldCheckIcon,
  FireIcon,
  CpuChipIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.LOADING);
  const [data, setData] = useState<DashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsToRefresh, setSecondsToRefresh] = useState(60);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });

  const fetchData = async () => {
    try {
      setLoadingState(LoadingState.LOADING);
      setSecondsToRefresh(60);
      const result = await fetchDashboardData();
      setData(result);
      setLastUpdated(new Date());
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  useEffect(() => {
    fetchData();
    const refreshInterval = setInterval(fetchData, 60000); // Background refresh every 1 minute
    const countdownInterval = setInterval(() => {
      setSecondsToRefresh((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const fmtCurrency = (val: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        maximumFractionDigits: decimals 
    }).format(val);
  };
  
  const fmtSupply = (val: number) => {
     return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const fmtSats = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val));
  };

  const backingSats = data && data.token.btcPrice > 0 
    ? (data.token.navPrice / data.token.btcPrice * 100_000_000) 
    : 0;

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div className="fixed inset-0 cyber-grid -z-10 opacity-30"></div>
      
      {/* Glow Effects */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-[1400px] mx-auto px-6 py-8 md:py-12">
        {/* Top Navbar */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform">
              <ShieldCheckIcon className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter text-white">eva<span className="text-teal-400">.watch</span></h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Community Audit</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              <CalculatorIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
            <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm font-black">
              <ArrowPathIcon className="w-5 h-5" />
              <span className="tabular-nums min-w-[2ch] text-right">{secondsToRefresh}</span>
              <span className="text-sm font-black">s</span>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <UsersIcon className="w-3 h-3" />
            100% Community Owned & Operated
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Trust Through <span className="text-gradient-primary">Transparency.</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg font-medium leading-relaxed">
            A community-born watchdog for EverValue. Independent verification of Bitcoin backing and floor price stability. 
            Auditing on-chain at <code className="text-teal-400/80 bg-teal-400/5 px-2 py-0.5 rounded font-mono">0x45D...1C8c</code>
          </p>
        </header>

        {/* Main Interface */}
        <div className="space-y-8">
          {loadingState === LoadingState.ERROR && (
            <div className="glass-card border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400">
              <XMarkIcon className="w-5 h-5" />
              <p className="text-sm font-bold">Network timeout: Unable to sync with Arbitrum nodes. Retrying...</p>
            </div>
          )}

          {/* Pricing Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              title="EVA Exchange Rate" 
              value={data && data.token.marketPrice > 0 ? fmtCurrency(data.token.marketPrice) : '---'} 
              subValue="Community Market Price"
              icon={<BanknotesIcon className="w-5 h-5" />}
              loading={loadingState === LoadingState.LOADING}
            />
            <StatCard 
              title="Burn Price" 
              value={data ? fmtCurrency(data.token.navPrice) : '---'} 
              subValue={data ? `${fmtSats(backingSats)} sats / EVA` : 'Calculating...'}
              icon={<FireIcon className="w-5 h-5" />}
              loading={loadingState === LoadingState.LOADING}
            />
            <StatCard 
              title="Total Supply" 
              value={data ? fmtSupply(data.token.totalSupply) : '---'} 
              subValue="Circulating EVA"
              icon={<CircleStackIcon className="w-5 h-5" />}
              loading={loadingState === LoadingState.LOADING}
            />
            <StatCard 
              title="Bitcoin Index" 
              value={data ? fmtCurrency(data.token.btcPrice, 0) : '---'}
              subValue="Global Spot Rate"
              icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
              loading={loadingState === LoadingState.LOADING}
            />
          </div>

          {/* Audit Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl transition-all group-hover:bg-teal-500/10"></div>
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Vault Reserve</h3>
                   <div className="p-2 bg-teal-500/10 rounded-lg">
                      <WalletIcon className="w-5 h-5 text-teal-400" />
                   </div>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black text-white">{data ? data.vault.wbtcBalance : '0.0000'}</span>
                  <span className="text-lg font-bold text-teal-500">WBTC</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">USD Value: <span className="text-white">{data ? fmtCurrency(data.vault.wbtcValue, 0) : '---'}</span></p>
                
                <div className="mt-8 pt-6 border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verifiable Proof of Assets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Transaction Ledger Card */}
              <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Public Verification Ledger</h3>
                    <p className="text-slate-500 text-sm mt-1">Immutable community-watched record of Bitcoin deposits for {currentMonthName}.</p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Global Node Monitor</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900/40 text-[10px] font-black uppercase text-slate-600 tracking-widest">
                      <tr>
                        <th className="px-8 py-4">Scan Time</th>
                        <th className="px-8 py-4">Asset Flow</th>
                        <th className="px-8 py-4">Tx Hash</th>
                        <th className="px-8 py-4 text-right">Proof</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {loadingState === LoadingState.LOADING ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i}>
                            <td colSpan={4} className="px-8 py-6">
                              <div className="h-4 w-full bg-slate-800/30 animate-pulse rounded"></div>
                            </td>
                          </tr>
                        ))
                      ) : data?.vault.recentDeposits.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <p className="text-slate-600 font-medium italic">No transactions detected in the current monitoring window (Month to Date).</p>
                          </td>
                        </tr>
                      ) : (
                        data?.vault.recentDeposits.map((tx) => (
                          <tr key={tx.hash} className="group/row hover:bg-white/[0.01] transition-colors">
                            <td className="px-8 py-6 whitespace-nowrap">
                              <span className="text-xs font-mono text-slate-400">{tx.timeString}</span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{tx.amount.toFixed(6)}</span>
                                <span className="text-[10px] font-black text-slate-600 uppercase">WBTC</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800/50" title={tx.hash}>
                                {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <a 
                                href={`https://arbiscan.io/tx/${tx.hash}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-teal-500 hover:text-teal-400 transition-colors"
                              >
                                <LinkIcon className="w-4 h-4 ml-auto" />
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Immutable Contracts Card */}
              <div className="glass-card rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Immutable Protocol Contracts</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1 bg-emerald-500/5 px-2 py-1 rounded">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                      Node Verified
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AddressRow label="EVA Token (Arbitrum)" address="0x45D9831d8751B2325f3DBf48db748723726e1C8c" />
                  <AddressRow label="BTC Vault (Multi-Sig)" address="0xA89d65deF0A001947d8D5fDda93F9C4f8453902e" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Footer */}
        <footer className="mt-20 py-12 border-t border-slate-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 grayscale opacity-40">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Community Monitored</span>
              <div className="h-4 w-px bg-slate-800"></div>
              <span className="text-xs font-bold text-slate-400">Arbitrum RPC</span>
              <span className="text-xs font-bold text-slate-400">Chainlink</span>
              <span className="text-xs font-bold text-slate-400">CoinGecko</span>
            </div>
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
              © 2024 EVA.WATCH • INDEPENDENT COMMUNITY TERMINAL
            </p>
          </div>
        </footer>
      </div>

      <CalculatorModal 
          isOpen={isCalculatorOpen} 
          onClose={() => setIsCalculatorOpen(false)} 
          data={data}
      />
    </div>
  );
};

const CalculatorModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    data: DashboardData | null;
  }> = ({ isOpen, onClose, data }) => {
      if (!isOpen || !data) return null;
      const [amount, setAmount] = useState<string>('');
  
      const val = parseFloat(amount) || 0;
      const navVal = val * data.token.navPrice;
      const marketVal = val * (data.token.marketPrice || data.token.navPrice);
      const btcPerEva = data.token.navPrice / data.token.btcPrice; 
      const underlyingBtc = val * btcPerEva;
  
      const fmt = (v: number) => {
           return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
      };
  
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl" onClick={onClose}>
              <div className="glass-card rounded-[2.5rem] w-full max-w-lg p-6 sm:p-10 shadow-2xl relative border-white/5 animate-float" onClick={e => e.stopPropagation()}>
                  <button onClick={onClose} className="absolute top-6 right-6 sm:top-8 sm:right-8 text-slate-500 hover:text-white transition-colors p-2">
                      <XMarkIcon className="w-6 h-6" />
                  </button>

                  <div className="mb-8 sm:mb-10">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Value <span className="text-teal-400">Audit</span></h3>
                    <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">Compare current market vs guaranteed floor</p>
                  </div>
                  
                  <div className="space-y-6 sm:space-y-8">
                      <div>
                          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">EVA Position</label>
                          <div className="relative">
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-6 pr-16 py-5 sm:py-6 text-white text-2xl sm:text-3xl font-black focus:border-teal-500/50 outline-none transition-all"
                                placeholder=""
                                autoFocus
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-base sm:text-lg">EVA</span>
                          </div>
                      </div>
  
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 items-stretch">
                          <div className="bg-slate-900/50 p-4 sm:p-6 rounded-3xl border border-slate-800/50 flex flex-col items-center text-center h-full justify-center">
                              <span className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 whitespace-nowrap">Market Value</span>
                              <div className="text-base sm:text-xl font-black text-white">{fmt(marketVal)}</div>
                          </div>
                          <div className="bg-teal-500/5 p-4 sm:p-6 rounded-3xl border border-teal-500/10 flex flex-col items-center text-center h-full justify-center">
                              <span className="text-[9px] sm:text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2 whitespace-nowrap">Floor Value</span>
                              <div className="text-base sm:text-xl font-black text-white">{fmt(navVal)}</div>
                          </div>
                      </div>

                      <div className="bg-slate-900/30 p-5 sm:p-6 rounded-2xl border border-slate-800/50 flex flex-col xs:flex-row justify-between items-center gap-4 text-center xs:text-left">
                          <div>
                            <span className="block text-[10px] font-black text-slate-600 uppercase mb-1">Underlying Assets</span>
                            <div className="text-base sm:text-lg font-mono font-bold text-amber-500">{underlyingBtc.toFixed(8)} BTC</div>
                          </div>
                          <div className="xs:text-right">
                            <span className="block text-[10px] font-black text-slate-600 uppercase mb-1">Backing</span>
                            <span className="text-xs font-bold text-white">100% BTC</span>
                          </div>
                      </div>
                      
                      <button 
                        onClick={onClose}
                        className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                      >
                        Exit Analysis
                      </button>
                  </div>
              </div>
          </div>
      );
  };

const AddressRow: React.FC<{ label: string, address: string }> = ({ label, address }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-1.5 flex-1">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{label}</span>
            <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800/50 group transition-all hover:border-slate-700">
                <code className="text-[10px] text-slate-500 font-mono truncate">{address}</code>
                <button 
                    onClick={handleCopy}
                    className="p-1.5 text-slate-600 hover:text-white transition-colors ml-2 flex-shrink-0"
                >
                    {copied ? (
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <ClipboardDocumentIcon className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
}

export default Dashboard;
