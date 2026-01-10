import dbConnect from '../lib/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
    try {
        await dbConnect();

        const adminEmail = 'admin@crudochain.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('⚠️ Admin user already exists.');
            // Update role just in case
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('✅ Admin role updated.');
            return;
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = new User({
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            walletAddress: 'ADMIN_WALLET_ADDRESS',
            role: 'admin'
        });

        await admin.save();
        console.log('✅ Admin user created successfully.');
        console.log('📧 Email: admin@crudochain.com');
        console.log('🔑 Password: admin123');

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        process.exit();
    }
}

seedAdmin();
