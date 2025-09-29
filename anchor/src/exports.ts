// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CounterIDL from '../target/idl/legacy_lock.json'
import type { LegacyLock } from '../target/types/legacy_lock'

// Re-export the generated IDL and type
export { LegacyLock, CounterIDL }

// The programId is imported from the program IDL.
export const COUNTER_PROGRAM_ID = new PublicKey(CounterIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getProgram(provider: AnchorProvider, address?: PublicKey): Program<LegacyLock> {
  return new Program({ ...CounterIDL, address: address ? address.toBase58() : CounterIDL.address } as LegacyLock, provider)
}
// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    return new PublicKey(CounterIDL.address)
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey(CounterIDL.address)
    case 'mainnet-beta':
    default:
      return COUNTER_PROGRAM_ID
  }
}
