import { useApi } from '../utils/awk';
import { useArweave } from '../hooks/useArweave';
import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface SignMessageOptions {
    hashAlgorithm?: "SHA-256" | "SHA-384" | "SHA-512";
  }

type SignMessageInterface = {
    signMessage: (data: ArrayBuffer, options?: SignMessageOptions) => Promise<Uint8Array>;
    verifyMessage: (data: ArrayBuffer, signature: ArrayBuffer | string, publicKey?: string, options?:SignMessageOptions) => Promise<boolean>;
}

export function SignMessage() {
    const api = useApi();
    const { arweave } = useArweave();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('This is the message to sign.');
    const [signedMsg, setSignedMsg] = useState('');
    const [verifiedMsg, setVerifiedMsg] = useState<boolean | undefined>();

    const signMessage = async () => {
        if (!message || !arweave || !api) return;
        setLoading(true);
        try {
            const data = new TextEncoder().encode(message);
            const aw = window.arweaveWallet as typeof window.arweaveWallet & SignMessageInterface;
            if (!aw.signMessage) {
                console.error('signMessage not implemented');
                return;
            }

            const signedMessage = await aw.signMessage(data);

            const b64SignedMessageResult = btoa(
                String.fromCharCode(...signedMessage)
            );
            setSignedMsg(b64SignedMessageResult);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    function b64ToUint8Array(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const byteNumbers = new Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            byteNumbers[i] = binaryString.charCodeAt(i);
        }

        return new Uint8Array(byteNumbers);
    }

    const verify = async () => {
        if (!signedMsg || !arweave || !api) return;
        setLoading(true);
        try {
            const data = new TextEncoder().encode(message);
            const signature = b64ToUint8Array(signedMsg);
            const aw = window.arweaveWallet as typeof window.arweaveWallet & SignMessageInterface;
            if (!aw.verifyMessage) {
                console.error('Decrypt not implemented');
                return;
            }
            setVerifiedMsg(await aw.verifyMessage(data, signature));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-start justify-between gap-2">
            <div className="flex w-full items-center justify-start gap-1">
                <span className="w-28">Message:</span>
                <Input
                    type="text"
                    placeholder="Enter your message to sign!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full"
                />
                <Button onClick={signMessage} disabled={!message || loading}>
                    Sign Message
                </Button>
            </div>
            <div className="flex w-full items-center justify-start gap-1">
                <span className="w-28">Signed Message:</span>
                <Input
                    type="text"
                    placeholder="Enter your encrypted message!"
                    value={signedMsg}
                    onChange={(e) => setSignedMsg(e.target.value)}
                    className="w-full"
                />
                <Button onClick={verify} disabled={!message || !signedMsg || loading}>
                    Verify Message
                </Button>
            </div>
            <div className="flex w-full items-center justify-center py-2 text-xl">
                {!signedMsg ?
                (
                        ""
                ) : (
                        `Verification result:
                        ${verifiedMsg === undefined ? (
                            "❔"
                        ) : verifiedMsg ? (
                            "✅"
                        ) : (
                            "❌"
                        )}`
                    )}
            </div>
        </div>
    );
}
