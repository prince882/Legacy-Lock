# LegacyLock

**Secure Your Crypto Assets for Your Beneficiaries**

LegacyLock is a Solana-based decentralized application that allows users to set up **escrow-based inheritance** for their crypto assets. Users can assign beneficiaries, set check-in intervals, and ensure that if they become inactive, their assets are safely claimable by their designated beneficiaries.

---

## Features

- 🛡 **Beneficiary Assignment**: Add one or multiple beneficiaries to your account.  
- ⏱ **Interval Check-ins**: Set a check-in interval. Regular check-ins keep your assets secure.  
- 🔓 **Automatic Escrow Expiry**: If the user hasn’t checked in after the interval, the escrow expires, and **only the beneficiary can claim the assets**.  
- 💰 **Token Support**: Supports **SOL** and any **SPL token** (both `token` and `token-2022` programs).  
- 📦 **Decentralized & Trustless**: Built entirely on Solana, no centralized control.

---

## How It Works

1. **Add Beneficiary**: User specifies a Solana public key to be the beneficiary, Each Beneficiary will have a Unique Id That Will be Specific To a User.
2. **Set Interval**: Choose a time interval for periodic check-ins.  
3. **Check-In**: User signs a transaction to confirm activity.  
4. **Escrow Expiry**: If no check-in occurs before the interval ends, the escrow is marked as expired.  
5. **Claim by Beneficiary**: Only the beneficiary can claim the assets after expiry.

---

## Supported Assets

- **Native SOL**  
- **SPL Tokens**  
  - Standard `token` program  
  - `token-2022` program

---
