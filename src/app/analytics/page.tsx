'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, MapPin, Building2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function AnalyticsContent() {
    const searchParams = useSearchParams();
    const districtCode = searchParams.get('district');
    const roCode = searchParams.get('ro');
    const [names, setNames] = React.useState({ districtName: 'N/A', roName: 'N/A' });

    React.useEffect(() => {
        const fetchNames = async () => {
            try {
                const res = await fetch('/api/districts');
                const districts = await res.json();

                const d = districts.find((item: any) => item.districtCode === districtCode);
                if (d) {
                    const r = d.ros.find((item: any) => item.roCode === roCode);
                    setNames({
                        districtName: d.districtName,
                        roName: r ? r.roName : 'N/A'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch names:', error);
            }
        };

        if (districtCode) fetchNames();
    }, [districtCode, roCode]);

    const truncate = (str: string, max: number) => {
        return str.length > max ? str.substring(0, max) + '...' : str;
    };

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
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                            <BarChart3 size={24} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm" title={names.districtName}>
                        <MapPin size={16} className="text-emerald-500" />
                        <span className="text-sm font-medium">District: {truncate(names.districtName, 15)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm" title={names.roName}>
                        <Building2 size={16} className="text-purple-500" />
                        <span className="text-sm font-medium">RO: {truncate(names.roName, 15)}</span>
                    </div>
                </div>
            </header>


            <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-64 flex items-center justify-center text-zinc-400 italic">
                        Analytics Placeholder Chart {i}
                    </div>
                ))}
            </main>
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <Suspense fallback={<div>Loading Analytics...</div>}>
            <AnalyticsContent />
        </Suspense>
    );
}
