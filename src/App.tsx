import { ArweaveWalletKit } from 'arweave-wallet-kit';
import Main from './components/Main';
import { ArweaveProvider } from './contexts/ArweaveContext';
import { useTheme } from './hooks/useTheme';

function App() {
    const { theme } = useTheme();
    return (
        <ArweaveProvider>
            <ArweaveWalletKit
                config={{
                    permissions: [
                        'ACCESS_ADDRESS',
                        'ACCESS_ALL_ADDRESSES',
                        'ACCESS_ARWEAVE_CONFIG',
                        'ACCESS_PUBLIC_KEY',
                        'DECRYPT',
                        'DISPATCH',
                        'ENCRYPT',
                        'SIGN_TRANSACTION',
                    ],
                    ensurePermissions: true,
                }}
                theme={{ radius: 'minimal', displayTheme: theme }}
            >
                <Main />
            </ArweaveWalletKit>
        </ArweaveProvider>
    );
}

export default App;
