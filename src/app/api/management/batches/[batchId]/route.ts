import { NextResponse } from 'next/server';
import { batchService } from '@/services/BatchService';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    try {
        const { batchId } = await params;
        const result = await batchService.softDeleteBatch(batchId);
        return NextResponse.json({ message: 'Batch and associated deeds soft deleted successfully', result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
