use anchor_lang::prelude::*;

use crate::Escrow;
#[derive(Accounts)]
pub struct CheckIn<'info> {
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", signer.key().as_ref(), escrow.id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}
