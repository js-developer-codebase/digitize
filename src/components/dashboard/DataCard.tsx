'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface DataCardProps {
    title: string;
    subtitle?: string;
    iconName?: string;
    onClick: () => void;
    color?: string;
}

const DataCard: React.FC<DataCardProps> = ({ title, subtitle, iconName, onClick, color = 'blue' }) => {
    // Resolve icon dynamically
    const Icon = (iconName && (Icons as any)[iconName]) ? (Icons as any)[iconName] as LucideIcon : Icons.Box;

    const colorClasses: Record<string, string> = {
        blue: 'from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900/30 text-blue-600',
        green: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-600',
        purple: 'from-purple-500/10 to-fuchsia-500/10 border-purple-200 dark:border-purple-900/30 text-purple-600',
        orange: 'from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-900/30 text-orange-600',
    };

    const iconBgClasses: Record<string, string> = {
        blue: 'bg-blue-100 dark:bg-blue-950/50',
        green: 'bg-emerald-100 dark:bg-emerald-950/50',
        purple: 'bg-purple-100 dark:bg-purple-950/50',
        orange: 'bg-orange-100 dark:bg-orange-950/50',
    };

    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden p-6 rounded-2xl border bg-gradient-to-br ${colorClasses[color]} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left w-full h-full flex flex-col justify-between`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${iconBgClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                </div>
                <Icons.ArrowUpRight size={20} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div>
                <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                </h3>
                {subtitle && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
            </div>
        </button>
    );
};

export default DataCard;
