import { http, createConfig } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const hasInjectedProvider =
  typeof window !== "undefined" && !!(window as any).ethereum;

/**
 * Wagmi config com Coinbase Smart Wallet (carteira silenciosa via Google)
 * + WalletConnect + MetaMask
 */
export const createWagmiConfig = (projectId?: string) =>
  createConfig({
    chains: [polygon],
    connectors: [
      // Coinbase Smart Wallet — cria carteira silenciosa pelo Google, aceita cartão
      coinbaseWallet({
        appName: "TrustBank",
        // smartWalletOnly = carteira silenciosa sem instalar MetaMask
        preference: "smartWalletOnly",
      }),
      ...(hasInjectedProvider ? [injected()] : []),
      ...(projectId ? [walletConnect({ projectId })] : []),
    ],
    transports: {
      [polygon.id]: http(
        import.meta.env.VITE_POLYGON_RPC_URL || "https://polygon-rpc.com"
      ),
    },
  });

export const fetchWalletConnectId = async (): Promise<string> => {
  try {
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-walletconnect-id`,
      { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
    );
    const data = await resp.json();
    return data.projectId || "";
  } catch {
    console.warn("Could not fetch WalletConnect project ID");
    return "";
  }
};
