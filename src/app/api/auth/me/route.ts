import { NextRequest } from 'next/server';
import { authController } from '@/controllers/AuthController';

export async function GET(req: NextRequest) {
    return authController.getMe(req);
}
