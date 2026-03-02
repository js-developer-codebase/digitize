import { deedRecordRepository } from '../repositories/DeedRecordRepository';
import { batchRepository } from '../repositories/BatchRepository';
import dbConnect from '../lib/dbConnect';
import { IDeedRecord } from '../models/DeedRecord';

export class DeedRecordService {
    async createDeed(data: {
        batchId: string;
        deedCode: string;
        pageFrom: number;
        pageTo: number;
        exceptionCode?: string | null;
        districtId?: string;
        roId?: string;
        bookType?: string;
        volumeYear?: string;
    }) {
        await dbConnect();

        const batch = await batchRepository.findById(data.batchId);
        if (!batch) {
            throw new Error('Batch not found');
        }

        // Logic: Check if deedCode already exists.
        // If it exists, update its default sequence from 1 to the highest available sequence number.


        const highestSeq = await deedRecordRepository.findHighestSequence(data.deedCode);
        const nextSequence = highestSeq === 0 ? 1 : highestSeq + 1;

        return await deedRecordRepository.create({
            ...data,
            sequence: nextSequence,
        });
    }

    async getDeedsByBatch(batchId: string) {
        await dbConnect();
        return await deedRecordRepository.findByBatch(batchId);
    }

    async completeBatch(batchId: string) {
        await dbConnect();
        const batch = await batchRepository.findById(batchId);
        if (!batch) throw new Error('Batch not found');

        // Move to next stage: imageUpload
        await batchRepository.updateStage(batchId, 'imageUpload');

        // Release lock
        await batchRepository.updateLocking(batchId, null, null);

        return { success: true };
    }
}

export const deedRecordService = new DeedRecordService();
