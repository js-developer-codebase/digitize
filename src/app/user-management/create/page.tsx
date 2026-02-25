'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    UserPlus,
    AtSign,
    Lock,
    Shield,
    MapPin,
    Building2,
    ArrowLeft,
    Check,
    ChevronRight,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Fingerprint,
    BadgeCheck,
    Globe
} from 'lucide-react';
import Link from 'next/link';

type Step = 1 | 2 | 3;

export default function CreateUserPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        userType: '',
        accessRO: [] as string[]
    });

    const [userTypes, setUserTypes] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
    const [availableROs, setAvailableROs] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesRes, distsRes] = await Promise.all([
                    fetch('/api/user-types'),
                    fetch('/api/districts')
                ]);
                const types = await typesRes.json();
                const dists = await distsRes.json();
                setUserTypes(types);
                setDistricts(dists);
            } catch (err) {
                console.error('Failed to fetch initial data:', err);
                setError('Failed to load configuration data.');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const ros = districts
            .filter(d => selectedDistricts.includes(d.districtCode))
            .flatMap(d => d.ros || []);
        setAvailableROs(ros);

        setFormData(prev => ({
            ...prev,
            accessRO: prev.accessRO.filter(id => ros.some((ro: any) => ro._id === id))
        }));
    }, [selectedDistricts, districts]);

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create user');

            setSuccess(true);
            setTimeout(() => router.push('/'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleRO = (roId: string) => {
        setFormData(prev => ({
            ...prev,
            accessRO: prev.accessRO.includes(roId)
                ? prev.accessRO.filter(id => id !== roId)
                : [...prev.accessRO, roId]
        }));
    };

    const toggleDistrict = (code: string) => {
        setSelectedDistricts(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const nextStep = () => {
        if (step === 1 && (!formData.name || !formData.email || !formData.password)) {
            setError('Please fill in all credentials.');
            return;
        }
        if (step === 2 && !formData.userType) {
            setError('Please select a user role.');
            return;
        }
        setError('');
        setStep(prev => (prev + 1) as Step);
    };

    const prevStep = () => {
        setError('');
        setStep(prev => (prev - 1) as Step);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="mx-auto w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight">Onboarding Complete!</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">The user profile has been provisioned and access is granted. Redirecting to workspace...</p>
                    <div className="pt-4">
                        <Loader2 className="animate-spin mx-auto text-emerald-600" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-8 lg:p-12 font-sans overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                            <ArrowLeft size={14} />
                            Exit Onboarding
                        </Link>
                        <div className="flex items-center gap-5">
                            <div className="p-5 bg-blue-600 text-white rounded-[1.5rem] shadow-lg shadow-blue-500/30">
                                <UserPlus size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Create Operator</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Step {step} of 3: {step === 1 ? 'Digital Identity' : step === 2 ? 'Security Clearance' : 'Jurisdictional Map'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 min-w-[300px]">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= s ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                    {step > s ? <Check size={16} /> : s}
                                </div>
                                <div className={`hidden md:block h-1 flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-blue-600' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                            </div>
                        ))}
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left Column: Form Steps */}
                    <div className="lg:col-span-8 space-y-8 min-h-[500px]">

                        {/* Step 1: Identity */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-left-8 duration-500 space-y-6">
                                <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                                            <Fingerprint className="text-blue-500" size={28} />
                                            Establish Identity
                                        </h2>
                                        <p className="text-zinc-400 font-medium">Provide the primary credentials for the new digital profile.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-4 flex items-center text-zinc-400 transition-colors group-focus-within:text-blue-500">
                                                    <UserPlus size={18} />
                                                </div>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. Alexander Pierce"
                                                    className="w-full pl-12 pr-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500/50 focus:bg-white dark:focus:bg-zinc-800 outline-none transition-all font-semibold text-lg"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Direct Email</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-4 flex items-center text-zinc-400 transition-colors group-focus-within:text-blue-500">
                                                    <AtSign size={18} />
                                                </div>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="alex@digitize.gov"
                                                    className="w-full pl-12 pr-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500/50 focus:bg-white dark:focus:bg-zinc-800 outline-none transition-all font-semibold text-lg"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Secure Passkey</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-4 flex items-center text-zinc-400 transition-colors group-focus-within:text-blue-500">
                                                    <Lock size={18} />
                                                </div>
                                                <input
                                                    required
                                                    type="password"
                                                    placeholder="Set a robust administrative password"
                                                    className="w-full pl-12 pr-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500/50 focus:bg-white dark:focus:bg-zinc-800 outline-none transition-all font-semibold text-lg"
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Role */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                                <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                                            <Shield className="text-purple-500" size={28} />
                                            Define Clearance
                                        </h2>
                                        <p className="text-zinc-400 font-medium">Select the operational role and administrative scope for this profile.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userTypes.map(type => (
                                            <button
                                                key={type._id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, userType: type.type })}
                                                className={`group relative flex flex-col p-6 rounded-[2rem] border-2 text-left transition-all duration-300 ${formData.userType === type.type
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-lg shadow-purple-500/10'
                                                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`p-3 rounded-xl transition-colors ${formData.userType === type.type ? 'bg-purple-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                                                        <BadgeCheck size={20} />
                                                    </div>
                                                    {formData.userType === type.type && (
                                                        <div className="flex items-center gap-1 text-[10px] font-black text-purple-600 uppercase tracking-tighter bg-purple-100 dark:bg-purple-500/30 px-2 py-0.5 rounded-full">
                                                            Active
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`font-black uppercase tracking-widest text-sm mb-1 ${formData.userType === type.type ? 'text-purple-700 dark:text-purple-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                    {type.type}
                                                </div>
                                                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                                    Permission-based access to specific operational modules and reporting metrics.
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Regions */}
                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
                                <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                                                <Globe className="text-emerald-500" size={28} />
                                                Jurisdiction Map
                                            </h2>
                                            <p className="text-zinc-400 font-medium text-sm">Designate the geographical scope of responsibility.</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-2xl">
                                            <Building2 size={16} className="text-emerald-600" />
                                            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{formData.accessRO.length} Assigned</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* District Selection */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px]">1</span>
                                                Enable Districts
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {districts.map(dist => (
                                                    <button
                                                        key={dist.districtCode}
                                                        type="button"
                                                        onClick={() => toggleDistrict(dist.districtCode)}
                                                        className={`p-4 rounded-2xl border-2 transition-all text-center ${selectedDistricts.includes(dist.districtCode)
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-600'
                                                            : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent text-zinc-500'
                                                            }`}
                                                    >
                                                        <div className="font-black text-xs">{dist.districtName}</div>
                                                        <div className="text-[9px] opacity-40 uppercase font-bold tracking-tighter">{dist.districtCode}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* RO Selection */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px]">2</span>
                                                Assigned Offices
                                            </h3>
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {availableROs.length > 0 ? (
                                                    availableROs.map(ro => (
                                                        <button
                                                            key={ro._id}
                                                            type="button"
                                                            onClick={() => toggleRO(ro._id)}
                                                            className={`flex items-center gap-3 p-4 w-full rounded-2xl border-2 transition-all ${formData.accessRO.includes(ro._id)
                                                                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 text-blue-600'
                                                                : 'bg-zinc-100/50 dark:bg-zinc-800/30 border-transparent text-zinc-400'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${formData.accessRO.includes(ro._id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                                                                {formData.accessRO.includes(ro._id) && <Check size={12} strokeWidth={4} />}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="text-xs font-black">{ro.roName}</div>
                                                                <div className="text-[9px] opacity-40 font-bold uppercase tracking-tighter">{ro.roCode}</div>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center p-8 opacity-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                                                        <MapPin size={32} />
                                                        <span className="text-[10px] font-black uppercase mt-2">Map Empty</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Control Bar */}
                        <div className="flex items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-lg">
                            <button
                                type="button"
                                onClick={step === 1 ? () => router.push('/') : prevStep}
                                className="px-8 py-4 rounded-2xl font-black text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                            >
                                <ChevronLeft size={18} />
                                {step === 1 ? 'Cancel' : 'Reverse'}
                            </button>

                            <div className="flex items-center gap-4">
                                {error && (
                                    <div className="hidden md:flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-right-4">
                                        <AlertCircle size={14} />
                                        <span className="text-[10px] font-black uppercase">{error}</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={step === 3 ? handleSubmit : nextStep}
                                    disabled={loading}
                                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 uppercase tracking-widest text-xs group disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            {step === 3 ? 'Finalize Onboarding' : 'Advance Station'}
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live User Preview */}
                    <div className="lg:col-span-4 sticky top-12">
                        <section className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] text-zinc-900 dark:text-white shadow-2xl relative overflow-hidden group border border-zinc-200 dark:border-zinc-800">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div className="relative space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
                                        Preview Card
                                    </div>
                                    <BadgeCheck className={formData.userType ? 'text-blue-500' : 'text-zinc-300'} size={24} />
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-blue-500/30">
                                        {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black truncate max-w-[150px]">{formData.name || 'Anonymous User'}</h3>
                                        <p className="text-zinc-400 text-xs font-bold truncate max-w-[150px]">{formData.email || 'pending@identity.net'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-700/50 space-y-1">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Clearance</p>
                                        <p className={`text-sm font-black uppercase ${formData.userType ? 'text-blue-600' : 'text-zinc-300'}`}>
                                            {formData.userType || 'Unassigned'}
                                        </p>
                                    </div>
                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-700/50 space-y-1">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Stations</p>
                                        <p className={`text-sm font-black uppercase ${formData.accessRO.length > 0 ? 'text-emerald-600' : 'text-zinc-300'}`}>
                                            {formData.accessRO.length} Assigned
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-700/50 space-y-3">
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Security Progress</p>
                                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000"
                                            style={{ width: `${(step / 3) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-wrap gap-2">
                                    {selectedDistricts.slice(0, 3).map(d => (
                                        <span key={d} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[8px] font-black uppercase text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                            {d}
                                        </span>
                                    ))}
                                    {selectedDistricts.length > 3 && <span className="text-[8px] font-black text-zinc-400">+{selectedDistricts.length - 3}</span>}
                                </div>
                            </div>
                        </section>

                        <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                            <h4 className="text-xs font-black text-blue-600 uppercase mb-2">Onboarding Notice</h4>
                            <p className="text-[10px] text-blue-600/60 font-medium leading-relaxed">
                                You are currently session-authorizing a new system operator. All jurisdictional assignments are audited in real-time.
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
