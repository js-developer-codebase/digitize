'use client';

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
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
    AlertTriangle,
    ChevronDown
} from 'lucide-react';
import Link from 'next/link';

// Skeleton Loader Component
const UserRowSkeleton = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-5">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
                </div>
            </div>
        </td>
        <td className="px-6 py-5">
            <div className="h-6 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        </td>
        <td className="px-6 py-5 text-right">
            <div className="flex justify-end gap-2">
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
            </div>
        </td>
    </tr>
);

function ManageUsersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const roId = searchParams.get('roId');
    const roName = searchParams.get('roName');

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch users logic
    const fetchUsers = useCallback(async (pageNum: number, searchVal: string, isInitial: boolean = false) => {
        if (!roId) return;

        if (isInitial) setLoading(true);
        else setFetchingMore(true);

        try {
            const res = await fetch(`/api/users?roId=${roId}&page=${pageNum}&search=${searchVal}&limit=20`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch users');

            if (isInitial) {
                setUsers(data);
            } else {
                setUsers(prev => [...prev, ...data]);
            }

            setHasMore(data.length === 20);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setFetchingMore(false);
        }
    }, [roId]);

    // Effect for search and initial load
    useEffect(() => {
        setPage(1);
        fetchUsers(1, debouncedSearch, true);
    }, [debouncedSearch, fetchUsers]);

    // Infinite scroll observer
    const lastUserElementRef = useCallback((node: any) => {
        if (loading || fetchingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchUsers(nextPage, debouncedSearch);
                    return nextPage;
                });
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, fetchingMore, hasMore, fetchUsers, debouncedSearch]);

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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 md:p-12 font-sans overflow-x-hidden">
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
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-teal-500' : 'text-zinc-400'}`} size={18} />
                        <input
                            type="text"
                            placeholder="Global Search (Entire DB)..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {debouncedSearch !== searchTerm && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 size={16} className="animate-spin text-teal-500" />
                            </div>
                        )}
                    </div>
                </header>

                <main className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 min-h-[400px]">
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
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)
                                ) : users.length > 0 ? (
                                    <>
                                        {users.map((u, index) => (
                                            <tr
                                                key={u._id}
                                                ref={index === users.length - 1 ? lastUserElementRef : null}
                                                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group"
                                            >
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
                                                    <div className="flex items-center justify-end gap-2 text-zinc-400">
                                                        <Link
                                                            href={`/user-management/edit/${u._id}`}
                                                            className="p-2 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                            title="Edit User"
                                                        >
                                                            <Edit2 size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => openDeleteModal(u)}
                                                            className="p-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                            title="Secure Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {fetchingMore && Array.from({ length: 3 }).map((_, i) => <UserRowSkeleton key={`more-${i}`} />)}
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="p-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-400 gap-4">
                                                <Users size={60} className="opacity-10" />
                                                <div>
                                                    <p className="text-xl font-bold">No Users Found</p>
                                                    <p className="text-sm">We couldn't find any users matching your criteria.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>

                {!loading && !hasMore && users.length > 0 && (
                    <div className="text-center py-8">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800">
                            You've reached the end of the line
                        </span>
                    </div>
                )}

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
                                    You are about to soft-delete <span className="font-bold text-zinc-900 dark:text-white">{userToDelete?.name}</span>?
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
