import { NextRequest } from 'next/server';
import { batchController } from '@/controllers/BatchController';

export async function POST(req: NextRequest) {
    return batchController.createBatch(req);
}
