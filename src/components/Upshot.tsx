import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { emptyTxResult, TxResult } from './TxResult';
import { message, createDataItemSigner, result } from '@permaweb/aoconnect';

export function Upshot() {
    const [loading, setLoading] = useState(false);
    const [process, setProcess] = useState(
        'O3BjWD5CooXZep0B1guc4nDLcPQkfsgUCA08THnXUwQ'
    );
    const [categoryName, setCategoryName] = useState('');
    const [txResult, setTxResult] = useState(emptyTxResult);
    const [messageResult, setMessageResult] = useState<any>(null);

    const sendAOMessage = async () => {
        if (!process || !categoryName) return;
        setLoading(true);
        try {
            const msgId = await message({
                process,
                tags: [{ name: 'Action', value: 'CreateCategory' }],
                data: JSON.stringify({
                    categoryName: categoryName,
                    status: 'active',
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Message Id: ', msgId);
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
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1">
                    Category Name:&nbsp;
                    <Input
                        type="text"
                        placeholder="Category Name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Button
                    onClick={sendAOMessage}
                    disabled={!process || !categoryName || loading}
                >
                    Create Category
                </Button>
            </div>
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
