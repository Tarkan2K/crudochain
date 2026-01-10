import { NextResponse } from 'next/server';
import MercadoPagoConfig, { Preference } from 'mercadopago';
import dbConnect from '@/lib/mongodb'; // Assuming this exists, based on User.ts usage
import User from '@/models/User';

// Initialize Mercado Pago
// NOTE: In production, use process.env.MERCADOPAGO_ACCESS_TOKEN
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
    try {
        console.log("💰 MercadoPago: Creating preference...");
        const body = await req.json();
        console.log("📦 Request Body:", body);
        const { userId, email } = body;

        if (!userId && !email) {
            console.error("❌ Missing userId or email");
            return NextResponse.json({ error: 'User ID or Email is required' }, { status: 400 });
        }

        let mongoUserId = userId;

        // If email is provided, try to find the User ID from DB Service
        if (email) {
            try {
                console.log(`🔍 Looking up user ${email} in DB...`);
                await dbConnect();
                const user = await User.findOne({ email });
                if (user) {
                    console.log("✅ User found in DB:", user._id);
                    mongoUserId = user._id.toString();
                } else {
                    console.warn(`⚠️ User with email ${email} not found in DB.`);
                }
            } catch (e) {
                console.error("❌ Failed to lookup user in DB", e);
            }
        }

        const preference = new Preference(client);

        console.log("💳 Creating preference object...");
        const preferenceData = {
            body: {
                items: [
                    {
                        id: 'pack-fundador',
                        title: 'Pack Fundador - 1000 CRDO',
                        quantity: 1,
                        unit_price: 1000,
                        currency_id: 'CLP',
                    },
                ],
                metadata: {
                    user_id: mongoUserId,
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?payment=success`,
                    failure: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?payment=failure`,
                    pending: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?payment=pending`,
                }
            }
        };

        console.log("💳 Preference Payload:", JSON.stringify(preferenceData, null, 2));
        const result = await preference.create(preferenceData);

        console.log("✅ Preference created:", result.init_point);
        return NextResponse.json({ init_point: result.init_point });
    } catch (error: any) {
        console.error('❌ Mercado Pago Error:', error);
        return NextResponse.json({ error: 'Error creating preference', details: error.message }, { status: 500 });
    }
}
