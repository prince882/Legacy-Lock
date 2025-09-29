use anchor_lang::prelude::*;
#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub maker: Pubkey,
    pub beneficiary: Pubkey,
    pub id: u32, // Unique identifier for the escrow
    pub interval: u64,
    pub asset_type: u8,             // 0 for SOL, 1 for SPL token , 2 for an NFT
    pub token_mint: Option<Pubkey>, // None for SOL, Some for SPL token
    pub decimals: u8,// 9 for sol, another value for a spl-token
    pub amount: u64,
    pub last_checkin: i64,
    pub bump: u8,
}
