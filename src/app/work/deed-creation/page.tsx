'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import {
    ArrowLeft,
    Search,
    Loader2,
    Database,
    MapPin,
    Building2,
    Calendar,
    Hash,
    PlusCircle,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Lock,
    Unlock,
    Settings2,
    History,
    FileText,
    AlertTriangle,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';

function DeedCreationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Context from query or state
    const [districts, setDistricts] = useState<any[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedRO, setSelectedRO] = useState<string>('');
    const [isSelectionConfirmed, setIsSelectionConfirmed] = useState(false);

    // Batches state
    const [batches, setBatches] = useState<any[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // Deed form state
    const [deedCode, setDeedCode] = useState('');
    const [pageFrom, setPageFrom] = useState('');
    const [pageTo, setPageTo] = useState('');
    const [selectedException, setSelectedException] = useState('');
    const [exceptions, setExceptions] = useState<any[]>([]);

    // Status states
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Deeds logic
    const [deeds, setDeeds] = useState<any[]>([]);
    const [loadingDeeds, setLoadingDeeds] = useState(false);
    const [deedToDelete, setDeedToDelete] = useState<any>(null);

    // Warning Modal state
    const [warningData, setWarningData] = useState<{
        isDuplicate: boolean;
        existingCount: number;
        overlaps: any[];
    } | null>(null);
    const [showWarningModal, setShowWarningModal] = useState(false);

    // Intersection Observer for Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastBatchElementRef = useCallback((node: HTMLDivElement) => {
        if (loadingBatches) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setSkip(prev => prev + 20);
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingBatches, hasMore]);

    // Intersection Observer for Infinite Scroll

    useEffect(() => {
        const loadInitial = async () => {
            await Promise.all([fetchInitialData(), fetchUser()]);
        };
        loadInitial();

        // Load selection from query params first, then sessionStorage if available
        const queryDistrictId = searchParams.get('district');
        const queryROId = searchParams.get('ro');

        const distToUse = queryDistrictId || sessionStorage.getItem('deed_district');
        const roToUse = queryROId || sessionStorage.getItem('deed_ro');

        // Validate both look like MongoDB ObjectIds (24 hex chars)
        const isValidObjectId = (val: string | null) => val !== null && /^[a-f\d]{24}$/i.test(val);
        if (isValidObjectId(distToUse) && isValidObjectId(roToUse)) {
            setSelectedDistrict(distToUse!);
            setSelectedRO(roToUse!);
            setIsSelectionConfirmed(true);

            if (queryDistrictId && queryROId) {
                sessionStorage.setItem('deed_district', queryDistrictId);
                sessionStorage.setItem('deed_ro', queryROId);
            }
        } else {
            // Clear stale or legacy values (e.g. old roCode strings)
            sessionStorage.removeItem('deed_district');
            sessionStorage.removeItem('deed_ro');
        }
    }, [searchParams]);

    const fetchInitialData = async () => {
        try {
            const [distRes, exRes] = await Promise.all([
                fetch('/api/districts'),
                fetch('/api/work/exceptions')
            ]);
            const distData = await distRes.json();
            const exData = await exRes.json();

            setDistricts(distData);
            setExceptions(exData);
        } catch (err: any) {
            setError('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (res.ok && data.id) {
                setCurrentUserId(data.id);
            }
        } catch (err) {
            console.error('Failed to fetch user session:', err);
        }
    };

    const fetchBatches = useCallback(async (reset = false) => {
        if (!selectedDistrict || !selectedRO || !isSelectionConfirmed || !currentUserId) return;

        setLoadingBatches(true);
        try {
            const currentSkip = reset ? 0 : skip;
            const url = `/api/work/batches/${selectedRO}?userId=${currentUserId}&search=${searchTerm}&skip=${currentSkip}`;
            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data)) {
                if (reset) {
                    setBatches(data);
                } else {
                    setBatches(prev => [...prev, ...data]);
                }
                setHasMore(data.length === 20);
            } else {
                console.error('API returned non-array data:', data);
                if (reset) setBatches([]);
                setHasMore(false);
                if (data.error) setError(data.error);
            }
        } catch (err) {
            setError('Failed to fetch batches');
        } finally {
            setLoadingBatches(false);
        }
    }, [selectedDistrict, selectedRO, searchTerm, skip, isSelectionConfirmed, currentUserId]);

    useEffect(() => {
        if (isSelectionConfirmed && currentUserId) {
            fetchBatches(true);
            setSkip(0);
        }
    }, [isSelectionConfirmed, searchTerm, currentUserId, fetchBatches]);

    useEffect(() => {
        if (skip > 0 && isSelectionConfirmed && currentUserId) {
            fetchBatches();
        }
    }, [skip, currentUserId, isSelectionConfirmed, fetchBatches]);

    const handleConfirmSelection = () => {
        if (selectedDistrict && selectedRO) {
            setIsSelectionConfirmed(true);
            sessionStorage.setItem('deed_district', selectedDistrict);
            sessionStorage.setItem('deed_ro', selectedRO);
        }
    };

    const handleChangeSelection = () => {
        setIsSelectionConfirmed(false);
        setSelectedBatchId(null);
        setBatches([]);
        setDeeds([]);
        sessionStorage.removeItem('deed_district');
        sessionStorage.removeItem('deed_ro');
    };

    const handleSelectBatch = async (batchId: string) => {
        try {
            const res = await fetch(`/api/work/batches/lock/${batchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSelectedBatchId(batchId);
            fetchBatches(true);
            setSkip(0);
            fetchDeeds(batchId);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeedSubmit = async (e?: React.FormEvent, bypass = false) => {
        if (e) e.preventDefault();
        if (!selectedBatchId) return;

        const selectedBatch = batches.find(b => b._id === selectedBatchId);
        if (!selectedBatch) return;

        // Perform check if not bypassing
        if (!bypass) {
            try {
                const checkRes = await fetch('/api/work/deeds/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        batchId: selectedBatchId,
                        roId: selectedBatch.roId,
                        bookType: selectedBatch.batchCode.substring(4, 5),
                        deedCode,
                        pageFrom: parseInt(pageFrom),
                        pageTo: parseInt(pageTo),
                    })
                });
                const checkData = await checkRes.json();
                if (checkData.isDuplicate || checkData.overlaps?.length > 0) {
                    setWarningData(checkData);
                    setShowWarningModal(true);
                    return;
                }
            } catch (err) {
                console.error('Check failed', err);
            }
        }

        setSubmitting(true);
        setError('');
        setShowWarningModal(false);

        try {
            const res = await fetch(`/api/work/deeds/${selectedBatchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deedCode,
                    pageFrom: parseInt(pageFrom),
                    pageTo: parseInt(pageTo),
                    exceptionCode: selectedException || null,
                    districtId: selectedBatch.districtId,
                    roId: selectedBatch.roId,
                    bookType: selectedBatch.batchCode.substring(4, 5),
                    volumeYear: selectedBatch.batchCode.substring(5, 9),
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSuccess(true);
            setDeedCode('');
            setPageFrom('');
            setPageTo('');
            setSelectedException('');
            setTimeout(() => setSuccess(false), 3000);
            fetchDeeds(selectedBatchId);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const fetchDeeds = async (batchId: string) => {
        setLoadingDeeds(true);
        try {
            const res = await fetch(`/api/work/deeds/${batchId}`);
            if (res.ok) {
                const data = await res.json();
                setDeeds(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch deeds', err);
        } finally {
            setLoadingDeeds(false);
        }
    };

    const confirmDeleteDeed = async () => {
        if (!deedToDelete) return;
        try {
            const res = await fetch(`/api/work/deeds/delete/${deedToDelete._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete deed');
            setDeedToDelete(null);
            if (selectedBatchId) fetchDeeds(selectedBatchId);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteDeed = (deed: any) => {
        setDeedToDelete(deed);
    };

    const handleCompleteBatch = async () => {
        if (!selectedBatchId) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/work/batches/finish/${selectedBatchId}`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to complete batch');

            setSelectedBatchId(null);
            fetchBatches(true);
            setSkip(0);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 font-sans">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4"><Skeleton className="h-[600px] rounded-3xl" /></div>
                        <div className="lg:col-span-8"><Skeleton className="h-[600px] rounded-3xl" /></div>
                    </div>
                </div>
            </div>
        );
    }

    const selectedDistrictData = districts.find(d => d._id === selectedDistrict);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 font-sans transition-colors duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">
                            <ArrowLeft size={12} />
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                                <Database size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">Deed Creation</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                                    {isSelectionConfirmed ? 'Batch Selection & Record Intake' : 'Operational Scope Setup'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {isSelectionConfirmed && (
                        <div className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="space-y-0.5">
                                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">District</div>
                                    <div className="text-xs font-black text-zinc-900 dark:text-zinc-100">{selectedDistrictData?.districtName}</div>
                                </div>
                                <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
                                <div className="space-y-0.5">
                                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Office</div>
                                    <div className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                                        {selectedDistrictData?.ros.find((r: any) => r._id === selectedRO)?.roName || selectedRO}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleChangeSelection}
                                className="ml-4 p-2 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-all text-indigo-600 dark:text-indigo-400"
                                title="Change Selection"
                            >
                                <Settings2 size={16} />
                            </button>
                        </div>
                    )}
                </header>

                {!isSelectionConfirmed ? (
                    <div className="max-w-2xl mx-auto pt-10">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-xl shadow-indigo-500/5 space-y-10">
                            <div className="text-center space-y-3">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/30 mb-2">
                                    Step 1: Define Scope
                                </div>
                                <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase italic">Select Jurisdiction</h2>
                                <p className="text-zinc-400 font-bold text-xs">Choose the District and Registration Office to access available batches.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                        <MapPin size={12} className="text-indigo-500" /> District
                                    </label>
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedRO(''); }}
                                        className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl outline-none font-bold text-base focus:border-indigo-500/50 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="">Choose District</option>
                                        {districts.map(d => <option key={d._id} value={d._id}>{d.districtName} ({d.districtCode})</option>)}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                        <Building2 size={12} className="text-indigo-500" /> Registration Office
                                    </label>
                                    <select
                                        disabled={!selectedDistrict}
                                        value={selectedRO}
                                        onChange={(e) => setSelectedRO(e.target.value)}
                                        className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl outline-none font-bold text-base focus:border-indigo-500/50 transition-all cursor-pointer appearance-none disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Choose Office</option>
                                        {selectedDistrictData?.ros.map((ro: any) => (
                                            <option key={ro._id} value={ro._id}>{ro.roName} ({ro.roCode})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                disabled={!selectedDistrict || !selectedRO}
                                onClick={handleConfirmSelection}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Continue to Batches <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-500">
                        {/* Batch Selection Sidebar */}
                        <aside className="lg:col-span-4 space-y-6">
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex flex-col h-[700px]">
                                <div className="space-y-4 mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search available batches..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none font-bold text-xs focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {Array.isArray(batches) && batches.map((batch, index) => (
                                        <div
                                            key={batch._id}
                                            ref={index === batches.length - 1 ? lastBatchElementRef : null}
                                            onClick={() => handleSelectBatch(batch._id)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedBatchId === batch._id
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 shadow-indigo-500/20'
                                                : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-500/50 text-zinc-600 dark:text-zinc-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black font-mono tracking-wider">{batch.batchCode}</span>
                                                {batch.lockedBy === currentUserId ? (
                                                    <Lock size={12} className={selectedBatchId === batch._id ? 'text-indigo-200' : 'text-indigo-500'} />
                                                ) : (
                                                    <Unlock size={12} className="opacity-20" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${selectedBatchId === batch._id ? 'bg-white/10' : 'bg-white dark:bg-zinc-800 shadow-sm'}`}>
                                                    <History size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold uppercase">Volume {batch.volumeCode}</div>
                                                    <div className={`text-[8px] font-black uppercase tracking-tighter ${selectedBatchId === batch._id ? 'text-indigo-100' : 'text-zinc-400'}`}>
                                                        Year: {batch.volumeYear} • Stage: {batch.stage}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {loadingBatches && (
                                        <div className="flex flex-col gap-3">
                                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                                        </div>
                                    )}

                                    {!loadingBatches && batches.length === 0 && (
                                        <div className="text-center py-20 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">No active batches</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* Deed Entry Form */}
                        <main className="lg:col-span-8 space-y-6">
                            {selectedBatchId ? (
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 md:p-10 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight italic">Create Deed Entry</h2>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/30">
                                                    Batch: {batches.find(b => b._id === selectedBatchId)?.batchCode}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCompleteBatch}
                                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={14} /> Mark Batch Complete
                                        </button>
                                    </div>

                                    <form onSubmit={handleDeedSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                        <div className="md:col-span-8 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                                        <Hash size={10} className="text-indigo-500" /> Deed Code (5 Digits)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        maxLength={5}
                                                        value={deedCode}
                                                        onChange={(e) => setDeedCode(e.target.value.replace(/\D/g, ''))}
                                                        onBlur={() => deedCode && setDeedCode(deedCode.padStart(5, '0'))}
                                                        placeholder="00001"
                                                        className="w-full h-12 px-5 bg-zinc-50 dark:bg-zinc-800/40 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl outline-none font-bold text-base focus:border-indigo-500/50 transition-all placeholder:opacity-30"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Page From</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            maxLength={4}
                                                            value={pageFrom}
                                                            onChange={(e) => setPageFrom(e.target.value.replace(/\D/g, ''))}
                                                            onBlur={() => pageFrom && setPageFrom(pageFrom.padStart(4, '0'))}
                                                            className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800/40 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl outline-none font-bold text-center focus:border-indigo-500/50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Page To</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            maxLength={4}
                                                            value={pageTo}
                                                            onChange={(e) => setPageTo(e.target.value.replace(/\D/g, ''))}
                                                            onBlur={() => pageTo && setPageTo(pageTo.padStart(4, '0'))}
                                                            className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800/40 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl outline-none font-bold text-center focus:border-indigo-500/50 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                                    <AlertTriangle size={10} className="text-amber-500" /> Map Exceptions
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {exceptions.map((ex) => (
                                                        <button
                                                            key={ex.code}
                                                            type="button"
                                                            onClick={() => setSelectedException(selectedException === ex.code ? '' : ex.code)}
                                                            className={`p-3 rounded-xl border text-[9px] font-black uppercase flex flex-col items-center gap-1 transition-all ${selectedException === ex.code
                                                                ? 'bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400 shadow-sm'
                                                                : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800/50 text-zinc-400 hover:border-amber-300'
                                                                }`}
                                                        >
                                                            <span className="opacity-50 tracking-[0.2em]">{ex.code}</span>
                                                            <span className="text-center leading-tight">{ex.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <aside className="md:col-span-4 bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-6 space-y-6 flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Record Summary</div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className="text-zinc-400">Combined Code</span>
                                                        <span className="text-indigo-600 dark:text-indigo-400">
                                                            {batches.find(b => b._id === selectedBatchId)?.batchCode.substring(0, 9)}{deedCode.padStart(5, '0')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className="text-zinc-400">Pages</span>
                                                        <span>{pageFrom && pageTo ? Number(pageTo) - Number(pageFrom) + 1 : 0} Total</span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className="text-zinc-400">Sequence</span>
                                                        <span className="text-amber-500 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded text-[9px]">Auto</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submitting || !deedCode || !pageFrom || !pageTo}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400"
                                            >
                                                {submitting ? <Loader2 className="animate-spin mx-auto" /> : success ? 'Entry Saved ✓' : 'Add Recod Entry'}
                                            </button>
                                        </aside>
                                    </form>

                                    {error && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/20 animate-shake">
                                            <AlertCircle size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-tight">{error}</span>
                                        </div>
                                    )}

                                    <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8">
                                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight italic mb-6">Added Deeds</h3>
                                        {loadingDeeds ? (
                                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-zinc-400" /></div>
                                        ) : deeds.length === 0 ? (
                                            <div className="text-center py-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">No deeds added yet</div>
                                        ) : (
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                {deeds.map((deed) => (
                                                    <div key={deed._id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl group hover:border-indigo-500/30 transition-all">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">{deed.deedCode}</span>
                                                                <span className="text-[9px] font-bold uppercase text-zinc-400">Seq: {deed.sequence}</span>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-zinc-500">
                                                                Pages: {deed.pageFrom} - {deed.pageTo}
                                                                {deed.exceptionCode && <span className="ml-2 text-amber-500">• Exception: {deed.exceptionCode}</span>}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteDeed(deed)}
                                                            className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                            title="Delete Deed"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-full text-zinc-200">
                                        <FileText size={80} strokeWidth={1} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">No Batch Active</h3>
                                        <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest mt-3 max-w-xs leading-relaxed">Select a batch from the sidebar to begin deed digitization records.</p>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>

            {/* Warning Modal */}
            {showWarningModal && warningData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shadow-inner">
                                <AlertTriangle size={40} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter italic">Warning: Potential Duplicate</h3>
                                <p className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                                    {warningData.isDuplicate
                                        ? `Found ${warningData.existingCount} existing record(s) with deed code ${deedCode} for this office.`
                                        : "Potential page range overlap detected."}
                                </p>
                            </div>
                        </div>

                        {warningData.overlaps.length > 0 && (
                            <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Overlapping Records</div>
                                <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                    {warningData.overlaps.map((overlap: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                            <div className="space-y-0.5">
                                                <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                                                    Deed: {overlap.deedCode} (Batch: {overlap.batchCode})
                                                </div>
                                                <div className="text-[9px] font-bold text-zinc-500">Pages: {overlap.pageFrom}-{overlap.pageTo} • Seq: {overlap.sequence}</div>
                                            </div>
                                            <AlertCircle size={14} className="text-amber-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <button
                                onClick={() => setShowWarningModal(false)}
                                className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                            >
                                Review Entry
                            </button>
                            <button
                                onClick={() => handleDeedSubmit(undefined, true)}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <PlusCircle size={14} /> Proceed Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Modal */}
            {deedToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-2 text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">Delete Deed</h3>
                            <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                                Are you sure you want to delete deed entry <span className="text-zinc-900 dark:text-zinc-200 font-black">{deedToDelete.deedCode}</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setDeedToDelete(null)}
                                className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteDeed}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                    20%, 40%, 60%, 80% { transform: translateX(2px); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
}

export default function DeedCreationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
            <DeedCreationContent />
        </Suspense>
    );
}
