const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    balance: {
        type: Number,
        default: 0
    },
    character: {
        skinColor: { type: String, default: '#ffdbac' },
        hairStyle: { type: String, default: 'normal' }
    },
    gameData: {
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        position: {
            x: { type: Number, default: 20 },
            y: { type: Number, default: 20 }
        },
        inventory: [{
            id: String,
            name: String,
            icon: String,
            count: Number
        }],
        cavern: {
            unlocked: { type: Boolean, default: false },
            decorations: [{
                id: String,
                x: Number,
                y: Number
            }]
        }
    },
    era: {
        type: Number,
        default: 1 // 1=Cavernícola, 2=Ciudad, 3=Futuro
    }
}, {
    timestamps: true
});

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
