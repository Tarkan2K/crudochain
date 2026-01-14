const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/user/profile - Get full user profile including character data
router.get('/profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            character: user.character,
            gameData: user.gameData,
            balance: user.balance
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/user/update-character - Update character appearance and position
router.post('/update-character', async (req, res) => {
    try {
        const { email, character, position } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (character) {
            user.character = { ...user.character, ...character };
        }

        if (position) {
            user.gameData.position = position;
        }

        await user.save();
        res.json({ message: 'Character updated', user });
    } catch (error) {
        console.error('Error updating character:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
