'use client';

import React from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';

interface TopBarProps {
    user: {
        name: string;
        email: string;
    };
    onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, onLogout }) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-50 px-6 flex items-center justify-between dark:bg-black/80 dark:border-zinc-800">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Digitization
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2 hidden sm:flex">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                </div>

                <div className="relative group">
                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <div className="w-9 h-9 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                            <User size={20} className="text-zinc-600 dark:text-zinc-300" />
                        </div>
                        <ChevronDown size={16} className="text-zinc-400" />
                    </button>

                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 p-1">
                        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 sm:hidden">
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
