import { NextRequest } from 'next/server';
import { setupController } from '@/controllers/SetupController';
import dbConnect from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
    await dbConnect();
    return setupController.initialize();
}

export async function GET(req: NextRequest) {
    await dbConnect();
    return setupController.initialize();
}
