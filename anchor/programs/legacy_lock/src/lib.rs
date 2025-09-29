pub mod constants;
pub mod functions;
pub mod instructions;
pub mod state;
use anchor_lang::prelude::*;
pub use anchor_spl::token_interface::{close_account, CloseAccount};
pub use constants::*;
pub use functions::*;
pub use instructions::*;
pub use state::*;
declare_id!("F4nMRUyScL79wXJ2TLMDgp3LfRWrQm54S2BfsRpQMw6c");
#[program]
pub mod legacy_lock {

    use super::*;
    pub fn create_escrow_for_sol(
        ctx: Context<CreateEscrowForSol>,
        interval: u64,
        amount: u64,
        beneficiary: Pubkey,
        id: u32,
    ) -> Result<()> {
        ctx.accounts.escrow.set_inner({
            Escrow {
                amount,
                id: id,
                asset_type: 0,
                token_mint: None,
                maker: ctx.accounts.signer.key(),
                beneficiary,
                last_checkin: Clock::get()?.unix_timestamp,
                bump: ctx.bumps.escrow,
                interval,
                decimals: 9,
            }
        });
        transfer_sol(
            &ctx.accounts.signer.to_account_info(),
            &ctx.accounts.escrow.to_account_info(),
            &ctx.accounts.system_program,
            amount,
        )?;
        emit!(EscrowCreated {
            id,
            escrow: ctx.accounts.escrow.key(),
            maker: ctx.accounts.signer.key(),
            amount,
            beneficiary,
            escrow_type: EscrowType::Sol,
            mint: ctx.accounts.escrow.token_mint
        });
        Ok(())
    }
    pub fn create_escrow_for_token(
        ctx: Context<CreateEscrowForToken>,
        amount: u64,
        beneficiary: Pubkey,
        interval: u64,
        id: u32,
    ) -> Result<()> {
        ctx.accounts.escrow.set_inner(Escrow {
            amount,
            id,
            asset_type: 1,
            token_mint: Some(ctx.accounts.token_mint.key()),
            maker: ctx.accounts.signer.key(),
            beneficiary,
            last_checkin: Clock::get()?.unix_timestamp,
            bump: ctx.bumps.escrow,
            interval,
            decimals: ctx.accounts.token_mint.decimals,
        });
        let accounts = &ctx.accounts;
        transfer_token(
            &accounts.user_ata,
            &accounts.vault_ata,
            &accounts.token_program,
            &accounts.token_mint,
            &accounts.signer,
            amount,
        )?;
        emit!(EscrowCreated {
            id,
            escrow: ctx.accounts.escrow.key(),
            maker: ctx.accounts.signer.key(),
            amount,
            beneficiary,
            escrow_type: EscrowType::Token,
            mint: ctx.accounts.escrow.token_mint
        });
        Ok(())
    }
    pub fn claim_sol_by_owner(ctx: Context<ClaimSolByOwner>) -> Result<()> {
        let accounts = &ctx.accounts;
        require!(
            accounts.escrow.last_checkin + (accounts.escrow.interval as i64)
                > Clock::get()?.unix_timestamp,
            EscrowError::IntervalPassed
        );
        let accounts = &ctx.accounts;
        transfer_sol_by_pda(
            &accounts.escrow.to_account_info(),
            &accounts.owner.to_account_info(),
            accounts.escrow.amount,
        )?;
        emit!(EscrowClaimed {
            claimer: ClaimerType::Owner,
            escrow: ctx.accounts.escrow.key(),
            beneficiary: ctx.accounts.escrow.beneficiary.key(),
            amount: ctx.accounts.escrow.amount,
            escrow_type: EscrowType::Sol,
            mint: ctx.accounts.escrow.token_mint
        });
        Ok(())
    }
    pub fn check_in(ctx: Context<CheckIn>) -> Result<()> {
        ctx.accounts.escrow.last_checkin = Clock::get()?.unix_timestamp;
        Ok(())
    }
    pub fn claim_token_by_owner(ctx: Context<ClaimTokenByOwner>) -> Result<()> {
        let accounts = &ctx.accounts;
        require!(
            accounts.escrow.last_checkin + (accounts.escrow.interval as i64)
                > Clock::get()?.unix_timestamp,
            EscrowError::IntervalPassed
        );
        require!(
            accounts.token_mint.key() == accounts.escrow.token_mint.unwrap(),
            EscrowError::InvalidMint
        );
        let id_bytes = accounts.escrow.id.to_le_bytes();
        let account_bytes = accounts.owner.to_account_info().key();
        let seed = &[
            b"escrow",
            account_bytes.as_ref(),
            id_bytes.as_ref(),
            &[ctx.accounts.escrow.bump],
        ];
        let seeds = [&seed[..]];
        transfer_token_with_signer(
            &accounts.vault_ata,
            &accounts.user_ata,
            accounts.escrow.to_account_info(),
            &accounts.token_program,
            &accounts.token_mint,
            accounts.escrow.amount,
            &seeds,
        )?;
        let ctx_accounts = CloseAccount {
            account: accounts.vault_ata.to_account_info(),
            authority: accounts.escrow.to_account_info(),
            destination: accounts.owner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            accounts.token_program.to_account_info(),
            ctx_accounts,
            &seeds,
        );
        close_account(cpi_ctx)?;
        emit!(EscrowClaimed {
            claimer: ClaimerType::Owner,
            escrow: ctx.accounts.escrow.key(),
            beneficiary: ctx.accounts.escrow.beneficiary.key(),
            amount: ctx.accounts.escrow.amount,
            escrow_type: EscrowType::Token,
            mint: ctx.accounts.escrow.token_mint
        });
        Ok(())

        // Ok(())
    }
    pub fn claim_sol_by_beneficiary(ctx: Context<ClaimSolByBeneficiary>) -> Result<()> {
        let accounts = &ctx.accounts;
        require!(
            accounts.escrow.last_checkin + (accounts.escrow.interval as i64)
                < Clock::get()?.unix_timestamp,
            EscrowError::IntervalNotPassed
        );
        transfer_sol_by_pda(
            &accounts.escrow.to_account_info(),
            &accounts.signer,
            accounts.escrow.amount,
        )?;
        emit!(EscrowClaimed {
            claimer: ClaimerType::Beneficiary,
            escrow: ctx.accounts.escrow.key(),
            beneficiary: ctx.accounts.escrow.beneficiary.key(),
            amount: ctx.accounts.escrow.amount,
            escrow_type: EscrowType::Sol,
            mint: ctx.accounts.escrow.token_mint
        });
        Ok(())
    }
    pub fn claim_token_by_beneficiary(ctx: Context<ClaimTokenByBeneficiary>) -> Result<()> {
        let accounts = &ctx.accounts;
        require!(
            accounts.escrow.last_checkin + (accounts.escrow.interval as i64)
                < Clock::get()?.unix_timestamp,
            EscrowError::IntervalNotPassed
        );
        let id_bytes = accounts.escrow.id.to_le_bytes();
        let account_bytes = accounts.escrow.maker.key();
        let seed = &[
            b"escrow",
            account_bytes.as_ref(),
            id_bytes.as_ref(),
            &[ctx.accounts.escrow.bump],
        ];
        let seeds = [&seed[..]];
        transfer_token_with_signer(
            &accounts.vault_ata,
            &accounts.beneficiary_ata,
            accounts.escrow.to_account_info(),
            &accounts.token_program,
            &accounts.token_mint,
            accounts.escrow.amount,
            &seeds,
        )?;
        emit!(EscrowClaimed {
            claimer: ClaimerType::Beneficiary,
            escrow: ctx.accounts.escrow.key(),
            beneficiary: ctx.accounts.escrow.beneficiary.key(),
            amount: ctx.accounts.escrow.amount,
            escrow_type: EscrowType::Token,
            mint: ctx.accounts.escrow.token_mint
        });
        Ok(())
    }
}
