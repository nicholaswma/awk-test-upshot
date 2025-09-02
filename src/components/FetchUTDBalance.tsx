import { useState } from 'react';
import { Button } from './Button';
import { connect } from '@permaweb/aoconnect';

const PROCESS_IDS = {
    UTD: '1WV-nkLFcoaykJb7ztfScjcBRM6e83BB2dRzr-FjTHQ',
};

export function FetchUTDBalance() {
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = async () => {
        if (!window.arweaveWallet) return;
        setLoading(true);
        setError(null);

        try {
            const { dryrun } = connect({});

            const address = await window.arweaveWallet.getActiveAddress();

            // Custom getBalance implementation without Quantity
            const res = await dryrun({
                Id: PROCESS_IDS.UTD,
                Owner: address,
                process: PROCESS_IDS.UTD,
                tags: [{ name: 'Action', value: 'Balance' }],
            });

            console.log('Raw balance result:', res);
            setBalance(res);
        } catch (err) {
            console.error('Balance fetch failed:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-start justify-between gap-4">
            <h3 className="text-lg font-bold">Fetch UTD Balance</h3>

            <Button
                onClick={fetchBalance}
                disabled={loading || !window.arweaveWallet}
                className="w-full"
            >
                {loading ? 'Fetching...' : 'Fetch UTD Balance'}
            </Button>

            {error && (
                <div className="w-full rounded-lg bg-red-50 p-4 text-red-800">
                    <h4 className="font-semibold">Error:</h4>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {balance && (
                <div className="w-full">
                    <h4 className="mb-2 font-semibold">Balance Result:</h4>
                    <pre className="overflow-auto rounded bg-gray-100 p-2 text-black">
                        {JSON.stringify(balance, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
