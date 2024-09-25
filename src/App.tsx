import { ConnectButton, useConnection } from "arweave-wallet-kit";
import { ArweaveActions } from "./components/arweaveActions";

function App() {
  const { connected } = useConnection();
  return (
    <div className="flex flex-col py-8 space-y-4 w-full h-screen items-center">
      <ConnectButton
        showBalance={false}
        showProfilePicture={false}
        useAns={false}
        className="self-end mr-8"
      />
      {connected && <ArweaveActions />}
    </div>
  );
}

export default App;
