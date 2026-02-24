'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Users,
    Trash2,
    ArrowLeft,
    Search,
    User,
    Mail,
    Shield,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

function ManageUsersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const roId = searchParams.get('roId');
    const roName = searchParams.get('roName');

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!roId) return;
            try {
                const res = await fetch(`/api/users?roId=${roId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
                setUsers(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [roId]);

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This is a soft delete.')) return;

        setDeletingId(userId);
        try {
            const res = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete user');

            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                            <ArrowLeft size={16} />
                            Back to Workspace
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-2xl">
                                <Users size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight">Manage Users</h1>
                                <p className="text-zinc-500 dark:text-zinc-400">Reporting Office: <span className="text-teal-600 font-bold">{roName || 'All'}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <main className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-zinc-400 gap-4">
                            <Loader2 className="animate-spin text-teal-600" size={40} />
                            <p className="font-medium">Acquiring user list...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">User Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 group-hover:scale-110 transition-transform">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-zinc-900 dark:text-white">{u.name}</div>
                                                        <div className="text-sm text-zinc-500 flex items-center gap-1">
                                                            <Mail size={12} />
                                                            {u.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-bold">
                                                    <Shield size={12} />
                                                    {(u.userType as any).type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleDelete(u._id)}
                                                    disabled={deletingId === u._id}
                                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Soft Delete"
                                                >
                                                    {deletingId === u._id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-20 flex flex-col items-center justify-center text-zinc-400 gap-4">
                            <Users size={60} className="opacity-10" />
                            <div className="text-center">
                                <p className="text-xl font-bold">No Users Found</p>
                                <p className="text-sm">We couldn't find any active users matching your criteria in this RO.</p>
                            </div>
                        </div>
                    )}
                </main>

                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center gap-3 border border-red-200 dark:border-red-800">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ManageUsersPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-teal-600" size={40} /></div>}>
            <ManageUsersContent />
        </Suspense>
    );
}
