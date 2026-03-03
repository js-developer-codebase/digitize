import { NextResponse } from 'next/server';
import { batchService } from '@/services/BatchService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ roId: string }> }
) {
    try {
        const { roId } = await params;
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const skip = parseInt(searchParams.get('skip') || '0');

        const batches = await batchService.getPaginatedBatches({
            roId,
            search,
            skip,
        });

        return NextResponse.json(batches);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
