import { Clock, Coins, ArrowRight } from 'lucide-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { BN, ProgramAccount } from '@coral-xyz/anchor';
import { useMutationFucntions } from '../program-data-access';

import Tooltip from '@mui/material/Tooltip';
import { formatDuration, formatReadable } from '@/lib/utils';
export interface EscrowCardProps {
  escrow: ProgramAccount<{
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
  isExpired: boolean
}
export interface Escrow {
  id: number;
  interval: BN;
  assetType: number;
  tokenMint: PublicKey | null;
  maker: PublicKey;
  beneficiary: PublicKey;
  amount: BN;
  lastCheckin: BN;
  bump: number;
}

export default function EscrowCard({ escrow, isExpired }: EscrowCardProps) {
  const { claimSolByUser, checkIn, claimTokenByOwner } = useMutationFucntions()
  const { isPending } = claimSolByUser
  const { isPending: claimIsPending } = claimTokenByOwner;
  const { isPending: checkIsPending } = checkIn

  return (
    <div className="group  relative bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/40 rounded-xl p-8 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:scale-[1.01]">
      {/* Glow effect */}
      <div className="absolute inset-0  bg-gradient-to-br from-cyan-500/8 to-blue-500/8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="flex items-start  justify-between mb-3">
        <div className="flex items-center gap-2 relative z-10">
          <span className="text-teal-400 font-bold uppercase tracking-wide px-2 py-1 rounded-lg
               border border-teal-400 shadow-[0_0_6px_rgba(0,255,255,0.7)]
               text-sm">
            ID
          </span>
          <span className=" text-cyan-200 font-medium text-lg">{escrow.account.id}</span>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800/40 px-2 py-1 rounded-md relative z-10">
          Last Check In At -  <span className='font-semibold text-blue-400'> {formatReadable(escrow.account.lastCheckin.toNumber())}</span>
        </span>
      </div>

      <div className="mb-5 relative z-10">
        <p className="text-white font-mono text-sm mb-3 bg-gray-800/25 px-3 flex flex-row justify-between py-2 rounded-md border border-gray-700/25">
          {escrow.account.beneficiary.toString()} <span className='text-cyan-700'>Beneficiary </span>
        </p>
        {escrow.account.assetType == 1 &&
          <p className="text-white font-mono text-sm mb-3 bg-gray-800/25 px-3 flex flex-row justify-between py-2 rounded-md border border-gray-700/25">
            {escrow.account.tokenMint?.toBase58()} <span className='text-cyan-700'>TokenMint </span>
          </p>}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800/25 px-2.5 py-1.5 rounded-md">
            <Coins size={14} className="text-emerald-400" />
            <span className="text-white font-semibold text-sm">
              {escrow.account.amount.toNumber() / LAMPORTS_PER_SOL} {escrow.account.assetType === 0 ? 'SOL' : 'Tokens'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-gray-800/25 px-2.5 py-1.5 rounded-md">
            <Clock size={14} className="text-purple-400" />
            <Tooltip title="Interval">

              <span className="text-gray-200 text-sm font-medium">
                {formatDuration(escrow.account.interval.toNumber())}
              </span>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${escrow.account.assetType === 0
          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
          : escrow.account.assetType === 1
            ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
          }`}>
          {escrow.account.assetType === 0 ? 'SOL' : 'TOKEN'}
        </span>

        <div className="flex items-center gap-2">
          {!isExpired &&
            <button
              disabled={checkIsPending}
              onClick={async () => {
                await checkIn.mutateAsync(escrow.account.id)
              }}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-all duration-200 hover:gap-2 group/btn px-4 py-2 rounded-md bg-gray-800/50 border border-gray-700/60 hover:bg-gray-800/80">
              Check In
              <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
            </button>}
          {isExpired && <Tooltip arrow title="The interval since the last check-in has passed, and only the beneficiary can claim the amount.">
            <button className="px-4 py-2 bg-gray-900 text-yellow-300 font-extrabold text-sm   rounded-lg
             border-1 border-yellow-300/80 shadow-[0_0_15px_rgba(255,255,0,0.9)]
             hover:shadow-[0_0_30px_rgba(255,255,0,1)] 
              transition-all duration-300">
              Expired
            </button>
          </Tooltip>}
          {(!isExpired && escrow.account.assetType == 0) && <button disabled={isPending}
            onClick={() => {
              claimSolByUser.mutate({ id: escrow.account.id })
            }}
            className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium transition-all duration-200 hover:gap-2 group/btn px-4 py-2 rounded-md bg-gray-800/50 border border-gray-700/60 hover:bg-gray-800/80">
            Close And Claim
            <Coins size={12} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>}
          {(!isExpired && escrow.account.assetType == 1 && escrow.account.tokenMint) && <button disabled={claimIsPending}
            onClick={() => {
              claimTokenByOwner.mutate({ id: escrow.account.id, tokenMint: new PublicKey(escrow.account.tokenMint!) })
            }}
            className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium transition-all duration-200 hover:gap-2 group/btn px-4 py-2 rounded-md bg-gray-800/50 border border-gray-700/60 hover:bg-gray-800/80">
            Close And Claim Tokens
            <Coins size={12} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>}
        </div>
      </div>
    </div>
  );
}
