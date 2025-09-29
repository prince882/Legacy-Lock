use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::{Escrow, EscrowError};
#[derive(Accounts)]
pub struct ClaimSolByOwner<'info> {
    #[account(mut,constraint = owner.key() == escrow.maker @ EscrowError::Unauthorized)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", owner.key().as_ref(), escrow.id.to_le_bytes().as_ref()],
        bump = escrow.bump,
        close = owner
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct ClaimTokenByOwner<'info> {
    #[account(mut,constraint = owner.key() == escrow.maker @ EscrowError::Unauthorized)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        constraint = escrow.token_mint.is_some() && escrow.token_mint.unwrap() == token_mint.key() @ EscrowError::InvalidMint,
        close = owner,
        seeds = [b"escrow", owner.key().as_ref(), escrow.id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::token_program = token_program,
        associated_token::authority = owner
    )]
    pub user_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::token_program = token_program,
        associated_token::authority = escrow
    )]
    pub vault_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mint::token_program = token_program)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
#[derive(Accounts)]
pub struct ClaimTokenByBeneficiary<'info> {
    #[account(mut,constraint = signer.key() == escrow.beneficiary @ EscrowError::Unauthorized)]
    signer: Signer<'info>,
    #[account(
        mut,
        close = signer,
        constraint = escrow.token_mint.is_some() && escrow.token_mint.unwrap() == token_mint.key() @ EscrowError::InvalidMint,
        seeds = [b"escrow", escrow.maker.as_ref(), escrow.id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::token_program = token_program,
        associated_token::authority = signer
    )]
    pub beneficiary_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::token_program = token_program,
        associated_token::authority = escrow
    )]
    pub vault_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mint::token_program = token_program)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]

pub struct ClaimSolByBeneficiary<'info> {
    #[account(mut,constraint = signer.key() == escrow.beneficiary @ EscrowError::Unauthorized)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        close = signer,
        seeds = [b"escrow", escrow.maker.key().as_ref(), escrow.id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}
