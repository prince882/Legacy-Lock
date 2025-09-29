import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'
import { LegacyLock } from '../target/types/legacy_lock'
import * as assert from 'assert'
describe('Legacy-Lock-Sol', () => {
  // setting the timeout to 30s so that we will be wait for escrow to finish
  jest.setTimeout(30_000);
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet;
  const beneficiary = Keypair.generate();
  const program = anchor.workspace.LegacyLock as Program<LegacyLock>
  beforeAll(async () => {
    // initializing beneficiary Wallet On Chain By Airdropping It Some SOL
    provider.connection.requestAirdrop(beneficiary.publicKey, 2 * LAMPORTS_PER_SOL)
  })
  it("Create a 20 Seconds Test Escrow", async () => {
    // Deriving The PDA
    const id = new anchor.BN(1);
    const seeds = [Buffer.from("escrow"), payer.publicKey.toBuffer(), id.toBuffer('le', 4)]
    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);
    //  Instruction to create the escrow
    await program.methods.createEscrowForSol(new anchor.BN(20), new anchor.BN(2 * LAMPORTS_PER_SOL), beneficiary.publicKey, 1)
      .accounts({ signer: payer.publicKey }).rpc();
    const acc = await program.account.escrow.fetch(escrowPda);
    assert.strictEqual(acc.maker.toBase58(), payer.publicKey.toBase58(), "Maker should Match");
    assert.ok(Number(acc.amount) == 2 * LAMPORTS_PER_SOL, "Balance should be 2 SOL");
  })
  it("Allow beneficiary to claim escrow after 20 seconds", async () => {
    await new Promise(resolve => setTimeout(resolve, 21000)); // Wait for 21 seconds for escrow to finsish
    // Deriving The PDA
    const beneficiaryInitialBalance = await provider.connection.getBalance(beneficiary.publicKey);
    const id = new anchor.BN(1);
    const seeds = [Buffer.from("escrow"), payer.publicKey.toBuffer(), id.toBuffer('le', 4)]
    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);
    const initialEscrowBalance = await provider.connection.getBalance(escrowPda);
    // Main Instruction to claim SOL
    const tx = await program.methods.claimSolByBeneficiary().accountsPartial({
      escrow: escrowPda, signer: beneficiary.publicKey,
      systemProgram: SystemProgram.programId,
    }).signers([beneficiary]).rpc()
    const lastBlockHash = await provider.connection.getLatestBlockhash();
    // Waiting for transaction to confirm
    await program.provider.connection.confirmTransaction({
      blockhash: lastBlockHash.blockhash,
      lastValidBlockHeight: lastBlockHash.lastValidBlockHeight,
      signature: tx,
    });
    const finalBeneficiaryBalance = await provider.connection.getBalance(beneficiary.publicKey);
    assert.equal(finalBeneficiaryBalance, beneficiaryInitialBalance + initialEscrowBalance, "Beneficiary should receive the escrow amount");
  })
  it("Allow owner to cancel escrow and claim money  inside and  till 20 seconds", async () => {
    // create a new test escrow for 20s because the previous one is already claimed by the beneficiary and closed
    await program.methods.createEscrowForSol(new anchor.BN(20), new anchor.BN(2 * LAMPORTS_PER_SOL), beneficiary.publicKey, 1).accounts({ signer: payer.publicKey }).rpc();
    const id = new anchor.BN(1);
    const seeds = [Buffer.from("escrow"), payer.publicKey.toBuffer(), id.toBuffer('le', 4)]
    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);
    const initialPayerBalance = await provider.connection.getBalance(payer.publicKey);
    const initialEscrowBalance = await provider.connection.getBalance(escrowPda);
    // Main Instruction to cancel escrow and claim SOL by owner
    const tx = await program.methods.claimSolByOwner().accountsPartial({ escrow: escrowPda, systemProgram: SystemProgram.programId, owner: payer.publicKey }).rpc()
    const lastBlockHash = await provider.connection.getLatestBlockhash();
    // Waiting for transaction to confirm
    await program.provider.connection.confirmTransaction({
      blockhash: lastBlockHash.blockhash,
      lastValidBlockHeight: lastBlockHash.lastValidBlockHeight,
      signature: tx,
    });
    // Getting Transaction Details to calculate the fees for the transaction
    const txDetails = await program.provider.connection.getTransaction(tx, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 1,
    });
    if (!txDetails || !txDetails.meta) {
      throw new Error("Transaction details not found");
    }
    const fees = txDetails.meta.fee;
    const finalPayerBalance = await provider.connection.getBalance(payer.publicKey);
    assert.ok(initialPayerBalance + initialEscrowBalance - fees == finalPayerBalance, "Owner should receive the escrow amount");
  })
})
