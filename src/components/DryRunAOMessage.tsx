import { useApi } from '../utils/awk';
import { useArweave } from '../hooks/useArweave';
import { useState } from 'react';
import { isValidAddress, type Message } from '../utils/arweaveUtils';
import { Button } from './Button';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { JsonInput } from './JsonInput';
import { DryRunResult, emptyDryRunResult } from './DryRunResult';

export function DryRunAOMessage() {
    const api = useApi();
    const { arweave, ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [aoMessage, setAOMessage] = useState<Message | null>(null);
    const [dryRunResult, setDryRunResult] = useState(emptyDryRunResult);

    const validateInputs = async () => {
        if (!aoMessage) return false;
        if (!aoMessage.process || !isValidAddress(aoMessage.process)) {
            console.error(`Process address is invalid`);
            return false;
        }
        return true;
    };

    const dryRunAOMessage = async () => {
        if (!arweave || !api) return;
        if (!validateInputs() || !aoMessage) return;
        setLoading(true);
        try {
            const msgId = await ao?.dryrun({
                ...aoMessage,
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | DryRunResult: ');
            console.log(msgId);
            setDryRunResult(msgId);
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
            <Button onClick={dryRunAOMessage} disabled={!aoMessage || loading}>
                Send
            </Button>
            {(dryRunResult.error ||
                dryRunResult.Error ||
                dryRunResult.Messages.length) && (
                <DryRunResult dryRunResult={dryRunResult} />
            )}
        </div>
    );
}
