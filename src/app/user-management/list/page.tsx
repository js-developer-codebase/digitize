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
    CheckCircle2,
    Edit2,
    X,
    AlertTriangle
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

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

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

    const openDeleteModal = (user: any) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
        setDeleteInput('');
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        setDeleteInput('');
    };

    const confirmDelete = async () => {
        if (deleteInput.toLowerCase() !== 'delete') return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/users?id=${userToDelete._id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete user');

            setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
            closeDeleteModal();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
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

                <main className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/user-management/edit/${u._id}`}
                                                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                        title="Edit User"
                                                    >
                                                        <Edit2 size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => openDeleteModal(u)}
                                                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        title="Secure Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
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

            {/* Custom Secure Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center">
                                    <AlertTriangle size={24} />
                                </div>
                                <button onClick={closeDeleteModal} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight">Secure Deletion</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                    You are about to soft-delete <span className="font-bold text-zinc-900 dark:text-white">{userToDelete?.name}</span>.
                                    This user will no longer have access to the system.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Type <span className="text-red-500 underline">delete</span> to confirm
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Enter confirmation..."
                                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-red-500/50 rounded-2xl outline-none font-bold text-lg transition-all"
                                    value={deleteInput}
                                    onChange={e => setDeleteInput(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={closeDeleteModal}
                                    className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={deleteInput.toLowerCase() !== 'delete' || isDeleting}
                                    onClick={confirmDelete}
                                    className="flex-1 py-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-300 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="animate-spin" size={16} /> : 'Delete Profile'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
