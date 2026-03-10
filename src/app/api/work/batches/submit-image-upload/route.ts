import { NextResponse } from 'next/server';
import { batchService } from '@/services/BatchService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { batchId, assignments } = body;

        if (!batchId || !assignments || !Array.isArray(assignments)) {
            return NextResponse.json(
                { error: 'Invalid request body. batchId and assignments array are required.' },
                { status: 400 }
            );
        }

        const result = await batchService.submitImageUploadBatch(batchId, assignments);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Submit Image Upload API Error:', error);
        return NextResponse.json(
            { error: 'Failed to submit batch', details: error.message },
            { status: 500 }
        );
    }
}
