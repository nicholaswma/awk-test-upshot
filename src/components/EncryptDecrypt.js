import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useApi } from 'arweave-wallet-kit';
import { useArweave } from '../hooks/useArweave';
import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
// const algorithms = ['RSA-OAEP', 'AES-CBC', 'AES-CTR', 'AES-GCM'];
export function EncryptDecrypt() {
    const api = useApi();
    const { arweave } = useArweave();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('This is a secret message!');
    const [encryptedMsg, setEncryptedMsg] = useState('');
    const [decryptedMsg, setDecryptedMsg] = useState('');
    const [algorithm] = useState('RSA-OAEP');
    const encrypt = async () => {
        if (!message || !arweave || !api)
            return;
        setLoading(true);
        try {
            const data = new TextEncoder().encode(message);
            const encryptResult = await api.encrypt(data, {
                name: algorithm,
            });
            const b64EnscryptResult = btoa(String.fromCharCode(...encryptResult));
            setEncryptedMsg(b64EnscryptResult);
            // setEncryptedMsg(String.fromCharCode(...encryptResult));
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    function b64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const byteNumbers = new Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            byteNumbers[i] = binaryString.charCodeAt(i);
        }
        return new Uint8Array(byteNumbers);
    }
    const decrypt = async () => {
        if (!encryptedMsg || !arweave || !api)
            return;
        setLoading(true);
        try {
            const data = b64ToUint8Array(encryptedMsg);
            const decryptResult = await api.decrypt(data, { name: algorithm });
            setDecryptedMsg(String.fromCharCode(...decryptResult));
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    // const algorithmChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => {
    //     if (!event.target.value) return;
    //     const algo = algorithms.find(
    //         (a) => a === event.target.value
    //     ) as Algorithm;
    //     setAlgorithm(algo ? algo : 'RSA-OAEP');
    // };
    return (_jsxs("div", { className: "flex w-full flex-col items-start justify-between gap-2", children: [_jsxs("div", { className: "flex w-full items-center justify-start gap-1", children: [_jsx("span", { className: "w-28", children: "Message:" }), _jsx(Input, { type: "text", placeholder: "Enter your secret message!", value: message, onChange: (e) => setMessage(e.target.value), className: "w-full" }), _jsx(Button, { onClick: encrypt, disabled: !message || loading, children: "Encrypt" })] }), _jsxs("div", { className: "flex w-full items-center justify-start gap-1", children: [_jsx("span", { className: "w-28", children: "Encrypted:" }), _jsx(Input, { type: "text", placeholder: "Enter your encrypted message!", value: encryptedMsg, onChange: (e) => setEncryptedMsg(e.target.value), className: "w-full" }), _jsx(Button, { onClick: decrypt, disabled: !message || loading, children: "Decrypt" })] }), decryptedMsg && (_jsxs("div", { className: "flex w-full items-center justify-start gap-1", children: [_jsx("span", { className: "w-20 py-2", children: "Decrypted:" }), _jsx("span", { className: "font-bold" }), decryptedMsg] }))] }));
}
