import { NextResponse } from 'next/server';
import { deedRecordService } from '@/services/DeedRecordService';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    try {
        const { batchId } = await params;
        const batch = await deedRecordService.completeBatch(batchId);
        return NextResponse.json(batch);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
