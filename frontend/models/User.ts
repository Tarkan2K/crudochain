import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this user.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email for this user.'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password for this user.'],
    },
    walletAddress: {
        type: String,
        unique: true,
        sparse: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    balance: {
        type: Number,
        default: 0,
    },
    isFounder: {
        type: Boolean,
        default: false,
    },
    character: {
        skinColor: { type: String, default: '#FCD5B5' },
        hairStyle: { type: Number, default: 0 },
    },
    gameData: {
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
        },
        inventory: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            icon: { type: String, required: true },
            count: { type: Number, default: 1 },
        }],
        cavern: {
            unlocked: { type: Boolean, default: false },
            decorations: [{
                id: { type: String, required: true },
                x: { type: Number, required: true },
                y: { type: Number, required: true },
            }],
        },
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
