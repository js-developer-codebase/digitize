'use client';

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Layers,
    Trash2,
    ArrowLeft,
    Search,
    Unlock,
    Lock,
    Loader2,
    AlertCircle,
    X,
    AlertTriangle,
    Calendar,
    User,
    Building2,
    Hash,
    FileText,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

// Skeleton Loader Component
const BatchRowSkeleton = () => (
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
            <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        </td>
        <td className="px-6 py-5">
            <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
        </td>
        <td className="px-6 py-5 text-right">
            <div className="flex justify-end gap-2">
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
            </div>
        </td>
    </tr>
);

function BatchManagementContent() {
    const searchParams = useSearchParams();
    const roId = searchParams.get('ro');
    const districtId = searchParams.get('district');

    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState<any>(null);
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Unlock State
    const [isUnlocking, setIsUnlocking] = useState<string | null>(null);

    // Deed Details Modal State
    const [isDeedModalOpen, setIsDeedModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [deeds, setDeeds] = useState<any[]>([]);
    const [deedsLoading, setDeedsLoading] = useState(false);

    const handleRowClick = async (batch: any) => {
        setSelectedBatch(batch);
        setIsDeedModalOpen(true);
        setDeedsLoading(true);
        setDeeds([]);
        try {
            const res = await fetch(`/api/management/batches/${batch._id}/deeds`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch deeds');
            setDeeds(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeedsLoading(false);
        }
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch batches logic
    const fetchBatches = useCallback(async (skipVal: number, searchVal: string, isInitial: boolean = false) => {
        if (isInitial) setLoading(true);
        else setFetchingMore(true);

        try {
            let url = `/api/management/batches?skip=${skipVal}&search=${searchVal}`;
            if (roId) {
                url += `&roId=${roId}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch batches');

            if (isInitial) {
                setBatches(data);
            } else {
                setBatches(prev => [...prev, ...data]);
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
        setPage(0);
        fetchBatches(0, debouncedSearch, true);
    }, [debouncedSearch, fetchBatches]);

    // Infinite scroll observer
    const lastBatchElementRef = useCallback((node: any) => {
        if (loading || fetchingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 20;
                    fetchBatches(nextPage, debouncedSearch);
                    return nextPage;
                });
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, fetchingMore, hasMore, fetchBatches, debouncedSearch]);

    const openDeleteModal = (batch: any) => {
        setBatchToDelete(batch);
        setIsDeleteModalOpen(true);
        setDeleteInput('');
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setBatchToDelete(null);
        setDeleteInput('');
    };

    const handleUnlock = async (batchId: string) => {
        setIsUnlocking(batchId);
        try {
            const res = await fetch(`/api/management/batches/${batchId}/unlock`, {
                method: 'POST'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to unlock batch');

            setBatches(prev => prev.map(b => b._id === batchId ? { ...b, lockedBy: null, lockedAt: null } : b));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUnlocking(null);
        }
    };

    const confirmDelete = async () => {
        if (deleteInput.toLowerCase() !== 'delete') return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/management/batches/${batchToDelete._id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete batch');

            setBatches(prev => prev.filter(b => b._id !== batchToDelete._id));
            closeDeleteModal();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 md:p-12 font-sans overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                            <ArrowLeft size={16} />
                            Back to Workspace
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                                <Layers size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight">Batch Management</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Efficiently manage, unlock, and delete processing batches.</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-indigo-500' : 'text-zinc-400'}`} size={18} />
                        <input
                            type="text"
                            placeholder="Search Batch Code or Volume..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {debouncedSearch !== searchTerm && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 size={16} className="animate-spin text-indigo-500" />
                            </div>
                        )}
                    </div>
                </header>

                <main className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Batch Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">RO & District</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Stage</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => <BatchRowSkeleton key={i} />)
                                ) : batches.length > 0 ? (
                                    <>
                                        {batches.map((b, index) => (
                                            <tr
                                                key={b._id}
                                                ref={index === batches.length - 1 ? lastBatchElementRef : null}
                                                onClick={() => handleRowClick(b)}
                                                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Hash size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                                {b.batchCode}
                                                                {b.lockedBy && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm">
                                                                        <Lock size={10} />
                                                                        Locked
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-zinc-400 flex items-center gap-3 mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(b.createdAt))}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <User size={12} />
                                                                    {b.createdBy?.name || 'Unknown'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                                            <Building2 size={14} className="text-zinc-400" />
                                                            {b.roId?.roName || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-zinc-400 ml-5">
                                                            {b.districtId?.districtName || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                                        {b.stage}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {b.lockedBy && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleUnlock(b._id); }}
                                                                disabled={isUnlocking === b._id}
                                                                className="p-2.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all shadow-sm active:scale-95"
                                                                title="Unlock Batch"
                                                            >
                                                                {isUnlocking === b._id ? <Loader2 size={18} className="animate-spin" /> : <Unlock size={18} />}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openDeleteModal(b); }}
                                                            className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm active:scale-95"
                                                            title="Delete Batch"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {fetchingMore && Array.from({ length: 3 }).map((_, i) => <BatchRowSkeleton key={`more-${i}`} />)}
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-24 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-300 gap-6">
                                                <div className="p-8 bg-zinc-50 dark:bg-zinc-800/10 rounded-full">
                                                    <Layers size={80} className="opacity-20" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">No Batches Found</p>
                                                    <p className="text-sm text-zinc-500 max-w-xs mx-auto">We couldn't find any batches matching your search query or criteria.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>

                {!loading && !hasMore && batches.length > 0 && (
                    <div className="text-center py-12">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] bg-white dark:bg-zinc-900 px-6 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            End of Dashboard
                        </span>
                    </div>
                )}

                {error && (
                    <div className="fixed bottom-8 right-8 p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-right-full duration-500 z-[60]">
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold">{error}</span>
                        <button onClick={() => setError('')} className="ml-2 hover:bg-white/20 p-1 rounded-lg transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Deed Details Modal */}
            {isDeedModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Batch: {selectedBatch?.batchCode}</h3>
                                    <p className="text-xs text-zinc-500">Deed records associated with this batch</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDeedModalOpen(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {deedsLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
                                    <Loader2 className="animate-spin" size={40} />
                                    <p className="text-sm font-medium">Fetching deed details...</p>
                                </div>
                            ) : deeds.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {deeds.map((deed) => (
                                        <div key={deed._id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors">
                                                    <Hash size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{deed.deedCode}</div>
                                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                                        Pages: {deed.pageFrom} - {deed.pageTo} | Seq: {deed.sequence}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1">
                                                    <CheckCircle2 size={10} />
                                                    Verified
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-300">
                                    <FileText size={48} className="opacity-20" />
                                    <p className="text-sm font-medium">No deed records found for this batch.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex justify-end">
                            <button
                                onClick={() => setIsDeedModalOpen(false)}
                                className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Secure Delete Modal */}
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
                                <h3 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">Delete Batch</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                    You are about to delete batch <span className="font-bold text-red-600">{batchToDelete?.batchCode}</span> and all its associated deed records.
                                    This action is irreversible.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Type <span className="text-red-500 underline">delete</span> to confirm
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Confirmation..."
                                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-red-500/50 rounded-2xl outline-none font-bold text-lg transition-all"
                                    value={deleteInput}
                                    onChange={e => setDeleteInput(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
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
                                    {isDeleting ? <Loader2 className="animate-spin" size={16} /> : 'Confirm Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BatchManagementPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>}>
            <BatchManagementContent />
        </Suspense>
    );
}
