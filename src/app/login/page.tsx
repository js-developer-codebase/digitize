'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from '@/components/ui/input-otp';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.requiresOtp) {
                setStep(2);
            } else {
                localStorage.setItem('token', data.token);
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            localStorage.setItem('token', data.token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 transition-all relative">

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl translate-x-12 -translate-y-12"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-x-12 translate-y-12"></div>

                <div className="relative">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-slate-800/50 rounded-2xl text-blue-400 shadow-inner border border-slate-700/50">
                            {step === 1 ? <ShieldAlert size={36} /> : <ShieldCheck size={36} className="text-emerald-400" />}
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">
                        {step === 1 ? 'Welcome Back' : 'Security Check'}
                    </h1>
                    <p className="text-slate-400 text-center mb-8 text-sm">
                        {step === 1
                            ? 'Enter your credentials to access your account'
                            : `We sent a 6-digit code to ${email}`}
                    </p>

                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-slate-300 font-medium">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="bg-slate-950/50 border-slate-800 h-12 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:border-blue-500 transition-all rounded-xl"
                                    required
                                />
                            </div>

                            <div className="space-y-2.5 pt-1">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                                    <a href="#" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-slate-950/50 border-slate-800 h-12 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:border-blue-500 transition-all rounded-xl"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-95"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </div>
                                ) : 'Sign In'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-8 flex flex-col items-center animate-in slide-in-from-right-8 fade-in duration-300">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={(value) => setOtp(value)}
                                disabled={loading}
                                className="gap-2"
                            >
                                <InputOTPGroup className="gap-2">
                                    <InputOTPSlot index={0} className="rounded-xl border-slate-700 text-white bg-slate-950/80 w-12 h-14 text-xl font-bold shadow-inner focus:ring-blue-500 transition-all" />
                                    <InputOTPSlot index={1} className="rounded-xl border-slate-700 text-white bg-slate-950/80 w-12 h-14 text-xl font-bold shadow-inner focus:ring-blue-500 transition-all" />
                                    <InputOTPSlot index={2} className="rounded-xl border-slate-700 text-white bg-slate-950/80 w-12 h-14 text-xl font-bold shadow-inner focus:ring-blue-500 transition-all" />
                                </InputOTPGroup>
                                <InputOTPSeparator className="text-slate-600 px-1" />
                                <InputOTPGroup className="gap-2">
                                    <InputOTPSlot index={3} className="rounded-xl border-slate-700 text-white bg-slate-950/80 w-12 h-14 text-xl font-bold shadow-inner focus:ring-blue-500 transition-all" />
                                    <InputOTPSlot index={4} className="rounded-xl border-slate-700 text-white bg-slate-950/80 w-12 h-14 text-xl font-bold shadow-inner focus:ring-blue-500 transition-all" />
                                    <InputOTPSlot index={5} className="rounded-xl border-slate-700 text-white bg-slate-950/80 w-12 h-14 text-xl font-bold shadow-inner focus:ring-blue-500 transition-all" />
                                </InputOTPGroup>
                            </InputOTP>

                            <div className="flex flex-col w-full space-y-4 pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95"
                                    disabled={loading || otp.length !== 6}
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-12 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp('');
                                        setError('');
                                    }}
                                >
                                    Cancel and go back
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <p className="mt-8 text-slate-500 text-sm">
                Protected by highly secure 2FA encryption
            </p>
        </div>
    );
}
