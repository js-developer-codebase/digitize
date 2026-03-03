'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import {
    Layers,
    ArrowLeft,
    ChevronRight,
    Database,
    FileText,
    MapPin,
    Building2,
    Calendar,
    Hash,
    PlusCircle,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Copy,
    Lock,
    Sparkles,
    Info
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StageConfig } from '@/config/stageConfig';
import { Skeleton } from '@/components/ui/Skeleton';

function BatchCreationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Params from query string: ?district=CODE&ro=CODE
    const queryDistrictId = searchParams.get('district');
    const queryROId = searchParams.get('ro');

    const [districts, setDistricts] = useState<any[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedRO, setSelectedRO] = useState<string>('');
    const [bookType, setBookType] = useState<string>('');
    const [volumeYear, setVolumeYear] = useState<string>('');
    const [volumeCode, setVolumeCode] = useState<string>('');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    // Mock for current user
    const currentUserId = '67bb5778b40d6c936082987a';

    useEffect(() => {
        fetchDistricts();
    }, []);

    const fetchDistricts = async () => {
        try {
            const res = await fetch('/api/districts');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch districts');
            setDistricts(data);

            // Auto-select based on query params
            if (queryDistrictId) {
                const foundDist = data.find((d: any) => d._id === queryDistrictId);
                if (foundDist) {
                    setSelectedDistrict(foundDist._id);
                    if (queryROId) {
                        const foundRO = foundDist.ros.find((r: any) => r._id === queryROId);
                        if (foundRO) {
                            setSelectedRO(foundRO._id);
                        }
                    }
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateBatchCode = useCallback(() => {
        if (!selectedDistrict || !selectedRO || !bookType || !volumeYear || !volumeCode) {
            setGeneratedCode('');
            return;
        }

        const district = districts.find(d => d._id === selectedDistrict);
        const ro = district?.ros.find((r: any) => r._id === selectedRO);
        if (!district || !ro) return;

        const dCode = district.districtCode.padStart(2, '0').slice(-2);
        const rCode = ro.roCode.padStart(2, '0').slice(-2);
        const bType = bookType.slice(0, 1);
        const vYear = volumeYear.padStart(4, '0').slice(-4);
        const vCode = volumeCode.padStart(3, '0').slice(-3);

        setGeneratedCode(`${dCode}${rCode}${bType}${vYear}${vCode}`);
    }, [selectedDistrict, selectedRO, bookType, volumeYear, volumeCode, districts]);

    useEffect(() => {
        generateBatchCode();
    }, [generateBatchCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/work/batch-creation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    districtId: selectedDistrict,
                    roId: selectedRO,
                    bookType,
                    volumeYear,
                    volumeCode,
                    createdBy: currentUserId,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create batch');

            setSuccess(true);

            // Reset fields for next entry
            setBookType('');
            setVolumeYear('');
            setVolumeCode('');

            // Revert success state after 3 seconds
            setTimeout(() => setSuccess(false), 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedDistrictData = districts.find(d => d._id === selectedDistrict);
    const isLocked = !!queryDistrictId && !!queryROId;

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-3 w-64" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8">
                            <Skeleton className="h-[400px] rounded-[2rem]" />
                        </div>
                        <div className="lg:col-span-4">
                            <Skeleton className="h-[400px] rounded-[2rem]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 transition-colors duration-500 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Simplified Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">
                            <ArrowLeft size={12} />
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">Create Batch</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Digitization Processing Unit Setup</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Configuration Card */}
                    <main className="lg:col-span-8 space-y-8">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 md:p-10 shadow-sm space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* District Selection */}
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">
                                        <MapPin size={10} className="text-blue-500" />
                                        Select District {isLocked && <Lock size={9} className="ml-1 text-zinc-300" />}
                                    </label>
                                    <div className="relative group">
                                        <select
                                            disabled={isLocked}
                                            required
                                            value={selectedDistrict}
                                            onChange={(e) => {
                                                setSelectedDistrict(e.target.value);
                                                setSelectedRO('');
                                            }}
                                            className="w-full h-12 pl-4 pr-10 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500/50 rounded-xl outline-none appearance-none font-bold text-zinc-700 dark:text-zinc-200 text-sm transition-all cursor-pointer disabled:bg-zinc-100/50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Choose District</option>
                                            {districts.map(d => (
                                                <option key={d._id} value={d._id}>{d.districtName} ({d.districtCode})</option>
                                            ))}
                                        </select>
                                        {!isLocked && <ChevronRight size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400 pointer-events-none" />}
                                    </div>
                                </div>

                                {/* RO Selection */}
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">
                                        <Building2 size={10} className="text-blue-500" />
                                        Registration Office {isLocked && <Lock size={9} className="ml-1 text-zinc-300" />}
                                    </label>
                                    <div className="relative group">
                                        <select
                                            disabled={isLocked || !selectedDistrict}
                                            required
                                            value={selectedRO}
                                            onChange={(e) => setSelectedRO(e.target.value)}
                                            className="w-full h-12 pl-4 pr-10 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500/50 rounded-xl outline-none appearance-none font-bold text-zinc-700 dark:text-zinc-200 text-sm transition-all cursor-pointer disabled:bg-zinc-100/50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Choose RO</option>
                                            {selectedDistrictData?.ros?.map((ro: any) => (
                                                <option key={ro._id} value={ro._id}>{ro.roName} ({ro.roCode})</option>
                                            ))}
                                        </select>
                                        {!isLocked && <ChevronRight size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400 pointer-events-none" />}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border border-zinc-100 dark:border-zinc-800/50">
                                {/* Book Type */}
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">
                                        <FileText size={10} className="text-blue-500" />
                                        Book Type
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={1}
                                        value={bookType}
                                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                        onChange={(e) => setBookType(e.target.value)}
                                        placeholder="1"
                                        className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500/50 rounded-xl outline-none font-bold text-zinc-700 dark:text-zinc-200 transition-all text-center text-base tracking-widest"
                                    />
                                </div>

                                {/* Volume Year */}
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">
                                        <Calendar size={10} className="text-blue-500" />
                                        Year
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={4}
                                        value={volumeYear}
                                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                        onChange={(e) => setVolumeYear(e.target.value)}
                                        placeholder="1970"
                                        className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500/50 rounded-xl outline-none font-bold text-zinc-700 dark:text-zinc-200 transition-all text-center text-base tracking-widest"
                                    />
                                </div>

                                {/* Volume Code */}
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">
                                        <Hash size={10} className="text-blue-500" />
                                        Volume
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={3}
                                        value={volumeCode}
                                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                                        onChange={(e) => setVolumeCode(e.target.value)}
                                        placeholder="001"
                                        className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500/50 rounded-xl outline-none font-bold text-zinc-700 dark:text-zinc-200 transition-all text-center text-base tracking-widest"
                                    />
                                </div>

                                <div className="md:col-span-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting || !generatedCode}
                                        className="w-full md:w-auto px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2.5 rounded-xl active:scale-[0.98] transition-all disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 shadow-lg shadow-blue-500/15 font-black text-[10px] uppercase tracking-widest ml-auto"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={14} />
                                                <span>Processing Batch</span>
                                            </>
                                        ) : success ? (
                                            <>
                                                <CheckCircle2 size={14} className="text-emerald-300" />
                                                <span>Successfully Created</span>
                                            </>
                                        ) : (
                                            <>
                                                <PlusCircle size={14} />
                                                <span>Initialize Unit</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/20">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{error}</span>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Preview Section */}
                    <aside className="lg:col-span-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group h-full">
                            <div className="absolute -top-10 -right-10 p-10 opacity-[0.02] text-zinc-900 dark:text-white pointer-events-none">
                                <Database size={200} />
                            </div>

                            <div className="relative h-full flex flex-col">
                                <div className="space-y-6 flex-grow">
                                    <div className="flex justify-between items-center">
                                        <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/30">
                                            <Sparkles size={11} className="animate-pulse text-blue-400" />
                                            Batch Signature
                                        </div>
                                        <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                            Stage: <span className="text-blue-600 dark:text-blue-400">{StageConfig.init.code}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="bg-zinc-50 dark:bg-zinc-800/30 p-6 md:p-8 rounded-[1rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-all group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/50">
                                            <div className="text-2xl md:text-3xl font-black tracking-[-0.04em] text-zinc-900 dark:text-white font-mono break-all leading-[1.15] text-center drop-shadow-sm">
                                                {generatedCode || '----------'}
                                            </div>
                                        </div>

                                        {generatedCode && (
                                            <button
                                                type="button"
                                                onClick={() => navigator.clipboard.writeText(generatedCode)}
                                                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-xl transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest mx-auto shadow-sm"
                                            >
                                                <Copy size={12} />
                                                Copy Signature
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-0 pt-8">
                                    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                        <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <MapPin size={8} /> Region
                                        </div>
                                        <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">{selectedDistrictData?.districtCode || '--'}</div>
                                    </div>
                                    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                        <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Building2 size={8} /> Office
                                        </div>
                                        <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">
                                            {selectedDistrictData?.ros.find((r: any) => r._id === selectedRO)?.roCode || '--'}
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                        <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Calendar size={8} /> Year
                                        </div>
                                        <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">{volumeYear || '----'}</div>
                                    </div>
                                    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                        <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Hash size={8} /> Unit
                                        </div>
                                        <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">{volumeCode || '---'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default function BatchCreationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-3 w-64" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8">
                            <Skeleton className="h-[400px] rounded-[2rem]" />
                        </div>
                        <div className="lg:col-span-4">
                            <Skeleton className="h-[400px] rounded-[2rem]" />
                        </div>
                    </div>
                </div>
            </div>
        }>
            <BatchCreationContent />
        </Suspense>
    );
}
