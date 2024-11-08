export class BoltMessageSDK {
    // Constructor receives the group of recipient arweave keys owner fields
    constructor(private readonly arweaveOwners: string[]) {}

    // Encrypt a message for all of the participants
    // returns: Encrypted Message + RSA encrypted AES-GCM key for each recipient + iv used for the AES-GCM key
    async encryptMessage(message: string): Promise<EncryptedMessage> {
        // Generate a new AES key to distribute together with the message
        const aesKey = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt']
        );

        // Get random value for the iv parameter in AES-GCM
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Encrypt message
        const messageBuffer = new TextEncoder().encode(message);
        const encryptedMessage = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
                additionalData: new TextEncoder().encode('AES-GCM-MSG'),
            },
            aesKey,
            messageBuffer
        );

        // Export AES key for encryption by caller
        const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);

        // Encrypt AES key for each recipient
        const encryptedKeys = await Promise.all(
            this.arweaveOwners.map(async (owner) => {
                const publicKey = await this.importPublicKey(owner);
                const encryptedKey = await crypto.subtle.encrypt(
                    { name: 'RSA-OAEP' },
                    publicKey,
                    rawAesKey
                );
                return new Uint8Array(encryptedKey);
            })
        );

        return {
            encryptedMessage: new Uint8Array(encryptedMessage),
            encryptedKeys,
            iv,
        };
    }

    // Decrypt a message with an already decrypted AES-GCM key
    async decryptMessageWithKey(
        encrypted: EncryptedMessage,
        aesKey: CryptoKey
    ): Promise<string> {
        // Decrypt the message using the provided AES key
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: encrypted.iv,
                additionalData: new TextEncoder().encode('AES-GCM-MSG'),
            },
            aesKey,
            encrypted.encryptedMessage
        );

        return new TextDecoder().decode(decryptedBuffer);
    }

    // Decrypt an AES-GCM with an Arweave JWK
    private async decryptAESKeyWithJWK(
        encrypted: EncryptedMessage,
        jwk: ArweaveJWK
    ): Promise<CryptoKey> {
        // Find which encrypted key belongs to this JWK
        const keyIndex = this.arweaveOwners.findIndex(
            (owner) => owner === jwk.n
        );
        if (keyIndex === -1) {
            throw new Error(
                'This private key is not authorized to decrypt this message'
            );
        }

        // Import private key
        const privateKey = await this.importPrivateKey(jwk);

        // Decrypt the AES key
        const encryptedAesKey = encrypted.encryptedKeys[keyIndex];
        const aesKeyBuffer = await crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            privateKey,
            encryptedAesKey
        );

        // Import and return the AES key
        return crypto.subtle.importKey(
            'raw',
            aesKeyBuffer,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
    }

    private async decryptAESKeyWithArconnect(
        encrypted: EncryptedMessage
    ): Promise<CryptoKey> {
        // Ensure ArConnect is available
        if (typeof window === 'undefined' || !window.arweaveWallet) {
            throw new Error('ArConnect not available');
        }

        // Get current wallet address
        // const address = await window.arweaveWallet.getActiveAddress();
        // if (!address) {
        //     throw new Error('No active ArConnect wallet');
        // }

        // Get the current public key from arconnect
        const publicKey = await window.arweaveWallet.getActivePublicKey();
        if (!publicKey) {
            throw new Error(
                'No permission to access ArConnect active public key'
            );
        }

        // Find the encrypted key for this wallet
        const keyIndex = this.arweaveOwners.findIndex(
            (owner) => owner === publicKey
        );
        if (keyIndex === -1) {
            throw new Error(
                'Current wallet is not authorized to decrypt this message'
            );
        }

        // Decrypt AES key using ArConnect
        const encryptedAesKey = encrypted.encryptedKeys[keyIndex];
        const decryptedAesKey = await window.arweaveWallet.decrypt(
            encryptedAesKey,
            {
                algorithm: 'RSA-OAEP',
                hash: 'SHA-256',
            }
        );

        // Import and return the AES key
        return crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(decryptedAesKey),
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
    }

    // Decrypt an AES-GCM. Use '' or 'use_wallet' to use Arconnect's decryption
    async decryptAESKey(
        encrypted: EncryptedMessage,
        jwk: ArweaveJWK | string
    ): Promise<CryptoKey> {
        // Check for jwk parameter to see which method to call
        if (typeof jwk === 'string') {
            // Try with Arconnect
            return this.decryptAESKeyWithArconnect(encrypted);
        } else {
            // Try with jwk
            return this.decryptAESKeyWithJWK(encrypted, jwk);
        }
    }

    private async importPublicKey(owner: string): Promise<CryptoKey> {
        const jwk = {
            kty: 'RSA',
            e: 'AQAB',
            n: owner,
            alg: 'RSA-OAEP-256',
            ext: true,
        };

        return crypto.subtle.importKey(
            'jwk',
            jwk,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            false,
            ['encrypt']
        );
    }

    private async importPrivateKey(jwk: ArweaveJWK): Promise<CryptoKey> {
        const fullJwk = {
            ...jwk,
            alg: 'RSA-OAEP-256',
            ext: true,
        };

        return crypto.subtle.importKey(
            'jwk',
            fullJwk,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            false,
            ['decrypt']
        );
    }
}

interface EncryptedMessage {
    encryptedMessage: Uint8Array;
    encryptedKeys: Uint8Array[];
    iv: Uint8Array;
}

interface ArweaveJWK {
    kty: string;
    e: string;
    n: string;
    d?: string;
}

// Add ArConnect type declarations for TypeScript
// declare global {
//     interface Window {
//         arweaveWallet: {
//             getActiveAddress(): Promise<string>;
//             getActivePublicKey(): Promise<string>;
//             decrypt(
//                 data: Uint8Array,
//                 options: {
//                     algorithm: string;
//                     hash: string;
//                 }
//             ): Promise<Uint8Array>;
//         };
//     }
// }
