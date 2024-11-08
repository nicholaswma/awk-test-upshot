import { ChangeEvent, useRef, useState } from 'react';
import { useApi } from 'arweave-wallet-kit';
import { useArweave } from '../hooks/useArweave';
import { Button } from './Button';
import { TxResult, emptyTxResult } from './TxResult';

export function UploadFile() {
    const [file, setFile] = useState<File | null>(null);
    const api = useApi();
    const { arweave } = useArweave();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [txResult, setTxResult] = useState(emptyTxResult);

    const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
        setFile(
            !event.target.files
                ? null
                : !event.target.files[0]
                  ? null
                  : event.target.files[0]
        );
    };

    const createTxWithFile = async () => {
        if (!file) return;
        const tx = await arweave.createTransaction({
            data: new Uint8Array(await file.arrayBuffer()),
        });
        tx.addTag('Content-Type', file.type);
        tx.addTag('File-Name', file.name);
        return tx;
    };

    const uploadFile = async (dispatch = true) => {
        if (!file || !arweave || !api) return;
        const tx = await createTxWithFile();
        if (!tx) return;
        let signedTx, postResult;
        if (!dispatch) {
            signedTx = await api.sign(tx);
            postResult = await arweave.transactions.post(signedTx);
            setTxResult({
                txId: signedTx.id,
                status: `${postResult.status}`,
                statusMsg: postResult.statusText,
            });
        } else {
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

    return (
        <div className="justify-betweengap-2 flex w-full flex-col items-start">
            <div className="-mt-2 flex w-full items-center justify-between space-y-2">
                <input
                    className="mt-2"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleChangeFile}
                />
                <div className="inline-flex">
                    <Button onClick={() => uploadFile(false)} disabled={!api}>
                        Sign & Post
                    </Button>
                    <Button
                        className="ml-2"
                        onClick={() => uploadFile(true)}
                        disabled={!api}
                    >
                        Dispatch
                    </Button>
                </div>
            </div>
            {txResult.status && <TxResult txResult={txResult} />}
        </div>
    );
}
