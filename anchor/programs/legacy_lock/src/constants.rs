use anchor_lang::error_code;
use anchor_lang::prelude::*;

//Errors
#[error_code]
pub enum EscrowError {
    #[msg("The Required Interaval for Last CheckIn has not passed Yet")]
    IntervalNotPassed,
    #[msg("The User Has Not Checked In Till The Interval and Now only the Beneficiary Can Claim The Reward")]
    IntervalPassed,
    #[msg("Insufficient funds in the escrow account.")]
    InsufficientFunds,
    #[msg("Unauthorized action attempted.")]
    Unauthorized,
    #[msg("Invalid asset type specified.")]
    InvalidAssetType,
    #[msg(" Transfer failed.")]
    TransferFailed,
    #[msg("Invalid mint Address.")]
    InvalidMint
}
// Events
#[event]
pub struct EscrowCreated {
    pub id:u32,
    pub escrow: Pubkey,
    pub maker: Pubkey,
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub escrow_type: EscrowType, // <-- enum
    pub mint: Option<Pubkey>,    // only Some() if token escrow
}
#[event]
pub struct EscrowClaimed {
    pub claimer: ClaimerType,
    pub escrow: Pubkey,
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub escrow_type: EscrowType,
    pub mint: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum EscrowType {
    Sol,
    Token,
    NFT
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum ClaimerType {
    Owner,
    Beneficiary,
}
