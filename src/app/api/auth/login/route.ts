import { NextRequest } from 'next/server';
import { authController } from '@/controllers/AuthController';
import dbConnect from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
    await dbConnect();
    return authController.login(req);
}
