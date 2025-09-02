import { useState } from 'react';
import { Button } from './Button';
import { connect } from '@permaweb/aoconnect';

const PROCESS_IDS = {
    UTD: '1WV-nkLFcoaykJb7ztfScjcBRM6e83BB2dRzr-FjTHQ',
};

export function MintStatusCheck() {
    const [loading, setLoading] = useState(false);
    const [mintStatus, setMintStatus] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const checkMintStatus = async () => {
        if (!window.arweaveWallet) return;
        setLoading(true);
        setError(null);

        try {
            const { dryrun } = connect({});

            const address = await window.arweaveWallet.getActiveAddress();

            const res = await dryrun({
                Id: PROCESS_IDS.UTD,
                Owner: address,
                process: PROCESS_IDS.UTD,
                tags: [{ name: 'Action', value: 'Mint-Status' }],
                data: address,
            });

            console.log('Raw mint status result:', res);
            setMintStatus(res);
        } catch (err) {
            console.error('Mint status check failed:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-start justify-between gap-4">
            <h3 className="text-lg font-bold">Check Mint Status</h3>

            <Button
                onClick={checkMintStatus}
                disabled={loading || !window.arweaveWallet}
                className="w-full"
            >
                {loading ? 'Checking...' : 'Check Mint Status'}
            </Button>

            {error && (
                <div className="w-full rounded-lg bg-red-50 p-4 text-red-800">
                    <h4 className="font-semibold">Error:</h4>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {mintStatus && (
                <div className="w-full">
                    <h4 className="mb-2 font-semibold">Mint Status Result:</h4>
                    <pre className="overflow-auto rounded bg-gray-100 p-2 text-black">
                        {JSON.stringify(mintStatus, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
