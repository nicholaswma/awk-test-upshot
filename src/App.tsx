import {
    ArConnectStrategy,
    ArweaveWalletKit,
    // BrowserWalletStrategy,
    OthentStrategy,
} from './utils/awk';
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
                        // 'ACCESS_TOKENS',
                    ],
                    ensurePermissions: true,
                    strategies: [
                        new OthentStrategy(),
                        new ArConnectStrategy(),
                        // new BrowserWalletStrategy(),
                    ],
                }}
                theme={{ radius: 'minimal', displayTheme: theme }}
            >
                <Main />
            </ArweaveWalletKit>
        </ArweaveProvider>
    );
}

export default App;
