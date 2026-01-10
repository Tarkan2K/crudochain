import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

async function seedMockAdmin() {
    try {
        const adminEmail = 'admin@crudochain.com';
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = {
            id: 'admin_1',
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            walletAddress: 'ADMIN_WALLET_ADDRESS',
            role: 'admin',
            createdAt: new Date().toISOString()
        };

        let users = [];
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            users = JSON.parse(data);
        }

        // Check if admin exists
        const existingIndex = users.findIndex((u: any) => u.email === adminEmail);
        if (existingIndex >= 0) {
            users[existingIndex] = adminUser;
            console.log('⚠️ Admin user updated.');
        } else {
            users.push(adminUser);
            console.log('✅ Admin user created.');
        }

        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4));
        console.log(`💾 Saved to ${USERS_FILE}`);
        console.log('📧 Email: admin@crudochain.com');
        console.log('🔑 Password: admin123');

    } catch (error) {
        console.error('❌ Error seeding mock admin:', error);
    }
}

seedMockAdmin();
