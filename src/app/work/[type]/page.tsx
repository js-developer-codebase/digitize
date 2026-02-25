'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Settings, MapPin, Building2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function WorkContent() {
    const searchParams = useSearchParams();
    const params = useParams();
    const workType = params.type as string;
    const district = searchParams.get('district');
    const ro = searchParams.get('ro');

    const displayName = workType?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        Back to Workspace
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl">
                            <Settings size={24} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{displayName || 'Work Module'}</h1>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <MapPin size={16} className="text-emerald-500" />
                        <span className="text-sm font-medium">District: {district || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <Building2 size={16} className="text-purple-500" />
                        <span className="text-sm font-medium">RO: {ro || 'N/A'}</span>
                    </div>
                </div>
            </header>

            <main className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                    <Settings size={40} className="text-blue-600 animate-spin-slow" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Module Implementation in Progress</h2>
                <p className="text-zinc-500 max-w-md">
                    The {displayName} module for District {district} and RO {ro} is currently being set up.
                </p>
            </main>

            <style jsx>{`
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default function WorkPage() {
    return (
        <Suspense fallback={<div>Loading Module...</div>}>
            <WorkContent />
        </Suspense>
    );
}
