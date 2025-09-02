import { useArweave } from '../hooks/useArweave';
import { useState } from 'react';
import { createMessage, tag } from '../utils/arweaveUtils';
import { Button } from './Button';
import { createDataItemSigner } from '@permaweb/aoconnect';

export function UpshotMintStatus() {
    const { ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [mintStatus, setMintStatus] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [xAddress, setXAddress] = useState<string>('');

    const checkMintStatus = async () => {
        if (!ao || !xAddress.trim()) return;
        setLoading(true);
        setError(null);
        try {
            console.log(' | Checking Mint Status');
            console.log(' | X-Address: ', xAddress);
            const result = await ao.message({
                ...createMessage(
                    '1WV-nkLFcoaykJb7ztfScjcBRM6e83BB2dRzr-FjTHQ',
                    [
                        tag('Action', 'Mint-Status'),
                        tag('X-Address', xAddress.trim()),
                    ]
                ),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Full DryRunResult: ');
            console.log(result);

            if (result.Messages && result.Messages[0]?.Data) {
                try {
                    const parsedData = JSON.parse(result.Messages[0].Data);
                    setMintStatus(parsedData);
                } catch (e) {
                    setMintStatus(result.Messages[0].Data);
                }
            } else if (result.Output) {
                setMintStatus(result.Output);
            } else {
                setMintStatus(result);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-start justify-between gap-2">
            <div className="w-full">
                <label
                    htmlFor="x-address"
                    className="mb-1 block text-sm font-medium text-white"
                >
                    X-Address:
                </label>
                <input
                    id="x-address"
                    type="text"
                    value={xAddress}
                    onChange={(e) => setXAddress(e.target.value)}
                    placeholder="Enter X-Address"
                    className="w-full rounded border-2 border-gray-400 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
            </div>

            <Button
                onClick={checkMintStatus}
                disabled={loading || !xAddress.trim()}
            >
                {loading ? 'Checking...' : 'Check Mint Status'}
            </Button>

            {error && <div className="text-red-500">Error: {error}</div>}

            {mintStatus && (
                <div className="w-full">
                    <h4 className="mb-2 font-semibold">Mint Status:</h4>
                    <pre className="overflow-auto rounded bg-gray-100 p-2 text-black">
                        {JSON.stringify(mintStatus, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
