import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
    ticker: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    imageUrl: String,
    creator: String,
    currentSupply: { type: Number, default: 0 },
    marketCap: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Token || mongoose.model('Token', TokenSchema);
