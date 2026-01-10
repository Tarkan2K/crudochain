import nacl from 'tweetnacl';

// Helper to convert Uint8Array to Hex String
const toHex = (uint8Array) =>
    Array.from(uint8Array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

const keyPair = nacl.sign.keyPair();
console.log("ADMIN_PUBLIC_KEY:", toHex(keyPair.publicKey));
console.log("ADMIN_PRIVATE_KEY:", toHex(keyPair.secretKey));
