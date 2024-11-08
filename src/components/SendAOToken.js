import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useApi } from 'arweave-wallet-kit';
import { useArweave } from '../hooks/useArweave';
import { useState } from 'react';
import { createMessage, isValidAddress, tag } from '../utils/arweaveUtils';
import { Button } from './Button';
import { Input } from './Input';
import { emptyTxResult, TxResult } from './TxResult';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { AOTokenInfo } from './AOTokenInfo';
export function SendAOToken() {
    const api = useApi();
    const { arweave, ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState('0');
    const [process, setProcess] = useState('');
    const [target, setTarget] = useState('');
    const [txResult, setTxResult] = useState(emptyTxResult);
    const validateInputs = async () => {
        if (!quantity || !target || !process)
            return false;
        if (!isValidAddress(process)) {
            console.error(`Target address is not a valid Arweave address`);
            return false;
        }
        if (!isValidAddress(target)) {
            console.error(`Target address is not a valid Arweave address`);
            return false;
        }
        if (Number(quantity) <= 0) {
            console.error(`Quantity to send is not valid`);
            return false;
        }
        return true;
    };
    const sendAOToken = async () => {
        if (!arweave || !api || !ao)
            return;
        if (!validateInputs())
            return;
        setLoading(true);
        try {
            const msgId = await ao?.message({
                ...createMessage(process, [
                    tag('Action', 'Transfer'),
                    tag('Quantity', quantity),
                    tag('Recipient', target),
                ]),
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
    return (_jsxs("div", { className: "flex w-full flex-col items-start justify-between gap-2", children: [_jsx("div", { className: "flex w-full items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-1", children: ["Token Address:\u00A0", _jsx(Input, { type: "text", placeholder: "AO Token Address", value: process, onChange: (e) => setProcess(e.target.value), className: "w-80" }), process && _jsx(AOTokenInfo, { process: process })] }) }), _jsxs("div", { className: "flex w-full items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1", children: ["Qty:\u00A0", _jsx(Input, { type: "number", placeholder: "Amount", value: quantity, onChange: (e) => setQuantity(e.target.value), className: "w-40", disabled: !isValidAddress(process) }), "\u00A0To:\u00A0", _jsx(Input, { type: "text", placeholder: "Recipient wallet address", value: target, onChange: (e) => setTarget(e.target.value), className: "w-80", disabled: !isValidAddress(process) })] }), _jsx(Button, { onClick: sendAOToken, disabled: !quantity || !target || !process || loading, children: "Send" })] }), txResult.status && (_jsx(TxResult, { txResult: { ...txResult, aoResult: true } }))] }));
}
