import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { emptyTxResult, TxResult } from './TxResult';
import { emptyDryRunResult, DryRunResult } from './DryRunResult';
import {
    message,
    createDataItemSigner,
    result,
    dryrun
} from '@permaweb/aoconnect';

export function UpshotPacks() {
    const [loading, setLoading] = useState(false);
    const [process, setProcess] = useState(
        'bAtS9pAgHBghwg7frBYwy7E4bz2lOjcBw-XN9cqSung'
    );
    const [txResult, setTxResult] = useState(emptyTxResult);
    const [messageResult, setMessageResult] = useState<any>(null);
    const [listPacksResult, setListPacksResult] = useState<any>(null);
    const [showCreatePack, setShowCreatePack] = useState(false);
    const [packName, setPackName] = useState('');
    const [packImage, setPackImage] = useState('');
    const [packDescription, setPackDescription] = useState('');
    const [packStatus, setPackStatus] = useState('active');
    const [packCategoryIds, setPackCategoryIds] = useState('');
    const [packEventIds, setPackEventIds] = useState('');

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

    const readListPacks = async () => {
        if (!process) return;
        setLoading(true);
        try {
            // Use dryrun instead of sending a message
            const dryRunResult = await dryrun({
                process,
                tags: [{ name: 'Action', value: 'ListPacks' }],
                data: JSON.stringify({}),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            
            console.log('Dry Run Result:', dryRunResult);
            
            // Extract packs from the dry run result
            if (dryRunResult.Messages && dryRunResult.Messages[0]?.Data) {
                const parsedData = JSON.parse(dryRunResult.Messages[0].Data);
                setListPacksResult(parsedData.packs);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createPack = async () => {
        if (!process || !packName) return;
        setLoading(true);
        try {
            const msgId = await message({
                process,
                tags: [{ name: 'Action', value: 'CreatePack' }],
                data: JSON.stringify({
                    pack_name: packName,
                    image: packImage || '',
                    description: packDescription || '',
                    status: packStatus,
                    category_ids: packCategoryIds
                        ? packCategoryIds
                              .split(',')
                              .map((id) => parseInt(id.trim()))
                        : [],
                    eventIds: packEventIds
                        ? packEventIds
                              .split(',')
                              .map((id) => parseInt(id.trim()))
                        : [],
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Create Pack Message Id: ', msgId);
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
                    <h3 className="text-lg font-bold">Create Pack</h3>
                    <Button onClick={() => setShowCreatePack(!showCreatePack)}>
                        {showCreatePack ? 'Hide' : 'Show'}
                    </Button>
                </div>
                {showCreatePack && (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Pack Name:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Pack Name"
                                    value={packName}
                                    onChange={(e) =>
                                        setPackName(e.target.value)
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
                                    value={packImage}
                                    onChange={(e) =>
                                        setPackImage(e.target.value)
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
                                    placeholder="Pack Description"
                                    value={packDescription}
                                    onChange={(e) =>
                                        setPackDescription(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Status:&nbsp;
                                <select
                                    value={packStatus}
                                    onChange={(e) =>
                                        setPackStatus(e.target.value)
                                    }
                                    className="rounded border bg-white p-2 text-black"
                                >
                                    <option value="active">Active</option>
                                    <option value="coming soon">
                                        Coming Soon
                                    </option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Category IDs:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="1,2,3"
                                    value={packCategoryIds}
                                    onChange={(e) =>
                                        setPackCategoryIds(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Event IDs:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="1,2,3"
                                    value={packEventIds}
                                    onChange={(e) =>
                                        setPackEventIds(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <Button
                                onClick={createPack}
                                disabled={!process || !packName || loading}
                            >
                                Create Pack
                            </Button>
                        </div>
                    </>
                )}
            </div>
            <div className="flex w-full items-center justify-between">
                <Button onClick={readListPacks} disabled={!process || loading}>
                    List Packs (Dry Run)
                </Button>
            </div>
            {listPacksResult && (
                <pre className="rounded p-2">
                    {JSON.stringify(listPacksResult, null, 2)}
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