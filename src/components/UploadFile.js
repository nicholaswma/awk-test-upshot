import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useApi } from 'arweave-wallet-kit';
import { useArweave } from '../hooks/useArweave';
import { Button } from './Button';
import { TxResult, emptyTxResult } from './TxResult';
export function UploadFile() {
    const [file, setFile] = useState(null);
    const api = useApi();
    const { arweave } = useArweave();
    const fileInputRef = useRef(null);
    const [txResult, setTxResult] = useState(emptyTxResult);
    const handleChangeFile = (event) => {
        setFile(!event.target.files
            ? null
            : !event.target.files[0]
                ? null
                : event.target.files[0]);
    };
    const createTxWithFile = async () => {
        if (!file)
            return;
        const tx = await arweave.createTransaction({
            data: new Uint8Array(await file.arrayBuffer()),
        });
        tx.addTag('Content-Type', file.type);
        tx.addTag('File-Name', file.name);
        return tx;
    };
    const uploadFile = async (dispatch = true) => {
        if (!file || !arweave || !api)
            return;
        const tx = await createTxWithFile();
        if (!tx)
            return;
        let signedTx, postResult;
        if (!dispatch) {
            signedTx = await api.sign(tx);
            postResult = await arweave.transactions.post(signedTx);
            setTxResult({
                txId: signedTx.id,
                status: `${postResult.status}`,
                statusMsg: postResult.statusText,
            });
        }
        else {
            postResult = await api.dispatch(tx);
            setTxResult({
                txId: postResult.id,
                status: `200`,
                statusMsg: `ok`,
            });
        }
        console.log(' | Signed Tx: ', signedTx);
        console.log(' | Post Result: ', postResult);
    };
    return (_jsxs("div", { className: "justify-betweengap-2 flex w-full flex-col items-start", children: [_jsxs("div", { className: "-mt-2 flex w-full items-center justify-between space-y-2", children: [_jsx("input", { className: "mt-2", type: "file", ref: fileInputRef, onChange: handleChangeFile }), _jsxs("div", { className: "inline-flex", children: [_jsx(Button, { onClick: () => uploadFile(false), disabled: !api, children: "Sign & Post" }), _jsx(Button, { className: "ml-2", onClick: () => uploadFile(true), disabled: !api, children: "Dispatch" })] })] }), txResult.status && _jsx(TxResult, { txResult: txResult })] }));
}
