'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import {
    ArrowLeft,
    Search,
    Loader2,
    Upload,
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
    Trash2,
    FolderOpen,
    Image as ImageIcon,
    X,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';

interface DeedImage {
    file: File;
    preview: string;
    name: string;
}

interface AssignedDeed {
    _id: string;
    deedCode: string;
    pageFrom: number;
    pageTo: number;
    sequence: number;
    images: DeedImage[];
}

function ImageUploadContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Selection State
    const [districts, setDistricts] = useState<any[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedRO, setSelectedRO] = useState<string>('');
    const [isSelectionConfirmed, setIsSelectionConfirmed] = useState(false);

    // Batches State
    const [batches, setBatches] = useState<any[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // Detail View State
    const [deeds, setDeeds] = useState<AssignedDeed[]>([]);
    const [unassignedImages, setUnassignedImages] = useState<DeedImage[]>([]);
    const [loadingDeeds, setLoadingDeeds] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [totalFilesToUpload, setTotalFilesToUpload] = useState(0);
    const [uploadedFilesCount, setUploadedFilesCount] = useState(0);

    // Multi-select State
    const [selectedImageIndices, setSelectedImageIndices] = useState<number[]>([]);
    const [focusedDeedId, setFocusedDeedId] = useState<string | null>(null);

    // Error/Success
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const [distRes, userRes] = await Promise.all([
                    fetch('/api/districts'),
                    fetch('/api/auth/me')
                ]);
                const distData = await distRes.json();
                const userData = await userRes.json();

                setDistricts(distData);
                if (userRes.ok && userData.id) {
                    setCurrentUserId(userData.id);
                }
            } catch (err) {
                setError('Failed to load initial data');
            }
        };
        loadInitial();

        const queryDistrictId = searchParams.get('district');
        const queryROId = searchParams.get('ro');

        if (queryDistrictId && queryROId) {
            setSelectedDistrict(queryDistrictId);
            setSelectedRO(queryROId);
            setIsSelectionConfirmed(true);
        }
    }, [searchParams]);

    const fetchBatches = useCallback(async (reset = false) => {
        if (!selectedDistrict || !selectedRO || !isSelectionConfirmed || !currentUserId) return;

        setLoadingBatches(true);
        try {
            const currentSkip = reset ? 0 : skip;
            // Filter by imageUpload stage
            const url = `/api/work/batches/${selectedRO}?userId=${currentUserId}&search=${searchTerm}&skip=${currentSkip}&stage=imageUpload`;
            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data)) {
                if (reset) setBatches(data);
                else setBatches(prev => [...prev, ...data]);
                setHasMore(data.length === 20);
            } else {
                setHasMore(false);
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
            router.push(`/work/image-upload?district=${selectedDistrict}&ro=${selectedRO}`);
        }
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
            fetchDeeds(batchId);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchDeeds = async (batchId: string) => {
        setLoadingDeeds(true);
        setError('');
        try {
            const res = await fetch(`/api/work/deeds/${batchId}`);
            if (res.ok) {
                const data = await res.json();
                setDeeds(data.map((d: any) => ({ ...d, images: [] })));
                setUnassignedImages([]); // Reset images on batch change
            } else {
                throw new Error('Failed to fetch deeds');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingDeeds(false);
        }
    };

    const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const selectedBatch = batches.find(b => b._id === selectedBatchId);
        if (!selectedBatch) return;

        // Check if folder name matches batch code
        const firstFilePath = files[0].webkitRelativePath;
        const folderName = firstFilePath.split('/')[0];

        if (folderName !== selectedBatch.batchCode) {
            setError(`Folder name must match batch code: ${selectedBatch.batchCode}`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setError('');
        const newImages: DeedImage[] = [];
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                newImages.push({
                    file,
                    preview: URL.createObjectURL(file),
                    name: file.name
                });
            }
        });

        autoAssignImages(newImages, selectedBatchId);
    };

    const autoAssignImages = (newImages: DeedImage[], batchId: string | null) => {
        const currentDeeds = [...deeds];
        const unassigned: DeedImage[] = [];

        newImages.forEach(img => {
            // Priority 1: Assign to focused deed if active
            if (focusedDeedId) {
                const targetDeed = currentDeeds.find(d => d._id === focusedDeedId);
                if (targetDeed) {
                    targetDeed.images = [...targetDeed.images, img].sort((a, b) => a.name.localeCompare(b.name));
                    return;
                }
            }

            // Priority 2: Extract numeric part from filename (e.g., "0001.jpg" -> 1)
            const match = img.name.match(/\d+/);
            if (match) {
                const pageNum = parseInt(match[0]);
                const targetDeed = currentDeeds.find(d => pageNum >= d.pageFrom && pageNum <= d.pageTo);
                if (targetDeed) {
                    targetDeed.images = [...targetDeed.images, img].sort((a, b) => a.name.localeCompare(b.name));
                } else {
                    unassigned.push(img);
                }
            } else {
                unassigned.push(img);
            }
        });

        setDeeds(currentDeeds);
        setUnassignedImages(unassigned);
    };

    const moveImageToUnassigned = (deedId: string, imgIndex: number) => {
        const currentDeeds = [...deeds];
        const deed = currentDeeds.find(d => d._id === deedId);
        if (deed) {
            const [img] = deed.images.splice(imgIndex, 1);
            setUnassignedImages(prev => [...prev, img]);
            setDeeds(currentDeeds);
        }
    };

    const moveImageToDeed = (deedId: string, imgIndicesInUnassigned: number[]) => {
        const currentDeeds = [...deeds];
        const deed = currentDeeds.find(d => d._id === deedId);
        if (deed && imgIndicesInUnassigned.length > 0) {
            const imgs = imgIndicesInUnassigned.map(idx => unassignedImages[idx]);
            deed.images.push(...imgs);
            deed.images.sort((a, b) => a.name.localeCompare(b.name));

            setUnassignedImages(prev => prev.filter((_, i) => !imgIndicesInUnassigned.includes(i)));
            setSelectedImageIndices([]);
            setDeeds(currentDeeds);
        }
    };

    const toggleImageSelection = (idx: number) => {
        setSelectedImageIndices(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const selectAllUnassigned = () => {
        setSelectedImageIndices(unassignedImages.map((_, i) => i));
    };

    const deselectAllUnassigned = () => {
        setSelectedImageIndices([]);
    };

    const handleSubmit = async () => {
        if (!selectedBatchId) return;
        setIsUploading(true);
        setError('');
        setSuccess(false);

        const allAssignedImages = deeds.flatMap(d => d.images);
        if (allAssignedImages.length === 0) {
            setError('No images assigned to any deeds.');
            setIsUploading(false);
            return;
        }

        setTotalFilesToUpload(allAssignedImages.length);
        setUploadedFilesCount(0);
        setUploadProgress(0);

        try {
            const assignments: any[] = [];

            // Upload images to S3 sequentially (or with limited concurrency)
            for (const deed of deeds) {
                if (deed.images.length === 0) continue;

                const uploadedImages = [];
                for (let i = 0; i < deed.images.length; i++) {
                    const img = deed.images[i];
                    const formData = new FormData();
                    formData.append('file', img.file);
                    formData.append('bucket', 'doc');
                    formData.append('folder', selectedBatch?.batchCode || '');

                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (!res.ok) throw new Error(`Failed to upload ${img.name}`);
                    const uploadData = await res.json();

                    uploadedImages.push({
                        imageUrl: uploadData.data.url,
                        imagePosition: (i + 1).toString()
                    });

                    setUploadedFilesCount(prev => {
                        const next = prev + 1;
                        setUploadProgress(Math.round((next / allAssignedImages.length) * 100));
                        return next;
                    });
                }

                assignments.push({
                    deedId: deed._id,
                    images: uploadedImages
                });
            }

            // Final API call to submit batch
            const submitRes = await fetch('/api/work/batches/submit-image-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ batchId: selectedBatchId, assignments })
            });

            if (!submitRes.ok) throw new Error('Failed to finalize batch submission');

            setSuccess(true);
            setTimeout(() => {
                setSelectedBatchId(null);
                fetchBatches(true);
                setSuccess(false);
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isSelectionConfirmed) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-10">
                <div className="max-w-2xl mx-auto space-y-8">
                    <header className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg">
                            <Upload size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Image Upload</h1>
                            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Select Scope to Begin Uploading</p>
                        </div>
                    </header>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-xl space-y-8">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">District</label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedRO(''); }}
                                    className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl outline-none font-bold text-base focus:border-blue-500/50 transition-all appearance-none"
                                >
                                    <option value="">Choose District</option>
                                    {districts.map(d => <option key={d._id} value={d._id}>{d.districtName}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Office</label>
                                <select
                                    disabled={!selectedDistrict}
                                    value={selectedRO}
                                    onChange={(e) => setSelectedRO(e.target.value)}
                                    className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl outline-none font-bold text-base focus:border-blue-500/50 transition-all appearance-none disabled:opacity-30"
                                >
                                    <option value="">Choose Office</option>
                                    {districts.find(d => d._id === selectedDistrict)?.ros.map((ro: any) => (
                                        <option key={ro._id} value={ro._id}>{ro.roName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            disabled={!selectedDistrict || !selectedRO}
                            onClick={handleConfirmSelection}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Select Scope <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedBatch = batches.find(b => b._id === selectedBatchId);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 font-sans">
            <div className="max-w-full mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">
                            <ArrowLeft size={12} /> Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg">
                                <Upload size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase italic">Image Upload Module</h1>
                                <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">RO: {districts.find(d => d._id === selectedDistrict)?.ros.find((r: any) => r._id === selectedRO)?.roName || 'Loading...'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setIsSelectionConfirmed(false)}
                            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 transition-colors"
                        >
                            <Settings2 size={20} className="text-zinc-500" />
                        </button>
                        {selectedBatchId && (
                            <button
                                onClick={handleSubmit}
                                disabled={isUploading || success}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:bg-zinc-300 transition-all active:scale-95"
                            >
                                {isUploading ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : <Upload size={16} />}
                                {isUploading ? `Uploading ${uploadedFilesCount}/${totalFilesToUpload}...` : success ? 'Batch Submitted' : 'Submit Batch'}
                            </button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Batch Selection Sidebar */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex flex-col h-[750px]">
                            <div className="relative mb-6">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search batches..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none font-bold text-xs focus:border-blue-500/50 transition-all"
                                />
                            </div>

                            <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {batches.map((batch, index) => (
                                    <div
                                        key={batch._id}
                                        ref={index === batches.length - 1 ? lastBatchElementRef : null}
                                        onClick={() => handleSelectBatch(batch._id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedBatchId === batch._id
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800/50 hover:border-blue-500/50 text-zinc-600 dark:text-zinc-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black font-mono tracking-wider">{batch.batchCode}</span>
                                            {batch.lockedBy === currentUserId ? <Lock size={12} className="opacity-80" /> : <Unlock size={12} className="opacity-20" />}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedBatchId === batch._id ? 'bg-white/10' : 'bg-white dark:bg-zinc-800'}`}>
                                                <History size={14} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase">Volume {batch.volumeCode}</div>
                                                <div className={`text-[8px] font-black uppercase tracking-tighter ${selectedBatchId === batch._id ? 'text-blue-100' : 'text-zinc-400'}`}>
                                                    Year: {batch.volumeYear}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {loadingBatches && [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-9 space-y-6">
                        {selectedBatchId ? (
                            <div className="space-y-6">
                                {/* Upload Zone */}
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight italic">Step 2: Assign Images</h2>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Batch: {selectedBatch?.batchCode}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFolderUpload}
                                                style={{ display: 'none' }}
                                                {...({ webkitdirectory: "", directory: "" } as any)}
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                                            >
                                                <FolderOpen size={16} /> Select Batch Folder
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error/Progress Messages */}
                                    {(error || isUploading) && (
                                        <div className={`p-4 rounded-xl flex items-center gap-3 mb-6 animate-in slide-in-from-top-2 duration-300 ${error ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {error ? <AlertTriangle size={20} /> : <Loader2 size={20} className="animate-spin" />}
                                            <div className="flex-1">
                                                <p className="text-xs font-black uppercase tracking-tighter">{error || `Uploading images to S3... (${uploadProgress}%)`}</p>
                                                {isUploading && (
                                                    <div className="w-full h-1 bg-blue-200 rounded-full mt-2">
                                                        <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                                    </div>
                                                )}
                                            </div>
                                            {error && <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg transition-colors"><X size={16} /></button>}
                                        </div>
                                    )}

                                    {/* 3-Part Interactive Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Part 1: Unassigned Deeds */}
                                        <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex flex-col h-[550px]">
                                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                    <FileText size={14} className="text-zinc-400" /> Pending Deeds
                                                </h3>
                                                <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 rounded text-[8px] font-black">{deeds.filter(d => d.images.length === 0).length}</span>
                                            </div>
                                            <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                                {deeds.filter(d => d.images.length === 0).map(deed => (
                                                    <div
                                                        key={deed._id}
                                                        onClick={() => {
                                                            if (selectedImageIndices.length > 0) {
                                                                moveImageToDeed(deed._id, selectedImageIndices);
                                                            } else {
                                                                setFocusedDeedId(focusedDeedId === deed._id ? null : deed._id);
                                                            }
                                                        }}
                                                        className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-center justify-between ${focusedDeedId === deed._id
                                                            ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500'
                                                            : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-blue-500/50'
                                                            }`}
                                                    >
                                                        <div>
                                                            <div className="text-xs font-black text-zinc-900 dark:text-zinc-100">{deed.deedCode}</div>
                                                            <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Pages: {deed.pageFrom}-{deed.pageTo}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {focusedDeedId === deed._id && <div className="text-[8px] font-black text-blue-600 uppercase animate-pulse">Focused</div>}
                                                            <div
                                                                className={`p-1.5 rounded-lg transition-colors ${selectedImageIndices.length > 0 ? 'bg-blue-600 text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:text-blue-500'
                                                                    }`}
                                                            >
                                                                {selectedImageIndices.length > 0 ? <ArrowRight size={14} /> : <PlusCircle size={14} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {deeds.filter(d => d.images.length === 0).length === 0 && (
                                                    <div className="flex flex-col items-center justify-center h-full text-zinc-300 opacity-50 space-y-4">
                                                        <CheckCircle2 size={48} />
                                                        <p className="text-[9px] font-black uppercase">All deeds have images</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Part 2: Unassigned Images */}
                                        <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex flex-col h-[550px]">
                                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                    <ImageIcon size={14} className="text-zinc-400" /> Unassigned Images
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    {unassignedImages.length > 0 && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={selectAllUnassigned}
                                                                className="text-[8px] font-black text-blue-600 uppercase hover:underline"
                                                            >
                                                                All
                                                            </button>
                                                            <button
                                                                onClick={deselectAllUnassigned}
                                                                className="text-[8px] font-black text-zinc-400 uppercase hover:underline"
                                                            >
                                                                None
                                                            </button>
                                                        </div>
                                                    )}
                                                    <button onClick={() => { setUnassignedImages([]); setSelectedImageIndices([]); }} className="hover:text-red-500 transition-colors"><RefreshCw size={12} /></button>
                                                </div>
                                            </div>
                                            <div className="flex-grow overflow-y-auto p-2 grid grid-cols-2 gap-2 custom-scrollbar">
                                                {unassignedImages.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => toggleImageSelection(idx)}
                                                        className={`group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${selectedImageIndices.includes(idx)
                                                            ? 'ring-4 ring-blue-600 border-blue-600 shadow-lg'
                                                            : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-blue-500'
                                                            }`}
                                                    >
                                                        <img src={img.preview} className="w-full h-full object-cover" />
                                                        {selectedImageIndices.includes(idx) && (
                                                            <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-md">
                                                                <CheckCircle2 size={12} />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                                            <div className="flex flex-col gap-2 w-full">
                                                                <div className="text-[8px] font-black text-white text-center uppercase tracking-widest">
                                                                    {selectedImageIndices.includes(idx) ? 'Deselect' : 'Select'}
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setUnassignedImages(prev => prev.filter((_, i) => i !== idx));
                                                                        setSelectedImageIndices(prev => prev.filter(i => i !== idx).map(i => i > idx ? i - 1 : i));
                                                                    }}
                                                                    className="w-full bg-red-600/90 hover:bg-red-600 text-white p-1.5 rounded-lg flex items-center justify-center transition-colors"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-1 left-1 bg-black/60 text-[7px] text-white px-1.5 py-0.5 rounded truncate max-w-[90%] font-bold">{img.name}</div>
                                                    </div>
                                                ))}
                                                {unassignedImages.length === 0 && (
                                                    <div className="col-span-2 flex flex-col items-center justify-center h-full text-zinc-300 opacity-50 space-y-4">
                                                        <FolderOpen size={48} />
                                                        <p className="text-[9px] font-black uppercase">Upload folder to see images</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Part 3: Assigned Deeds */}
                                        <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex flex-col h-[550px]">
                                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                    <CheckCircle2 size={14} className="text-zinc-400" /> Assigned Deeds
                                                </h3>
                                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded text-[8px] font-black uppercase tracking-tighter shadow-sm">{deeds.filter(d => d.images.length > 0).length}</span>
                                            </div>
                                            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                                {deeds.filter(d => d.images.length > 0).map(deed => (
                                                    <div
                                                        key={deed._id}
                                                        onClick={() => {
                                                            if (selectedImageIndices.length > 0) {
                                                                moveImageToDeed(deed._id, selectedImageIndices);
                                                            } else {
                                                                setFocusedDeedId(focusedDeedId === deed._id ? null : deed._id);
                                                            }
                                                        }}
                                                        className={`bg-white dark:bg-zinc-900 rounded-[1.5rem] border transition-all cursor-pointer overflow-hidden ${focusedDeedId === deed._id
                                                            ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                                                            : 'border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-blue-500/50'
                                                            }`}
                                                    >
                                                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                                            <div>
                                                                <div className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                                    {deed.deedCode}
                                                                    {focusedDeedId === deed._id && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />}
                                                                </div>
                                                                <div className="text-[8px] text-zinc-400 font-bold uppercase">{deed.images.length} Image(s)</div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{deed.pageFrom}-{deed.pageTo}</div>
                                                                {selectedImageIndices.length > 0 && (
                                                                    <div className="p-1 bg-blue-600 text-white rounded-lg">
                                                                        <PlusCircle size={10} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="p-3 grid grid-cols-4 gap-2">
                                                            {deed.images.map((img, i) => (
                                                                <div key={i} className="group relative aspect-square bg-zinc-100 rounded-lg overflow-hidden ring-1 ring-zinc-100">
                                                                    <img src={img.preview} className="w-full h-full object-cover" />
                                                                    <button
                                                                        onClick={() => moveImageToUnassigned(deed._id, i)}
                                                                        className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X size={10} />
                                                                    </button>
                                                                    <div className="absolute bottom-0 inset-x-0 bg-black/40 text-[6px] text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">#{i + 1}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                {deeds.filter(d => d.images.length > 0).length === 0 && (
                                                    <div className="flex flex-col items-center justify-center h-full text-zinc-300 opacity-50 space-y-4">
                                                        <ArrowRight size={48} className="animate-pulse" />
                                                        <p className="text-[9px] font-black uppercase">Assign images to see progress</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-24 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-full text-zinc-200">
                                    <Upload size={80} strokeWidth={1} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter italic">No Batch Selected</h3>
                                    <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest mt-3 max-w-xs leading-relaxed">Please select a processing batch from the sidebar to begin image ingestion.</p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
        </div>
    );
}

export default function ImageUploadPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
            <ImageUploadContent />
        </Suspense>
    );
}
