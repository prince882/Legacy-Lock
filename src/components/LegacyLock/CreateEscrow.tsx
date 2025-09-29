import { useEffect, useState } from 'react';
import { motion } from "motion/react"
import { Plus, Shield, Zap, TrendingUp, Users } from 'lucide-react';
import EscrowCard from './create-extras/EscrowCard';
import EmptyState from './create-extras/EmphtyState';
import EscrowPopup from './create-extras/CreateEscrowModal';
import { useEscrows } from './program-data-access';
import { BN, ProgramAccount } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import Switch from '@mui/material/Switch';
import { WalletChecker } from '../cluster/cluster-ui';
type Escrow = ProgramAccount<{
  id: number;
  interval: BN;
  assetType: number;
  tokenMint: PublicKey | null;
  maker: PublicKey;
  beneficiary: PublicKey;
  amount: BN;
  lastCheckin: BN;
  bump: number;
}>
// Mock data for demonstration
function App() {
  const { data, isLoading } = useEscrows()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [escrows, setEscrows] = useState<Escrow[] | undefined>(data)
  const [showExpired, setShowExpired] = useState(true)
  useEffect(() => {
    if (!isLoading) {
      setEscrows(data)
    }
  }, [data, isLoading])
  function IsExpired(lastCheckin: number, interval: number) {
    const deadLine = lastCheckin + interval;
    const CurrentDate = Math.floor(Date.now() / 1000);
    if (CurrentDate > deadLine) {
      return true
    } else {
      return false
    }
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <WalletChecker>
      <div className="min-h-screen bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] text-white relative overflow-hidden pb-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 ">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mb-6 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Legacy Lock
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              In Spl Tokens We Support Tokens from Both Original Token Program and Token-2022 Program.
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className='absolute top-0 right-0  group flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-500 px-6 py-3 rounded-xl font-semibold text-base hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] '
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Plus size={20} className="relative z-1" />
              <span className="relative ">Create Escrow</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
            </motion.button>
          </div>

          {/* Stats Cards */}
          {escrows && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-cyan-100">Total Escrows</h3>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {escrows.length}
                </p>
              </div>


              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-purple-100">Beneficiaries</h3>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">

                  {new Set(escrows.map(e => e.account.beneficiary)).size}
                </p>
              </div>
            </div>
          )}

          {/* Recent Escrows Section */}
          <div className="mb-12 w-full flex flex-row justify-between items-center">
            <div>
              <h2 className="text-4xl  font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Recent Escrows
              </h2>
              <p className="text-gray-400 text-lg">
                Monitor and manage your asset escrows with advanced security
              </p>
            </div>
            <div>
              <span className="text-cyan-400 font-medium text-sm tracking-wide">
                Show Expired
              </span>
              <Switch color='warning' checked={showExpired} onChange={() => {
                setShowExpired(prev => !prev)
              }}></Switch>
            </div>
          </div>

          {/* Escrows Grid */}
          {escrows && escrows.length > 0 ? (
            <div className="flex flex-col gap-6 h-auto w-full ">
              {showExpired && escrows.map((e, i) => {
                const isExp = IsExpired(e.account.lastCheckin.toNumber(), e.account.interval.toNumber())
                return <EscrowCard key={i} escrow={e} isExpired={isExp} />
              })}
              {!showExpired && escrows.map((e, i) => {
                const isExp = IsExpired(e.account.lastCheckin.toNumber(), e.account.interval.toNumber());
                return !isExp && <EscrowCard key={i * 2} escrow={e} isExpired={false} />
              })}
            </div>
          ) : (
            <EmptyState />
          )}
        </main>

        {/* Modal */}
        <EscrowPopup
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </WalletChecker>
  );
}

export default App;
