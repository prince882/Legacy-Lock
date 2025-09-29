import { useEffect, useState } from "react";
import { useMintTestToken, useTestTokenBalance } from "../../program-data-access";
import { TEST_TOKEN_ADDRESS } from "@/lib/utils";


export default function NeonTokenMintCard() {

  const { data, isLoading } = useTestTokenBalance()
  const MintHook = useMintTestToken()
  const [balance, setbalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMint = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await MintHook.mutateAsync()
    } catch (e) {
      console.error("Mint failed", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!isLoading && data) {
      setbalance(data)
    }
  }, [data, isLoading])
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TEST_TOKEN_ADDRESS.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <div
      className={`w-full `}
      style={{
        boxShadow:
          "0 0 40px rgba(58, 138, 255, 0.15), 0 0 80px rgba(133, 86, 255, 0.1) inset",
      }}
    >
      <div className="relative rounded-3xl p-8 bg-[#07070a] border border-transparent overflow-hidden">
        {/* Animated neon gradient border */}
        <div
          className="absolute inset-0 rounded-3xl -z-10 animate-pulse"
          style={{
            background:
              "linear-gradient(135deg, rgba(58,138,255,0.15), rgba(133,86,255,0.1))",
            boxShadow: "0 0 40px rgba(58,138,255,0.25)",
          }}
        />

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm uppercase tracking-widest text-zinc-400">Test Token</div>
            <div className="mt-2 text-4xl font-bold text-white drop-shadow-[0_0_8px_rgba(58,138,255,0.6)]">
              Test Tokens
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-sm text-zinc-400">Balance</div>
            <div
              className={`mt-2 px-5 py-2 rounded-full text-lg font-semibold text-white transition-all duration-200 ${loading ? "scale-110 animate-pulse" : "hover:scale-105"
                }`}
              style={{
                background:
                  "linear-gradient(90deg, rgba(58,138,255,0.2), rgba(133,86,255,0.15))",
                border: "1px solid rgba(133,86,255,0.3)",
                boxShadow:
                  "0 0 16px rgba(58,138,255,0.4), 0 0 30px rgba(133,86,255,0.2)",
              }}
            >
              {balance / 1e9}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-zinc-400">Mint address</div>
              <div
                className="mt-2 truncate text-base font-mono text-white cursor-default select-all hover:text-cyan-300 transition-colors"
                title={TEST_TOKEN_ADDRESS.toBase58()}
              >
                {TEST_TOKEN_ADDRESS.toBase58()} </div>
            </div>

            <button
              onClick={handleCopy}
              className="ml-4 inline-flex items-center justify-center rounded-xl px-4 py-2 text-base font-medium text-white bg-transparent border border-zinc-700 hover:border-cyan-400 hover:text-cyan-300 active:scale-95 transition-all duration-200"
              aria-label="Copy mint address"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h8" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleMint}
            disabled={loading}
            className={`w-full relative overflow-hidden rounded-2xl px-6 py-3 text-lg font-semibold text-white flex items-center justify-center gap-3 transition-transform duration-200 active:scale-95 ${loading ? "opacity-80 cursor-wait" : "hover:translate-y-[-3px] hover:shadow-[0_0_30px_rgba(58,138,255,0.4)]"
              }`}
            style={{
              background:
                "linear-gradient(90deg, rgba(58,138,255,0.25), rgba(133,86,255,0.2))",
              border: "1px solid rgba(58,138,255,0.35)",
            }}
          >
            <span
              className="absolute inset-0 -z-10"
              style={{
                boxShadow: loading
                  ? "0 0 40px rgba(58,138,255,0.3), 0 0 80px rgba(133,86,255,0.2)"
                  : "0 0 20px rgba(58,138,255,0.2)",
              }}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transform transition-transform ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
            </svg>

            <span>{loading ? "Minting 100..." : "Mint 100 tokens"}</span>
          </button>
        </div>

        <div className="mt-4 text-xs text-zinc-500 text-center tracking-widest">
          Our Program Currently Only Supports Devnet. If you just Want to see how the program works you can mint yourself 100 test tokens and then copy the mint address to use them  to create Escrows in our Website.
          <br />
          - This tokens has 9 decimals and is only available on devnet .
        </div>
      </div>
    </div>
  );
}
