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
        required: true,
        unique: true,
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
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
