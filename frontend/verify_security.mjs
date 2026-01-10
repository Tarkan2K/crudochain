import nacl from 'tweetnacl';
import fetch from 'node-fetch';

// Helper to convert Uint8Array to Hex String
const toHex = (uint8Array) =>
    Array.from(uint8Array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

// Helper to convert Hex String to Uint8Array
const fromHex = (hexString) =>
    new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const signMessage = (message, privateKeyHex) => {
    const privateKey = fromHex(privateKeyHex);
    const messageBytes = new Uint8Array(Buffer.from(message));
    console.log("Message bytes length:", messageBytes.length);
    console.log("Private key length:", privateKey.length);
    const signature = nacl.sign.detached(messageBytes, privateKey);
    return toHex(signature);
};

async function run() {
    // 1. Generate Keys
    const keyPair = nacl.sign.keyPair();
    const publicKey = toHex(keyPair.publicKey);
    const privateKey = toHex(keyPair.secretKey);

    console.log("Generated Wallet:");
    console.log("Public:", publicKey);
    console.log("Private:", privateKey);

    // 2. Prepare Transaction
    const toAddress = publicKey; // Send to self
    const amount = 50;
    const message = publicKey + toAddress + amount.toString();

    // 3. Sign
    const signature = signMessage(message, privateKey);
    console.log("Signature:", signature);

    // 4. Send
    const payload = {
        from: publicKey,
        to: toAddress,
        amount: amount,
        signature: signature
    };

    try {
        const res = await fetch('http://127.0.0.1:18080/mine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            console.log("SUCCESS! Block mined:", data);
        } else {
            console.log("FAILED! Status:", res.status);
            const text = await res.text();
            console.log("Response:", text);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
