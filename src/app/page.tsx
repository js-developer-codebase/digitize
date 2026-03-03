'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import DynamicNavbar from '@/components/layout/DynamicNavbar';
import { LevelViews } from '@/components/dashboard/LevelViews';
import { useNavigationStore } from '@/store/navigationStore';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const resetNav = useNavigationStore(state => state.reset);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Session
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          router.push('/login');
          return;
        }
        const userData = await userRes.json();
        setUser(userData);

        // Fetch Districts
        const districtRes = await fetch('/api/districts');
        const districtData = await districtRes.json();
        setDistricts(districtData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => resetNav(); // Reset navigation on unmount
  }, [router, resetNav]);

  const handleLogout = async () => {
    // Simple logout: clear cookie (client-side if possible) or call a logout API
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
        {/* Skeleton TopBar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-50 flex items-center justify-between px-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Skeleton Navbar */}
        <div className="fixed top-16 left-0 right-0 h-14 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-40 flex items-center px-6 gap-8">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        <main className="pt-40 pb-12 px-6 max-w-7xl mx-auto">
          <div className="mb-12">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-[2rem]" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      <TopBar user={user} onLogout={handleLogout} />
      <DynamicNavbar />

      <main className="pt-32 pb-12 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Manage your digitization tasks and track progress across districts.
          </p>
        </div>

        <LevelViews
          userPermissions={user.userType?.permissions || []}
          districts={districts}
          accessRO={user.accessRO || []}
        />
      </main>

      <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                main {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
    </div>
  );
}
