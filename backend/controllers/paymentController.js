const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const User = require('../models/User');

// Configure MercadoPago
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

// @desc    Create payment preference
// @route   POST /api/payment/create_preference
// @access  Private (usually)
exports.createPreference = async (req, res) => {
    try {
        const { title, price, quantity, userId } = req.body;

        if (!title || !price || !quantity || !userId) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        title: title,
                        unit_price: Number(price),
                        quantity: Number(quantity),
                    }
                ],
                metadata: {
                    user_id: userId,
                    quantity: Number(quantity) // Amount of CRDO to give
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/payment/success`,
                    failure: `${process.env.FRONTEND_URL}/payment/failure`,
                    pending: `${process.env.FRONTEND_URL}/payment/pending`
                },
                auto_return: "approved",
            }
        });

        res.json({
            id: result.id,
            init_point: result.init_point
        });

    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({ message: 'Error al crear preferencia de pago' });
    }
};

// @desc    Handle MercadoPago Webhook
// @route   POST /api/payment/webhook
// @access  Public (MP calls this)
exports.webhook = async (req, res) => {
    try {
        const { topic, id } = req.query;

        if (topic === 'payment') {
            const paymentClient = new Payment(client);
            const payment = await paymentClient.get({ id });

            const { status, metadata } = payment;

            if (status === 'approved') {
                const userId = metadata.user_id;
                const quantity = metadata.quantity;

                if (userId && quantity) {
                    const user = await User.findById(userId);
                    if (user) {
                        user.balance += Number(quantity);
                        await user.save();
                        console.log(`Pago aprobado. Usuario ${userId} recibió ${quantity} CRDO.`);
                    } else {
                        console.error(`Usuario ${userId} no encontrado para acreditar pago.`);
                    }
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
};
