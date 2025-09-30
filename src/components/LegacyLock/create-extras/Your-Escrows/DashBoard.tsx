import { useEffect, useState } from 'react';
import { Clock, Wallet, Coins, User, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import { useMutationFucntions, useEscrowsForUser } from '../../program-data-access';
import { formatDuration, formatReadable } from '@/lib/utils';
import { WalletChecker } from '@/components/cluster/cluster-ui';
import { useWallet } from '@solana/wallet-adapter-react';
interface Escrow {
  id: number;                 // Unique identifier
  interval: number;           // In seconds
  assetType: number;       // 0 = SOL, 1 = SPL token, 2 = NFT
  tokenMint: string | null;   // Null for SOL, Pubkey string for tokens
  maker: string;              // Pubkey (base58 string)
  beneficiary: string;        // Pubkey (base58 string)
  amount: number;             // Amount in lamports
  decimals: number;
  lastCheckin: number;        // Timestamp (ms since epoch)
  bump: number;               // PDA bump
  isClaimable: boolean;       // Derived state
}
function App() {
  const wallet = useWallet();
  const { claimSolByBeneficiary: { isPending: mutisLoading, mutateAsync: ClaimSol }, claimTokenByBeneficiary: { isPending: tokenIsPending, mutateAsync: ClaimToken } } = useMutationFucntions();
  const { data, isLoading } = useEscrowsForUser()
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [escrows, setEscrows] = useState<Escrow[] | undefined>(undefined)
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };
  function IsExpired(lastCheckin: number, interval: number) {
    const deadLine = lastCheckin + interval;
    const CurrentDate = Math.floor(Date.now() / 1000);
    if (CurrentDate > deadLine) {
      return true
    } else {
      return false
    }
  }
  useEffect(() => {
    if (data && !isLoading) {
      (async () => {
        const tempEscrow = data.map(({ account }) => ({
          id: account.id,
          interval: account.interval.toNumber(),
          assetType: account.assetType,
          tokenMint: account.tokenMint ? account.tokenMint.toBase58() : null,
          maker: account.maker.toBase58(),
          decimals: account.decimals,
          beneficiary: account.beneficiary.toBase58(),
          amount: account.amount.toNumber(),
          lastCheckin: account.lastCheckin.toNumber(),
          bump: account.bump,
          isClaimable: IsExpired(account.lastCheckin.toNumber(), account.interval.toNumber()),
        }));
        setEscrows(tempEscrow)
      })()
    }
  }, [data, isLoading])
  if (isLoading && wallet.connected) {
    return <div>Loading...</div>
  }

  const formatAmount = (amount: number, assetType: number, tokenMint?: string) => {
    if (assetType === 0) {
      return `${(amount / 1e9).toFixed(7)} SOL`;
    }
    if (tokenMint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") {
      return `${(amount / 1e9).toFixed(2)} USDC`;
    }
    return `${amount} tokens`;
  };



  return (
    <WalletChecker>
      <div className="min-h-screen  relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,217,255,0.1),transparent_50%)]"></div>

        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-4">
              Your Escrows
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage and claim your LegacyLock escrows. When makers stop checking in, you can claim their locked assets.
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-8 rounded-full"></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{escrows?.length || 0}</p>
                  <p className="text-gray-400">Total Escrows</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg border border-green-400/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{escrows && escrows.filter(e => e.isClaimable).length}</p>
                  <p className="text-gray-400">Claimable</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-400/20 rounded-2xl p-6 hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {escrows && escrows.reduce((acc, e) => acc + (e.assetType === 0 ? e.amount / 1000000000 : 0), 0).toFixed(1)}
                  </p>
                  <p className="text-gray-400">Total SOL</p>
                </div>
              </div>
            </div>
          </div>

          {/* Escrows Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {escrows && escrows.map((escrow, i) => (
              <div
                key={i}
                className={`group relative bg-gray-900/40 backdrop-blur-lg rounded-3xl border transition-all duration-500 hover:scale-[1.02] ${escrow.isClaimable
                  ? 'border-green-400/50 shadow-lg shadow-green-400/20 hover:shadow-xl hover:shadow-green-400/30'
                  : 'border-gray-700/50 hover:border-cyan-400/30'
                  }`}
              >
                {/* Claimable indicator */}
                {escrow.isClaimable && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="relative">
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-ping absolute"></div>
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${escrow.isClaimable ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                      <span className="text-lg font-semibold text-white">ID #{escrow.id}</span>
                    </div>
                    {escrow.isClaimable ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Asset Info */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Asset</span>
                      <div className="flex items-center space-x-2">
                        {escrow.assetType === 0 ? (
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"></div>
                        ) : (
                          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {escrow.assetType == 0 && formatAmount(escrow.amount, escrow.assetType, escrow.tokenMint || undefined)}
                      {escrow.assetType == 1 && `${escrow.amount / 10 ** escrow.decimals} Tokens`}
                    </p>
                  </div>

                  {/* Token Mint (if applicable) */}
                  {escrow.tokenMint && (
                    <div className="mb-4 p-4 bg-gray-800/50  rounded-xl border border-gray-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Token Mint</span>
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono text-cyan-400 flex-1 truncate">
                          {escrow.tokenMint}
                        </code>
                        <button
                          onClick={() => copyToClipboard(escrow.tokenMint!)}
                          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Maker Address */}
                  <div className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Maker</span>
                      <User className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono text-purple-400 flex-1 truncate">
                        {escrow.maker}
                      </code>
                      <button
                        onClick={() => copyToClipboard(escrow.maker)}
                        className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-400 hover:text-purple-400" />
                      </button>
                    </div>
                  </div>

                  {/* Timing Info */}
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Check-in Interval</p>
                      <p className="text-white font-semibold">{formatDuration(escrow.interval)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Last Check-in</p>
                      <p className="text-white font-semibold">{formatReadable(escrow.lastCheckin)}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {escrow.assetType == 0 && <button
                    className={`w-full py-3.5  px-6 rounded-xl font-semibold  transition-all duration-300 ${escrow.isClaimable
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-black hover:from-green-500 hover:to-emerald-600 shadow-lg shadow-green-400/25 hover:shadow-xl hover:shadow-green-400/40'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
                      }`}
                    disabled={!escrow.isClaimable || mutisLoading}
                    onClick={() => {
                      ClaimSol({ id: escrow.id, maker: new PublicKey(escrow.maker) })
                    }}
                  >
                    {escrow.isClaimable ? 'Claim Escrow' : 'Not Claimable Yet'}
                  </button>}
                </div>
                {(escrow.assetType == 1 && escrow.tokenMint) && <button
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 ${escrow.isClaimable
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-black hover:from-green-500 hover:to-emerald-600 shadow-lg shadow-green-400/25 hover:shadow-xl hover:shadow-green-400/40'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  disabled={!escrow.isClaimable || tokenIsPending}
                  onClick={async () => {
                    await ClaimToken({ id: escrow.id, tokenMint: new PublicKey(escrow.tokenMint!), maker: new PublicKey(escrow.maker) })
                  }}
                >
                  {escrow.isClaimable ? 'Claim Escrow' : 'Not Claimable Yet'}
                </button>}
                {/* Glow effect for claimable escrows */}
                {escrow.isClaimable && (
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State (if no escrows) */}
          {escrows && escrows.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No Escrows Found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                You don't have any escrows yet. When someone creates an escrow with you as the beneficiary, it will appear here.
              </p>
            </div>
          )}

          {/* Copy notification */}
          {copiedAddress && (
            <div className="fixed bottom-8 right-8 bg-gray-900/90 backdrop-blur-lg border border-green-400/50 rounded-lg px-6 py-3 text-green-400 font-semibold animate-fade-in">
              Address copied to clipboard!
            </div>
          )}
        </div>

        {/* Custom animations */}
      </div>
    </WalletChecker>
  );
}

export default App;
