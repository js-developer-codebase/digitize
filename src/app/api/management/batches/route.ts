import { NextResponse } from 'next/server';
import { batchService } from '@/services/BatchService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const roId = searchParams.get('roId') || undefined;
        const skip = parseInt(searchParams.get('skip') || '0');

        const batches = await batchService.getAllBatches({
            search,
            roId,
            skip,
        });

        return NextResponse.json(batches);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
