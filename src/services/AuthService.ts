import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { userRepository } from '../repositories/UserRepository';
import { userSchemaZod } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-jwt';
const resend = new Resend(process.env.RESEND_API_KEY || 're_test');

export class AuthService {
    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        // Generate a 6-digit OTP (Temporarily fixed for testing)
        const otp = '000000';
        const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

        await userRepository.update(user._id as unknown as string, { otp, otpExpires });

        // Temporarily disabled Resend for testing
        /*
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: user.email,
            subject: 'Your 2FA Login Code',
            html: `<p>Your login code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
        });
        */

        return {
            requiresOtp: true,
            email: user.email,
        };
    }

    async verifyOtp(email: string, otpCode: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or OTP');
        }

        if (user.otp !== otpCode) {
            throw new Error('Invalid OTP');
        }

        if (!user.otpExpires || new Date() > user.otpExpires) {
            throw new Error('OTP has expired');
        }

        await userRepository.update(user._id as unknown as string, { otp: '', otpExpires: null as any });

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                userType: user.userType, // Populated document or ID depending on query
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                accessRO: user.accessRO,
            },
        };
    }

    async getMe(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            accessRO: user.accessRO,
        };
    }
}

export const authService = new AuthService();
