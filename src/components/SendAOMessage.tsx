import { useApi } from '../utils/awk';
import { useArweave } from '../hooks/useArweave';
import { useState } from 'react';
import { isValidAddress, type Message } from '../utils/arweaveUtils';
import { Button } from './Button';
import { emptyTxResult, TxResult } from './TxResult';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { JsonInput } from './JsonInput';

export function SendAOMessage() {
    const api = useApi();
    const { arweave, ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [aoMessage, setAOMessage] = useState<Message | null>(null);
    const [txResult, setTxResult] = useState(emptyTxResult);

    const validateInputs = async () => {
        if (!aoMessage) return false;
        if (!aoMessage.process || !isValidAddress(aoMessage.process)) {
            console.error(`Process address is invalid`);
            return false;
        }
        return true;
    };

    const sendAOMessage = async () => {
        if (!arweave || !api) return;
        if (!validateInputs() || !aoMessage) return;
        setLoading(true);
        try {
            const msgId = await ao?.message({
                ...aoMessage,
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Mesage Id: ', msgId);
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
            Message:&nbsp;
            <div className="flex items-center gap-1">
                <JsonInput setMessage={setAOMessage} />
            </div>
            <Button onClick={sendAOMessage} disabled={!aoMessage || loading}>
                Send
            </Button>
            {txResult.status && (
                <TxResult txResult={{ ...txResult, aoResult: true }} />
            )}
        </div>
    );
}
