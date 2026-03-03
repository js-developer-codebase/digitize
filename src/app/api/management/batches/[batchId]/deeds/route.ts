import { NextResponse } from 'next/server';
import { deedRecordService } from '@/services/DeedRecordService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    try {
        const { batchId } = await params;
        const deeds = await deedRecordService.getDeedsByBatch(batchId);
        return NextResponse.json(deeds);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
