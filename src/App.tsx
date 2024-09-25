import { ConnectButton, useConnection } from "arweave-wallet-kit";
import { ArweaveActions } from "./components/arweaveActions";

function App() {
  const { connected } = useConnection();
  return (
    <div className="flex flex-col py-8 space-y-4 w-full h-screen items-center">
      <div className="flex w-full px-8 items-center place-content-between">
        <div className="text-3xl font-bold drop-shadow-md shadow-slate-900">
          Arweave Wallet Kit Tester
        </div>
        <ConnectButton
          showBalance={false}
          showProfilePicture={false}
          useAns={false}
          className="self-end mr-8"
        />
      </div>
      {connected && <ArweaveActions />}
    </div>
  );
}

export default App;
