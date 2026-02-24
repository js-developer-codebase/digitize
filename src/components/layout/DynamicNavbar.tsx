'use client';

import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigationStore, NavPathItem } from '@/store/navigationStore';

const DynamicNavbar: React.FC = () => {
    const { path, popPath, jumpToLevel } = useNavigationStore();

    return (
        <nav className="fixed top-16 left-0 right-0 h-14 bg-white/50 backdrop-blur-sm border-b border-zinc-100 z-40 px-6 flex items-center gap-4 dark:bg-black/50 dark:border-zinc-900">
            {path.length > 0 && (
                <button
                    onClick={popPath}
                    className="p-2 mr-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                    title="Go Back"
                >
                    <ArrowLeft size={18} />
                </button>
            )}

            <div className="flex items-center text-sm font-medium">
                <button
                    onClick={() => jumpToLevel(-1)}
                    className={`px-2 py-1 rounded-md transition-colors ${path.length === 0 ? 'text-blue-600' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                >
                    Work
                </button>

                {path.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <ChevronRight size={14} className="mx-1 text-zinc-400" />
                        <button
                            onClick={() => jumpToLevel(index)}
                            className={`px-2 py-1 rounded-md transition-colors ${index === path.length - 1 ? 'text-blue-600' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            {item.name}
                        </button>
                    </React.Fragment>
                ))}
            </div>
        </nav>
    );
};

export default DynamicNavbar;
