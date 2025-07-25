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

    const checkMintStatus = async () => {
        if (!ao) return;
        setLoading(true);
        setError(null);
        try {
            console.log(' | Checking Mint Status');
            const userAddress = await window.arweaveWallet.getActiveAddress();
            console.log(' | User Address: ', userAddress);
            const result = await ao.dryrun({
                ...createMessage(
                    '1WV-nkLFcoaykJb7ztfScjcBRM6e83BB2dRzr-FjTHQ',
                    [
                        tag('Action', 'Mint-Status'),
                        tag('X-Address', userAddress),
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
            <Button onClick={checkMintStatus} disabled={loading}>
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
