import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { emptyTxResult, TxResult } from './TxResult';
import { emptyDryRunResult, DryRunResult } from './DryRunResult';
import {
    message,
    createDataItemSigner,
    result,
    dryrun,
} from '@permaweb/aoconnect';
import { useArweave } from '../hooks/useArweave';

export function UpshotCards() {
    const { ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [process, setProcess] = useState(
        'bAtS9pAgHBghwg7frBYwy7E4bz2lOjcBw-XN9cqSung'
    );
    const [txResult, setTxResult] = useState(emptyTxResult);
    const [messageResult, setMessageResult] = useState<any>(null);
    const [listCardsResult, setListCardsResult] = useState<any>(null);
    const [showCreateCard, setShowCreateCard] = useState(false);
    const [cardName, setCardName] = useState('');
    const [cardRarity, setCardRarity] = useState('common');
    const [cardOutcomeId, setCardOutcomeId] = useState('');
    const [cardImage, setCardImage] = useState('');
    const [cardDescription, setCardDescription] = useState('');
    const [cardMaxSupply, setCardMaxSupply] = useState('');
    const [cardNeverReduceSupply, setCardNeverReduceSupply] = useState(false);
    const [filterCardId, setFilterCardId] = useState('');

    const readResult = async () => {
        if (!txResult.txId || !process) return;
        try {
            const { Messages, Spawns, Output, Error } = await result({
                message: txResult.txId,
                process: process,
            });
            setMessageResult({ Messages, Spawns, Output, Error });
            console.log('Message Result:', { Messages, Spawns, Output, Error });
        } catch (err) {
            console.error(err);
        }
    };

    const readListCards = async () => {
        if (!process) return;
        setLoading(true);
        try {
            const filters: any = {};
            if (filterCardId) {
                filters.id = parseInt(filterCardId);
            }

            const dryRunResult = await ao?.dryrun({
                process,
                tags: [{ name: 'Action', value: 'ListCards' }],
                data: JSON.stringify({
                    filters,
                    page: 1,
                    pageSize: 10,
                    sortBy: '-id',
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log('Dry Run Result:', dryRunResult);

            if (dryRunResult.Messages && dryRunResult.Messages[0]?.Data) {
                const parsedData = JSON.parse(dryRunResult.Messages[0].Data);
                setListCardsResult(parsedData.cards);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createCard = async () => {
        if (!process || !cardName || !cardOutcomeId || !cardDescription) return;
        setLoading(true);
        try {
            const msgId = await ao?.message({
                process,
                tags: [{ name: 'Action', value: 'CreateCard' }],
                data: JSON.stringify({
                    card_name: cardName,
                    rarity: cardRarity,
                    outcome_id: parseInt(cardOutcomeId),
                    image: cardImage || '',
                    description: cardDescription,
                    max_supply: cardMaxSupply
                        ? parseInt(cardMaxSupply)
                        : undefined,
                    never_reduce_supply: cardNeverReduceSupply,
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Create Card Message Id: ', msgId);
            setTxResult({
                txId: msgId,
                status: `200`,
                statusMsg: `OK`,
            });
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
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Create Card</h3>
                    <Button onClick={() => setShowCreateCard(!showCreateCard)}>
                        {showCreateCard ? 'Hide' : 'Show'}
                    </Button>
                </div>
                {showCreateCard && (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Card Name:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Card Name"
                                    value={cardName}
                                    onChange={(e) =>
                                        setCardName(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Rarity:&nbsp;
                                <select
                                    value={cardRarity}
                                    onChange={(e) =>
                                        setCardRarity(e.target.value)
                                    }
                                    className="rounded border bg-white p-2 text-black"
                                >
                                    <option value="common">Common</option>
                                    <option value="uncommon">Uncommon</option>
                                    <option value="rare">Rare</option>
                                    <option value="legendary">Legendary</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Outcome ID:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Outcome ID"
                                    value={cardOutcomeId}
                                    onChange={(e) =>
                                        setCardOutcomeId(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Image Hash:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Arweave Image Hash"
                                    value={cardImage}
                                    onChange={(e) =>
                                        setCardImage(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Description:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Card Description"
                                    value={cardDescription}
                                    onChange={(e) =>
                                        setCardDescription(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Max Supply:&nbsp;
                                <Input
                                    type="number"
                                    placeholder="Max Supply"
                                    value={cardMaxSupply}
                                    onChange={(e) =>
                                        setCardMaxSupply(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Never Reduce Supply:&nbsp;
                                <input
                                    type="checkbox"
                                    checked={cardNeverReduceSupply}
                                    onChange={(e) =>
                                        setCardNeverReduceSupply(
                                            e.target.checked
                                        )
                                    }
                                    className="rounded border bg-white p-2"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <Button
                                onClick={createCard}
                                disabled={
                                    !process ||
                                    !cardName ||
                                    !cardOutcomeId ||
                                    !cardDescription ||
                                    loading
                                }
                            >
                                Create Card
                            </Button>
                        </div>
                    </>
                )}
            </div>
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Filter by Card ID"
                        value={filterCardId}
                        onChange={(e) => setFilterCardId(e.target.value)}
                        className="w-40"
                    />
                    <Button
                        onClick={readListCards}
                        disabled={!process || loading}
                    >
                        List Cards (Dry Run)
                    </Button>
                </div>
            </div>
            {listCardsResult && (
                <pre className="rounded p-2">
                    {JSON.stringify(listCardsResult, null, 2)}
                </pre>
            )}
            {txResult.status && (
                <div className="flex w-full flex-col gap-2">
                    <TxResult txResult={{ ...txResult, aoResult: true }} />
                    <Button
                        onClick={readResult}
                        disabled={!txResult.txId || loading}
                    >
                        Read Result
                    </Button>
                    {messageResult && (
                        <pre className="rounded p-2">
                            {JSON.stringify(messageResult, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}
