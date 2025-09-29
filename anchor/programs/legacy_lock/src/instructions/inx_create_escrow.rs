use crate::state::Escrow;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};
#[derive(Accounts)]
#[instruction(interval: u64,amount:u64,beneficiary:Pubkey,id:u32)]
pub struct CreateEscrowForSol<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", signer.key().as_ref(),&id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount:u64,beneficiary:Pubkey,interval:u64,id:u32)]
pub struct CreateEscrowForToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", signer.key().as_ref(), &id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::token_program = token_program,
        associated_token::authority  = signer,
    )]
    pub user_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mint::token_program = token_program)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::token_program = token_program,
        associated_token::authority = escrow,
    )]
    pub vault_ata: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
