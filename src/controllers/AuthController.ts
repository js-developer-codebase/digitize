import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../services/AuthService';

export class AuthController {
    async login(req: NextRequest) {
        try {
            const body = await req.json();
            const { email, password } = body;

            if (!email || !password) {
                return NextResponse.json(
                    { error: 'Email and password are required' },
                    { status: 400 }
                );
            }

            const result = await authService.login(email, password);
            return NextResponse.json(result, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { error: error.message || 'Login failed' },
                { status: 401 }
            );
        }
    }

    async verifyOtp(req: NextRequest) {
        try {
            const body = await req.json();
            const { email, otp } = body;

            if (!email || !otp) {
                return NextResponse.json(
                    { error: 'Email and OTP are required' },
                    { status: 400 }
                );
            }

            const result = await authService.verifyOtp(email, otp);

            const response = NextResponse.json(result, { status: 200 });

            // Set cookie for middleware
            response.cookies.set('auth_token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            return response;
        } catch (error: any) {
            return NextResponse.json(
                { error: error.message || 'OTP Verification failed' },
                { status: 401 }
            );
        }
    }
}

export const authController = new AuthController();
