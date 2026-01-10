import nacl from 'tweetnacl';
import { encodeUTF8 } from 'tweetnacl-util';

// Helper to convert Uint8Array to Hex String
const toHex = (uint8Array: Uint8Array): string =>
    Array.from(uint8Array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

// Helper to convert Hex String to Uint8Array
const fromHex = (hexString: string): Uint8Array =>
    new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

export const generateKeyPair = () => {
    const keyPair = nacl.sign.keyPair();
    return {
        publicKey: toHex(keyPair.publicKey),
        privateKey: toHex(keyPair.secretKey),
    };
};

export const signMessage = (message: string, privateKeyHex: string): string => {
    const privateKey = fromHex(privateKeyHex);
    // @ts-ignore
    const messageBytes = encodeUTF8(message);
    // @ts-ignore
    const signature = nacl.sign.detached(messageBytes, privateKey);
    return toHex(signature);
};

export const verifySignature = (message: string, signatureHex: string, publicKeyHex: string): boolean => {
    try {
        const signature = fromHex(signatureHex);
        const publicKey = fromHex(publicKeyHex);
        // @ts-ignore
        const messageBytes = encodeUTF8(message);
        // @ts-ignore
        return nacl.sign.detached.verify(messageBytes, signature, publicKey);
    } catch (e) {
        return false;
    }
};
