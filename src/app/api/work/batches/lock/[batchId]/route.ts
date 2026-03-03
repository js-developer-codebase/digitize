import { NextResponse } from 'next/server';
import { batchService } from '@/services/BatchService';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    try {
        const { batchId } = await params;
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const batch = await batchService.lockBatch(batchId, userId);
        return NextResponse.json(batch);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
