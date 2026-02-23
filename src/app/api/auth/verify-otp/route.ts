import { NextRequest } from 'next/server';
import { authController } from '../../../../controllers/AuthController';

export async function POST(req: NextRequest) {
    return authController.verifyOtp(req);
}
