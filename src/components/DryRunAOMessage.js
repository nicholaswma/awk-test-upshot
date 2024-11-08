import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useApi } from 'arweave-wallet-kit';
import { useArweave } from '../hooks/useArweave';
import { useState } from 'react';
import { isValidAddress } from '../utils/arweaveUtils';
import { Button } from './Button';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { JsonInput } from './JsonInput';
import { DryRunResult, emptyDryRunResult } from './DryRunResult';
export function DryRunAOMessage() {
    const api = useApi();
    const { arweave, ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [aoMessage, setAOMessage] = useState(null);
    const [dryRunResult, setDryRunResult] = useState(emptyDryRunResult);
    const validateInputs = async () => {
        if (!aoMessage)
            return false;
        if (!aoMessage.process || !isValidAddress(aoMessage.process)) {
            console.error(`Process address is invalid`);
            return false;
        }
        return true;
    };
    const dryRunAOMessage = async () => {
        if (!arweave || !api)
            return;
        if (!validateInputs() || !aoMessage)
            return;
        setLoading(true);
        try {
            const msgId = await ao?.dryrun({
                ...aoMessage,
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | DryRunResult: ');
            console.log(msgId);
            setDryRunResult(msgId);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "flex w-full flex-col items-start justify-between gap-2", children: ["Message:\u00A0", _jsx("div", { className: "flex items-center gap-1", children: _jsx(JsonInput, { setMessage: setAOMessage }) }), _jsx(Button, { onClick: dryRunAOMessage, disabled: !aoMessage || loading, children: "Send" }), (dryRunResult.error ||
                dryRunResult.Error ||
                dryRunResult.Messages.length) && (_jsx(DryRunResult, { dryRunResult: dryRunResult }))] }));
}
