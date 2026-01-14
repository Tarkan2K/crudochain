const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor ingrese todos los campos' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Create user
        const user = await User.create({
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                role: user.role,
                balance: user.balance,
                era: user.era,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                balance: user.balance,
                era: user.era,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// @desc    Seed Admin User
// @access  Internal
exports.seedAdmin = async () => {
    try {
        const adminEmail = 'admin@crudochain.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            console.log('Creando Admin Seed...');
            await User.create({
                email: adminEmail,
                password: 'Admin123', // Will be hashed by pre-save hook
                role: 'admin',
                balance: 200000000 // 200 Million
            });
            console.log('👑 Admin Seed Verificado. Balance: 200M CRDO');
        } else {
            console.log('👑 Admin Seed ya existe.');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

// @desc    Get Admin Balance
// @route   GET /api/auth/admin-balance
// @access  Public
exports.getAdminBalance = async (req, res) => {
    try {
        const adminEmail = 'admin@crudochain.com';
        const admin = await User.findOne({ email: adminEmail });

        if (admin) {
            res.json({ balance: admin.balance });
        } else {
            // Fallback if admin not found (should be seeded)
            res.json({ balance: 200000000 });
        }
    } catch (error) {
        console.error('Error fetching admin balance:', error);
        res.status(500).json({ message: 'Error fetching admin balance' });
    }
};
