import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useApi } from 'arweave-wallet-kit';
import { useArweave } from '../hooks/useArweave';
import { useState } from 'react';
import { isValidAddress } from '../utils/arweaveUtils';
import { Button } from './Button';
import { emptyTxResult, TxResult } from './TxResult';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { JsonInput } from './JsonInput';
export function SendAOMessage() {
    const api = useApi();
    const { arweave, ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [aoMessage, setAOMessage] = useState(null);
    const [txResult, setTxResult] = useState(emptyTxResult);
    const validateInputs = async () => {
        if (!aoMessage)
            return false;
        if (!aoMessage.process || !isValidAddress(aoMessage.process)) {
            console.error(`Process address is invalid`);
            return false;
        }
        return true;
    };
    const sendAOMessage = async () => {
        if (!arweave || !api)
            return;
        if (!validateInputs() || !aoMessage)
            return;
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
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "flex w-full flex-col items-start justify-between gap-2", children: ["Message:\u00A0", _jsx("div", { className: "flex items-center gap-1", children: _jsx(JsonInput, { setMessage: setAOMessage }) }), _jsx(Button, { onClick: sendAOMessage, disabled: !aoMessage || loading, children: "Send" }), txResult.status && (_jsx(TxResult, { txResult: { ...txResult, aoResult: true } }))] }));
}
