import { ConnectButton } from "arweave-wallet-kit";

function App() {
  return (
    <div className="flex w-full h-screen items-center justify-center">
      <ConnectButton
        showBalance={false}
        showProfilePicture={false}
        useAns={false}
      />
    </div>
  );
}

export default App;
