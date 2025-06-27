import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useArweave } from '../hooks/useArweave';
import { useConnection, useApi } from '../utils/awk';
import { createDataItemSigner } from '@permaweb/aoconnect';

export function UpshotOwnedPacks() {
    const { ao } = useArweave();
    const { connected } = useConnection();
    const api = useApi();
    const [packsLoading, setPacksLoading] = useState(false);
    const [cardsLoading, setCardsLoading] = useState(false);
    const [process, setProcess] = useState(
        'bAtS9pAgHBghwg7frBYwy7E4bz2lOjcBw-XN9cqSung'
    );
    const [ownedPacksResult, setOwnedPacksResult] = useState<any>(null);
    const [ownedCardsResult, setOwnedCardsResult] = useState<any>(null);
    const [ownerAddress, setOwnerAddress] = useState('');
    const [errorResult, setErrorResult] = useState<string | null>(null);

    const getOwnedPacks = async () => {
        if (!process || !ao) return;

        let addressToUse = ownerAddress;

        // If no manual address provided, try to get connected wallet address
        if (!addressToUse && connected && api) {
            try {
                const walletAddress = await api.getActiveAddress();
                addressToUse = walletAddress;
            } catch (err) {
                console.error('Failed to get wallet address:', err);
            }
        }

        if (!addressToUse) {
            console.error(
                'No address available - connect wallet or enter address manually'
            );
            return;
        }

        setPacksLoading(true);
        setOwnedPacksResult(null);
        setErrorResult(null);

        try {
            const dryRunResult = await ao.dryrun({
                process,
                tags: [{ name: 'Action', value: 'GetOwnedPacks' }],
                data: JSON.stringify({
                    owner: addressToUse,
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log('Get Owned Packs - Dry Run Result:', dryRunResult);

            // Check for errors first
            if (dryRunResult.Error) {
                console.error('AO Process Error:', dryRunResult.Error);
                setErrorResult(dryRunResult.Error);
                return;
            }

            if (dryRunResult.Messages && dryRunResult.Messages[0]?.Data) {
                const parsedData = JSON.parse(dryRunResult.Messages[0].Data);
                setOwnedPacksResult(parsedData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setPacksLoading(false);
        }
    };

    const getOwnedCards = async () => {
        if (!process || !ao) return;

        let addressToUse = ownerAddress;

        // If no manual address provided, try to get connected wallet address
        if (!addressToUse && connected && api) {
            try {
                const walletAddress = await api.getActiveAddress();
                addressToUse = walletAddress;
            } catch (err) {
                console.error('Failed to get wallet address:', err);
            }
        }

        if (!addressToUse) {
            console.error(
                'No address available - connect wallet or enter address manually'
            );
            return;
        }

        setCardsLoading(true);
        setOwnedCardsResult(null);
        setErrorResult(null);

        try {
            const dryRunResult = await ao.dryrun({
                process,
                tags: [{ name: 'Action', value: 'GetOwnedCards' }],
                data: JSON.stringify({
                    owner: addressToUse,
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log('Get Owned Cards - Dry Run Result:', dryRunResult);

            // Check for errors first
            if (dryRunResult.Error) {
                console.error('AO Process Error:', dryRunResult.Error);
                setErrorResult(dryRunResult.Error);
                return;
            }

            if (dryRunResult.Messages && dryRunResult.Messages[0]?.Data) {
                const parsedData = JSON.parse(dryRunResult.Messages[0].Data);
                setOwnedCardsResult(parsedData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCardsLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-start justify-between gap-2">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1">
                    Process ID:&nbsp;
                    <Input
                        type="text"
                        placeholder="AO Process ID"
                        value={process}
                        onChange={(e) => setProcess(e.target.value)}
                        className="w-80"
                    />
                </div>
            </div>

            <div className="flex w-full flex-col gap-4 border-t pt-4">
                <h3 className="text-lg font-bold">Get Owned Assets</h3>

                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-1">
                        Owner Address:&nbsp;
                        <Input
                            type="text"
                            placeholder={
                                connected
                                    ? 'Connected wallet will be used if empty'
                                    : 'Enter wallet address'
                            }
                            value={ownerAddress}
                            onChange={(e) => setOwnerAddress(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                {connected && (
                    <div className="text-sm text-gray-600">
                        Wallet connected
                        {!ownerAddress &&
                            ' (will be used if no address entered above)'}
                    </div>
                )}

                <div className="flex w-full items-center justify-between gap-2">
                    <Button
                        onClick={getOwnedPacks}
                        disabled={
                            !process ||
                            (!ownerAddress && !connected) ||
                            packsLoading
                        }
                    >
                        {packsLoading
                            ? 'Loading...'
                            : 'Get Owned Packs (Dry Run)'}
                    </Button>
                    <Button
                        onClick={getOwnedCards}
                        disabled={
                            !process ||
                            (!ownerAddress && !connected) ||
                            cardsLoading
                        }
                    >
                        {cardsLoading
                            ? 'Loading...'
                            : 'Get Owned Cards (Dry Run)'}
                    </Button>
                </div>
            </div>

            {errorResult && (
                <div className="w-full">
                    <h4 className="text-md mb-2 font-semibold text-red-600">
                        Error:
                    </h4>
                    <pre className="overflow-auto rounded bg-red-50 p-2 text-red-800">
                        {errorResult}
                    </pre>
                </div>
            )}

            {ownedPacksResult && (
                <div className="w-full">
                    <h4 className="text-md mb-2 font-semibold">
                        Owned Packs Result:
                    </h4>
                    <pre className="overflow-auto rounded bg-gray-100 p-2 text-black">
                        {JSON.stringify(ownedPacksResult, null, 2)}
                    </pre>
                </div>
            )}

            {ownedCardsResult && (
                <div className="w-full">
                    <h4 className="text-md mb-2 font-semibold">
                        Owned Cards Result:
                    </h4>
                    <pre className="overflow-auto rounded bg-gray-100 p-2 text-black">
                        {JSON.stringify(ownedCardsResult, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
