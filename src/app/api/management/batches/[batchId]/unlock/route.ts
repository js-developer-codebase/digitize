import { NextResponse } from 'next/server';
import { batchService } from '@/services/BatchService';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    try {
        const { batchId } = await params;
        const result = await batchService.releaseBatch(batchId);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
