
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_KEYPAIR: string;
  // add more env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
