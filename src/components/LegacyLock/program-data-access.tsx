import { getProgram, getProgramId } from '@project/anchor'
import * as anchor from '@coral-xyz/anchor'
import { Cluster, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { useAnchorProvider } from '@/components/solana/use-anchor-provider'
import { toast } from 'sonner'
import { getEscrowPda, TEST_TOKEN_ADDRESS } from '@/lib/utils'
import { AccountLayout, createAssociatedTokenAccountInstruction, createMintToInstruction, getAccount, getAssociatedTokenAddress, unpackMint, } from '@solana/spl-token'
import { useWallet } from '@solana/wallet-adapter-react'

export function useMutationFucntions() {
  const { cluster } = useCluster()
  const queryClient = useQueryClient()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getProgram(provider, programId), [provider, programId])
  const createEscrowForSol = useMutation({
    mutationKey: ['escrow', 'create', 'devnet'],
    mutationFn: async ({ id, beneficiary, interval, amount }: { id: number, beneficiary: PublicKey, interval: number, amount: number }) => {
      const accInfo = await provider.connection.getAccountInfo(provider.publicKey)
      if (!accInfo) {
        toast.error("Wallet Not Connected")
        throw new Error("Wallet Not Connected")
      }
      if (accInfo.lamports < amount * LAMPORTS_PER_SOL) {
        toast.error("Not Enough Sol")
        throw new Error("Not Enough Sol")
      }
      const tid = toast.loading("Checking for Existing Ids...")
      const { pda } = getEscrowPda(id, provider.publicKey)
      const acc = await program.account.escrow.fetchNullable(pda)
      if (acc) {
        toast.error("Account With That Id Already Exists")
        toast.dismiss(tid)
        throw new Error("Account Already Exists")
      }
      toast.dismiss(tid)
      toast.message("Initializing... Please Sign The Upcoming Transaction")
      const data = await program.methods.createEscrowForSol(new anchor.BN(interval), new anchor.BN(amount * LAMPORTS_PER_SOL), beneficiary, id).accounts({ signer: provider.publicKey }).rpc({ skipPreflight: true });
      return data
    }
    ,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['escrows', 'all', { network: cluster.network }] })
      toast.message("Escrow Created Successfully")
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ['escrows', 'all', { network: cluster.network }] })
      toast.error('Failed to initialize account')
    },
  })
  const claimSolByUser = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      toast.message("Claiming... Please Sign The Upcoming Transaction")
      const { pda } = getEscrowPda(id, provider.publicKey)
      const sig = await program.methods.claimSolByOwner().accountsPartial({ escrow: pda, owner: provider.publicKey, systemProgram: SystemProgram.programId }).rpc();
      return sig
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['escrows', 'all', { network: cluster.network }] })
      toast.info("Successfully Claimed Sol And Closed Escrow")
    },
    //eslint-disable-next-line
    onError: async (e: any) => {
      if (e.error.errorCode && e.error.errorMessage) {
        toast.error(e.error.errorMessage)
      }
      await queryClient.invalidateQueries({ queryKey: ['escrows', 'all', { network: cluster.network }] })
      toast.error("Claim Failed")
    }
  })
  const claimSolByBeneficiary = useMutation({
    mutationFn: async ({ id, maker }: { id: number, maker: PublicKey }) => {
      toast.message("Claiming... Please Sign The Upcoming Transaction")
      const { pda } = getEscrowPda(id, maker);
      const sig = await program.methods.claimSolByBeneficiary().accounts({ signer: provider.publicKey }).accountsPartial({ escrow: pda }).rpc({ skipPreflight: true });
      return sig
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['escrowsforuser', 'all', { network: cluster.network }] })
      toast.info("Successfully Claimed Sol And Closed Escrow")
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ['escrowsforuser', 'all', { network: cluster.network }] })
      toast.error("Claim Failed")
    }
  })
  const checkIn = useMutation({
    mutationFn: async (id: number) => {
      toast.message("Checking In... Please Sign the Upcoming Transaction")
      const { pda } = getEscrowPda(id, provider.publicKey)
      await program.methods.checkIn().accounts({
        signer: provider.publicKey
      }).accountsPartial({
        escrow: pda
      }).rpc({ skipPreflight: true })
      await queryClient.invalidateQueries({ queryKey: ['escrows', 'all', { network: cluster.network }] })
    },
    onError: async () => {
      toast.message("Failed To Check In")
    },
    onSuccess: async () => {
      toast.info("Successfully Checked IN")
    }
  })
  const CreateEscrowForToken = useMutation({
    mutationFn: async ({ id, beneficiary, interval, amount, tokenMint }: { id: number, beneficiary: PublicKey, interval: number, amount: number, tokenMint: PublicKey }) => {
      toast.message(" Checking for to Mint To Exist...")
      const mintInfo = await provider.connection.getAccountInfo(tokenMint)
      if (!mintInfo) {
        toast.error("Not a Valid Mint Address")
        throw new Error("Not a Valid Mint")
      }
      const decodedMintInfo = unpackMint(tokenMint, mintInfo, mintInfo.owner)
      const userata = await getAssociatedTokenAddress(tokenMint, provider.publicKey)
      const userataInfo = await provider.connection.getAccountInfo(userata)
      if (!userataInfo) {
        toast.error("No Associated Token Account On The Mint")
        throw new Error("You Do Not Have A Associated Token Account On The Mint")
      }
      const ata = AccountLayout.decode(userataInfo.data)
      if (Number(ata.amount) < amount * 10 ** decodedMintInfo.decimals) {
        toast.error("Not Enough Tokens")
        throw new Error("You Do Not Have Enough Tokens")

      }
      if (!mintInfo) {
        toast.error("Please Give a Valid Mint Account")
        throw new Error()
      }
      const unpMintInfo = unpackMint(tokenMint, mintInfo, mintInfo.owner)
      // const { pda } = getEscrowPda(id, provider.publicKey)
      toast.info("Initializing... Please Sign The Upcoming Transaction")
      await program.methods.createEscrowForToken(new anchor.BN(amount * 10 ** unpMintInfo.decimals), beneficiary, new anchor.BN(interval), id).accounts({ signer: provider.publicKey, tokenMint: tokenMint, tokenProgram: mintInfo.owner }).rpc({ skipPreflight: true });
    },
    onError: async (e) => {
      toast.error("Failed To Create Escrow")
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['escrows', 'all', { network: cluster.network }] })
      toast.info("Escrow Created Successfully")
    }
  })
  const claimTokenByOwner = useMutation({
    mutationFn: async ({ id, tokenMint }: { id: number, tokenMint: PublicKey }) => {
      toast.info("Claiming... Please Sign The Upcoming Transaction")
      const mintInfo = await provider.connection.getAccountInfo(tokenMint)
      if (!mintInfo) {
        toast.error("Not a Valid Mint Account")
        throw new Error()
      }
      const { pda } = getEscrowPda(id, provider.publicKey)
      await program.methods.claimTokenByOwner().accounts({
        tokenMint: tokenMint,
        owner: provider.publicKey,
        tokenProgram: mintInfo.owner
      }).accountsPartial({
        escrow: pda
      }).rpc({ skipPreflight: true })
    },
    onError: async (e) => {
      toast.error("Failed To Claim Tokens")
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['escrows', 'all', { network: cluster.network }] })
      toast.info("Claim Successful")
    }
  })
  const claimTokenByBeneficiary = useMutation({
    mutationFn: async ({ id, tokenMint, maker }: { id: number, tokenMint: PublicKey, maker: PublicKey }) => {
      toast.info("Claiming... Please Sign The Upcoming Transaction")
      const mintInfo = await provider.connection.getAccountInfo(tokenMint)
      if (!mintInfo) {
        toast.error("Not a Valid Mint Account")
        throw new Error()
      }
      const { pda } = getEscrowPda(id, maker)
      await program.methods.claimTokenByBeneficiary().accounts({
        tokenMint: tokenMint,
        tokenProgram: mintInfo.owner,
        signer: provider.publicKey
      }).accountsPartial({
        escrow: pda
      }).rpc({ skipPreflight: true })
    },
    onError: async (e) => {
      await queryClient.invalidateQueries({ queryKey: ['escrowsforuser', 'all', { network: cluster.network }] })
      toast.error("Failed to Claim Tokens")
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['escrowsforuser', 'all', { network: cluster.network }] })
      toast.info("Claimed Token And Closed Pda")
    }
  })
  return { createEscrowForSol, claimTokenByBeneficiary, claimSolByUser, claimSolByBeneficiary, checkIn, CreateEscrowForToken, claimTokenByOwner }
}
export function useSolEscrowsForUser() {
  const { cluster } = useCluster()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getProgram(provider, programId), [provider, programId])
  return useQuery({
    queryKey: ['escrowsforuser', 'all', { network: cluster.network }],
    queryFn: async () => {
      const data = await program.account.escrow.all([{
        memcmp: {
          offset: 8 + 4 + 8 + 1 + 1 + 32, // discriminator + id + interval + asset_type + option tag + maker pubkey
          bytes: provider.publicKey.toBase58(),
        }
      }])
      return data
    },
    refetchOnWindowFocus: false
  })
}
export function useEscrowsForUser() {
  const { cluster } = useCluster()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getProgram(provider, programId), [provider, programId])
  return useQuery({
    queryKey: ['escrowsforuser', 'all', { network: cluster.network }],
    queryFn: async () => {
      const data = await program.account.escrow.all([{
        memcmp: {
          offset: 8 + 32,// acnchor discriminator + maker Pubkey
          bytes: provider.publicKey.toBase58(),
        }
      }])
      return data
    }
  })
}
export function useEscrows() {
  const { cluster } = useCluster()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getProgram(provider, programId), [provider, programId])
  return useQuery({
    queryKey: ['escrows', 'all', { network: cluster.network }],
    queryFn: async () => {
      return await program.account.escrow.all([{
        memcmp: {
          offset: 8,// anchor discriminator
          bytes: provider.publicKey.toBase58()
        }
      }])
    },
    refetchInterval: 20000
  })
}
export function useMintTestToken() {
  const wallet = useWallet()
  const { cluster } = useCluster()
  const queryClient = useQueryClient()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getProgram(provider, programId), [provider, programId])
  return useMutation({
    mutationFn: async () => {
      toast.message("Getting Or Creating Associated Token Account...")
      const ata = await getAssociatedTokenAddress(TEST_TOKEN_ADDRESS, provider.publicKey)
      const ataInfo = await provider.connection.getAccountInfo(ata);
      const tx = new Transaction()
      if (!ataInfo) {
        tx.add(createAssociatedTokenAccountInstruction(provider.publicKey, ata, provider.publicKey, TEST_TOKEN_ADDRESS))
      }
      toast.message("Minting... Please Sign The Upcoming Transaction")
      const MintAuthorityPair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(import.meta.env.VITE_SOLANA_KEYPAIR)))
      tx.add(createMintToInstruction(TEST_TOKEN_ADDRESS, ata, MintAuthorityPair.publicKey, 100 * 1e9))
      const blockhash = await provider.connection.getLatestBlockhash("confirmed")
      tx.recentBlockhash = blockhash.blockhash
      tx.feePayer = provider.publicKey
      tx.partialSign(MintAuthorityPair)
      const sig = await wallet.sendTransaction(tx, provider.connection)
      const lastBlockHash = await provider.connection.getLatestBlockhash();
      await program.provider.connection.confirmTransaction({
        blockhash: lastBlockHash.blockhash,
        lastValidBlockHeight: lastBlockHash.lastValidBlockHeight,
        signature: sig,
      });
      queryClient.invalidateQueries({ queryKey: ['testtokenbalance', { network: cluster.network }] })
      toast.info("Successfully Minted 100 Test Token to Your Current PublicKey")
    },
    onError: async () => {
      toast.error("Mint Failed")
    }
  })
}
export function useTestTokenBalance() {
  const { cluster } = useCluster()
  const provider = useAnchorProvider()
  return useQuery({
    queryKey: ['testtokenbalance', { network: cluster.network }],
    queryFn: async () => {
      try {
        const ata = await getAssociatedTokenAddress(TEST_TOKEN_ADDRESS, provider.publicKey)
        const ataInfo = await getAccount(provider.connection, ata)
        return Number(ataInfo.amount)
      } catch {
        return 0
      }
    },
  })
}
