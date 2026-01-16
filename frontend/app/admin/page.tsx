'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Nav from '../components/Nav';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    email: string;
    role: string;
    balance: number;
    createdAt: string;
}

export default function AdminPage() {
    const { isLoggedIn, token, logout } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'USERS' | 'CONTENT'>('USERS');
    const [newContent, setNewContent] = useState({ title: '', content: '', type: 'NEWS', imageUrl: '' });

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        fetchUsers();
    }, [isLoggedIn, token]);

    const fetchUsers = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 403 || res.status === 401) {
                setMessage({ text: 'Access Denied. Admin only.', type: 'error' });
                setTimeout(() => router.push('/'), 2000);
                return;
            }

            const data = await res.json();
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage({ text: 'Failed to fetch users', type: 'error' });
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/admin/set-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, role: newRole })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: `User role updated to ${newRole}`, type: 'success' });
                fetchUsers(); // Refresh list
            } else {
                setMessage({ text: data.message || 'Failed to update role', type: 'error' });
            }
        } catch (error) {
            console.error('Error updating role:', error);
            setMessage({ text: 'Error updating role', type: 'error' });
        }
    };

    const handleCreateContent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newContent)
            });

            if (res.ok) {
                setMessage({ text: 'Content created successfully!', type: 'success' });
                setNewContent({ title: '', content: '', type: 'NEWS', imageUrl: '' });
            } else {
                setMessage({ text: 'Failed to create content', type: 'error' });
            }
        } catch (error) {
            console.error('Error creating content:', error);
            setMessage({ text: 'Error creating content', type: 'error' });
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans selection:bg-purple-500/30 pt-24">
            <Nav />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        THE BUNKER (ADMIN)
                    </h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('USERS')}
                            className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'USERS' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            USERS
                        </button>
                        <button
                            onClick={() => setActiveTab('CONTENT')}
                            className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'CONTENT' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            CONTENT CMS
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'USERS' ? (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by Email or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                <svg className="w-5 h-5 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/10">
                                        <th className="p-4">User</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Balance</th>
                                        <th className="p-4">Joined</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map(user => (
                                        <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{user.email}</div>
                                                <div className="text-xs text-gray-500 font-mono">{user._id}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                                                    user.role === 'BLOGGER' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-green-400">
                                                {user.balance.toLocaleString()} CRDO
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                {user.role !== 'ADMIN' && (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {user.role !== 'BLOGGER' ? (
                                                            <button
                                                                onClick={() => handleRoleUpdate(user._id, 'BLOGGER')}
                                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors"
                                                            >
                                                                MAKE BLOGGER
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRoleUpdate(user._id, 'USER')}
                                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-lg transition-colors"
                                                            >
                                                                REVOKE
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6">Create New Content</h2>
                        <form onSubmit={handleCreateContent} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Type</label>
                                    <select
                                        value={newContent.type}
                                        onChange={e => setNewContent({ ...newContent, type: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="NEWS">News</option>
                                        <option value="BLOG">Blog Post</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Image URL</label>
                                    <input
                                        type="text"
                                        value={newContent.imageUrl}
                                        onChange={e => setNewContent({ ...newContent, imageUrl: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newContent.title}
                                    onChange={e => setNewContent({ ...newContent, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Content</label>
                                <textarea
                                    value={newContent.content}
                                    onChange={e => setNewContent({ ...newContent, content: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 h-48 resize-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
                            >
                                PUBLISH CONTENT
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
