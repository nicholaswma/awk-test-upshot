import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ArweaveWalletKit } from "arweave-wallet-kit";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ArweaveWalletKit
      config={{
        permissions: [
          "ACCESS_ADDRESS",
          "ACCESS_ALL_ADDRESSES",
          "ACCESS_PUBLIC_KEY",
          "DISPATCH",
          "SIGN_TRANSACTION",
        ],
        ensurePermissions: false,
      }}
      theme={{ radius: "minimal" }}
    >
      <App />
    </ArweaveWalletKit>
  </StrictMode>
);
