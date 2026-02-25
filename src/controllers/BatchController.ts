import { NextRequest, NextResponse } from 'next/server';
import { batchService } from '../services/BatchService';

export class BatchController {
    async createBatch(req: NextRequest) {
        try {
            const body = await req.json();
            const { districtId, roCode, bookType, volumeYear, volumeCode, createdBy } = body;

            if (!districtId || !roCode || !bookType || !volumeYear || !volumeCode || !createdBy) {
                return NextResponse.json(
                    { error: 'Missing required fields' },
                    { status: 400 }
                );
            }

            const result = await batchService.createBatch({
                districtId,
                roCode,
                bookType,
                volumeYear,
                volumeCode,
                createdBy,
            });

            return NextResponse.json(result, { status: 201 });
        } catch (error: any) {
            console.error('Batch creation error:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to create batch' },
                { status: 500 }
            );
        }
    }
}

export const batchController = new BatchController();
