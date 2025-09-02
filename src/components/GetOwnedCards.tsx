import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { emptyDryRunResult, DryRunResult } from './DryRunResult';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { useArweave } from '../hooks/useArweave';

const rarityFilters = [
    { label: 'All Rarities', value: 'all' },
    { label: 'Common', value: 'common' },
    { label: 'Uncommon', value: 'uncommon' },
    { label: 'Rare', value: 'rare' },
    { label: 'Legendary', value: 'legendary' },
];

const statusFilters = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'resolved' },
];

export function GetOwnedCards() {
    const { ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [process, setProcess] = useState(
        'bAtS9pAgHBghwg7frBYwy7E4bz2lOjcBw-XN9cqSung'
    );
    const [dryRunResult, setDryRunResult] = useState(emptyDryRunResult);
    const [parsedCards, setParsedCards] = useState<any[]>([]);

    // Filter states
    const [owner, setOwner] = useState('');
    const [cardId, setCardId] = useState('');
    const [eventStatus, setEventStatus] = useState('all');
    const [rarity, setRarity] = useState('all');
    const [category, setCategory] = useState('');
    const [isClaimed, setIsClaimed] = useState('all');
    const [isWinning, setIsWinning] = useState('all');

    const getOwnedCards = async () => {
        if (!process) return;
        setLoading(true);
        try {
            const filters: any = {};

            // Build filters object based on form inputs
            if (cardId) filters.cardId = parseInt(cardId);
            if (eventStatus !== 'all') filters.event_status = eventStatus;
            if (rarity !== 'all') filters.rarity = rarity;
            if (category) filters.category = parseInt(category);
            if (isClaimed !== 'all') filters.is_claimed = isClaimed === 'true';
            if (isWinning !== 'all') filters.is_winning = isWinning === 'true';

            const requestData = {
                // Data: {
                ...(owner && { owner }),
                ...(Object.keys(filters).length > 0 && { filters }),
                // },
                // pageSize: 20,
            };

            const dryRunResult = await ao?.dryrun({
                process,
                tags: [{ name: 'Action', value: 'GetOwnedCards' }],
                data: JSON.stringify(requestData),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log('Dry Run Result:', dryRunResult);

            // Parse and display card data if available
            if (dryRunResult?.Messages?.length > 0) {
                const message = dryRunResult.Messages[0];
                if (message?.Data) {
                    try {
                        const cardData = JSON.parse(message.Data);
                        console.log('Parsed Card Data:', cardData);

                        // Transform data for display
                        const cardsArray = Object.entries(cardData).map(
                            ([cardId, card]: [string, any]) => ({
                                cardId,
                                winning: card.winning,
                                claimedQuantity: parseInt(card.claimedQuantity),
                                unclaimedQuantity: parseInt(
                                    card.unclaimedQuantity
                                ),
                                totalQuantity:
                                    parseInt(card.claimedQuantity) +
                                    parseInt(card.unclaimedQuantity),
                            })
                        );

                        setParsedCards(cardsArray);

                        // Log formatted card information
                        console.table(
                            cardsArray.map((card) => ({
                                'Card ID': card.cardId,
                                Winning: card.winning ? 'Yes' : 'No',
                                Claimed: card.claimedQuantity,
                                Unclaimed: card.unclaimedQuantity,
                                Total: card.totalQuantity,
                            }))
                        );
                    } catch (error) {
                        console.error('Error parsing card data:', error);
                        setParsedCards([]);
                    }
                } else {
                    setParsedCards([]);
                }
            } else {
                setParsedCards([]);
            }

            setDryRunResult(dryRunResult);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
                <h3 className="text-lg font-bold">Get Owned Cards Filters</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-1">
                        Owner (Optional):&nbsp;
                        <Input
                            type="text"
                            placeholder="Wallet Address (defaults to sender)"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        Card ID:&nbsp;
                        <Input
                            type="number"
                            placeholder="Card ID"
                            value={cardId}
                            onChange={(e) => setCardId(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        Event Status:&nbsp;
                        <select
                            value={eventStatus}
                            onChange={(e) => setEventStatus(e.target.value)}
                            className="w-full rounded border bg-white p-2 text-black"
                        >
                            {statusFilters.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        Rarity:&nbsp;
                        <select
                            value={rarity}
                            onChange={(e) => setRarity(e.target.value)}
                            className="w-full rounded border bg-white p-2 text-black"
                        >
                            {rarityFilters.map((rarityOption) => (
                                <option
                                    key={rarityOption.value}
                                    value={rarityOption.value}
                                >
                                    {rarityOption.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        Category:&nbsp;
                        <Input
                            type="number"
                            placeholder="Category ID"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        Is Claimed:&nbsp;
                        <select
                            value={isClaimed}
                            onChange={(e) => setIsClaimed(e.target.value)}
                            className="w-full rounded border bg-white p-2 text-black"
                        >
                            <option value="all">All</option>
                            <option value="true">Claimed</option>
                            <option value="false">Not Claimed</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        Is Winning:&nbsp;
                        <select
                            value={isWinning}
                            onChange={(e) => setIsWinning(e.target.value)}
                            className="w-full rounded border bg-white p-2 text-black"
                        >
                            <option value="all">All</option>
                            <option value="true">Winning</option>
                            <option value="false">Not Winning</option>
                        </select>
                    </div>
                </div>

                <div className="flex w-full items-center justify-between">
                    <Button
                        onClick={getOwnedCards}
                        disabled={!process || loading}
                    >
                        Get Owned Cards (Dry Run)
                    </Button>
                </div>
            </div>

            {(dryRunResult.error ||
                dryRunResult.Error ||
                dryRunResult.Messages.length) && (
                <DryRunResult dryRunResult={dryRunResult} />
            )}
        </div>
    );
}
