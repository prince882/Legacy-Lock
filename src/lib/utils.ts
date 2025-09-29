import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import {  MintLayout  } from '@solana/spl-token';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const CONTRACT_ADDRESS_KEY = new PublicKey('F4nMRUyScL79wXJ2TLMDgp3LfRWrQm54S2BfsRpQMw6c');
export const TEST_TOKEN_ADDRESS = new PublicKey('CSVvuEKwY3fKe7WrH79uwqUV9DhKPBXZFVfZsq7XhfBy')
export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}
export function getEscrowPda(id: number, pubkey: PublicKey) {
  const bnId = new BN(id);
  const seeds = [
    Buffer.from("escrow"),      // seed prefix
    pubkey.toBuffer(),          // user's public key
    bnId.toBuffer("le", 4),    // 4-byte little-endian
  ];

  const [pda, bump] = PublicKey.findProgramAddressSync(seeds, CONTRACT_ADDRESS_KEY);
  return { pda, seeds, bump };
}
export function formatDuration(seconds: number | bigint): string {
  let s = typeof seconds === "bigint" ? seconds : BigInt(seconds);

  const units: [bigint, string][] = [
    [365n * 24n * 60n * 60n, "year"],
    [30n * 24n * 60n * 60n, "month"], // approx 30 days
    [7n * 24n * 60n * 60n, "week"],
    [24n * 60n * 60n, "day"],
    [60n * 60n, "hour"],
    [60n, "minute"],
    [1n, "second"],
  ];

  const parts: string[] = [];

  for (const [unitSeconds, label] of units) {
    if (s >= unitSeconds) {
      const value = s / unitSeconds;
      s %= unitSeconds;
      parts.push(`${value} ${label}${value === 1n ? "" : "s"}`);
    }
  }

  return parts.length > 0 ? parts.join(" ") : "0 seconds";
}
export function formatReadable(timestampI64: number): string {
  const date = new Date(Number(timestampI64) * 1000);

  const day = date.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
}
export async function getDecimalsBulk(connection: Connection, mintAddresses: string[] | PublicKey[]) {
  const pubkeys = mintAddresses.map(addr => typeof addr === "string" ? new PublicKey(addr) : addr);

  // Fetch all accounts in one request
  const accounts = await connection.getMultipleAccountsInfo(pubkeys);

  return accounts.map((accountInfo, i) => {
    if (!accountInfo) return null; // account doesn't exist
    // decode mint account (deserializes decimals, supply, etc.)
    const mint = MintLayout.decode(accountInfo.data);
    return { mint: pubkeys[i].toBase58(), decimals: mint.decimals };
  });
}
function u32ToLEBytes(num: number): Buffer {
  if (num < 0 || num > 0xFFFFFFFF) {
    throw new Error("id must fit into u32");
  }
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(num);
  return buf;
}

export function getEscrow2Pda(id: number, pubkey: PublicKey) {
  const seeds = [
    Buffer.from("escrow"),
    pubkey.toBuffer(),
    u32ToLEBytes(id),
  ];

  const [pda, bump] = PublicKey.findProgramAddressSync(seeds, CONTRACT_ADDRESS_KEY);
  return { pda, bump };
}
