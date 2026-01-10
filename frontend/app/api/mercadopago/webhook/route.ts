import { NextResponse } from 'next/server';
import MercadoPagoConfig, { Payment } from 'mercadopago';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, data } = body;

        if (type === 'payment') {
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: data.id });

            if (paymentData.status === 'approved') {
                const userId = paymentData.metadata.user_id;

                if (userId) {
                    await dbConnect();
                    // Credit 1000 CRDO and set isFounder
                    await User.findByIdAndUpdate(userId, {
                        $inc: { crdoBalance: 1000 },
                        $set: { isFounder: true }
                    });
                    console.log(`Credited 1000 CRDO to user ${userId}`);
                }
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
