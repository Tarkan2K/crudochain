const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@crudochain.com';
        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log('Admin user found. Updating...');
            user.password = 'Admin123'; // Will be hashed by pre-save
            user.role = 'ADMIN';
            await user.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Admin user not found. Creating...');
            await User.create({
                email: adminEmail,
                password: 'Admin123',
                role: 'ADMIN',
                balance: 200000000
            });
            console.log('Admin user created successfully.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixAdmin();
