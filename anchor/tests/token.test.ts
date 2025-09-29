
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { LegacyLock } from '../target/types/legacy_lock'
import * as assert from 'assert'
import { createMint, getAccount,  getAssociatedTokenAddress,getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token"
describe("Legacy-Lock_Token", () => {
  // setting the timeout to 30s so that we will be wait for escrow to finish@solana/web3.js
  jest.setTimeout(30_000);
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet;
  const beneficiary = Keypair.generate();
  const program = anchor.workspace.LegacyLock as Program<LegacyLock>
  beforeAll(async () => {
    // initializing beneficiary Wallet On Chain By Airdropping It Some SOL
    await provider.connection.requestAirdrop(beneficiary.publicKey, 2 * LAMPORTS_PER_SOL)
  })
  it("Create a 20 Seconds Test Escrow", async () => {
    // Creating a new mint for the test
    const mint = await createMint(provider.connection, payer.payer, payer.publicKey, payer.publicKey, 6);
    const OwnerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer.payer,
      mint,
      payer.publicKey,
    );
    // Deriving The PDA
    const id = new anchor.BN(2);
    const seeds = [Buffer.from("escrow"), payer.publicKey.toBuffer(), id.toBuffer('le', 4)]
    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);
    // Minting the owner some tokens to use in the escrow
    await mintTo(provider.connection, payer.payer, mint, OwnerAta.address, payer.publicKey, 100)
    // Main Instruction to create the escrow
    await program.methods.createEscrowForToken(new anchor.BN(100), beneficiary.publicKey, new anchor.BN(20), 2).accounts({
      signer: payer.publicKey,
      tokenMint: mint, 
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();
    const acc = await program.account.escrow.fetch(escrowPda);
    assert.strictEqual(acc.maker.toBase58(), payer.publicKey.toBase58(), "Maker and Payer should Match");
    assert.strictEqual(acc.amount.toNumber(), 100, "Amount should be 100")
  })
  it("Allow Owner to Withdraw Before Time", async () => {
    // Deriving The PDA
    const id = new anchor.BN(2);
    const seeds = [Buffer.from("escrow"), payer.publicKey.toBuffer(), id.toBuffer('le', 4)]
    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);
    const escrowData = await program.account.escrow.fetch(escrowPda);
    // Here We need to fetch the token mint from previous escrow pda because that is what we are claiming
    // Checking for the token mint to exist in the escrow data
    if (!escrowData.tokenMint) {
      throw new Error("No Token Mint in escrowPda")
    }
    const mint = escrowData.tokenMint;
    // deriving Owner's Associated Token Account
    const OwnerAta = await getAssociatedTokenAddress(
      mint,
      payer.publicKey,
    );
    // Main Instruction to claim Tokens
    await program.methods.claimTokenByOwner().accounts({
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMint: mint,
      owner: payer.publicKey
    }).accountsPartial({ escrow: escrowPda }).rpc();
    const tokeninfo = await getAccount(provider.connection, OwnerAta);
    assert.strictEqual(Number(tokeninfo.amount), escrowData.amount.toNumber(), "Owner should recieve all the tokens")
  })
  it("Allow beneficiary to claim Tokens after the interval has passed and owner hasn't chekced in ", async () => {
    // Generate a new escrow with a new mint because the owner has already claimed the previous one
    const mint = await createMint(provider.connection, payer.payer, payer.publicKey, payer.publicKey, 6);
    const OwnerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer.payer,
      mint,
      payer.publicKey,
    );
    await mintTo(provider.connection, payer.payer, mint, OwnerAta.address, payer.publicKey, 100)
    await program.methods.createEscrowForToken(new anchor.BN(100), beneficiary.publicKey, new anchor.BN(20), 2).accounts({
      signer: payer.publicKey,
      tokenMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();
    // Wait for 21 seconds to ensure the escrow time has passed and the user hasn't chekced in since then
    await new Promise(resolve => setTimeout(resolve, 21000));
    // Deriving the PDA
    const id = new anchor.BN(2);
    const seeds = [Buffer.from("escrow"), payer.publicKey.toBuffer(), id.toBuffer('le', 4)]
    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);
    const escrowData = await program.account.escrow.fetch(escrowPda);
  // Main Instruction to claim Tokens
    await program.methods.claimTokenByBeneficiary().accounts({
      tokenMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      signer: beneficiary.publicKey
    }).accountsPartial({ escrow: escrowPda }).signers([beneficiary]).rpc()
    // Deriving the Beneficiary Ata
    const beneficiaryAta = await getAssociatedTokenAddress(
      mint,
      beneficiary.publicKey,
    );
    const beneficiaryAtaInfo = await getAccount(provider.connection, beneficiaryAta);
    assert.strictEqual(Number(beneficiaryAtaInfo.amount), escrowData.amount.toNumber(), "Beneficiary should recieve all the tokens")
  })
})
