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

    async deleteDeed(deedId: string) {
        await dbConnect();
        const deleted = await deedRecordRepository.delete(deedId);
        if (!deleted) throw new Error('Deed not found');
        return { success: true };
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

    async checkDeedStatus(data: {
        batchId: string;
        roId: string;
        bookType?: string;
        deedCode: string;
        pageFrom: number;
        pageTo: number;
    }) {
        await dbConnect();

        // 1. Duplicate Check: Across the entire RO & BookType, ignoring year (as per "not enter year")
        const duplicateDeeds = await deedRecordRepository.findExistingRecords({
            roId: data.roId,
            bookType: data.bookType,
            deedCode: data.deedCode,
        });

        // 2. Overlap Check: Restricted to the current batch (as per "overlap is in the batch")
        const batchDeeds = await deedRecordRepository.findByBatch(data.batchId);

        const overlaps = batchDeeds.filter(deed => {
            return (data.pageFrom >= deed.pageFrom && data.pageFrom <= deed.pageTo) ||
                (data.pageTo >= deed.pageFrom && data.pageTo <= deed.pageTo) ||
                (deed.pageFrom >= data.pageFrom && deed.pageFrom <= data.pageTo);
        });

        return {
            isDuplicate: duplicateDeeds.length > 0,
            existingCount: duplicateDeeds.length,
            overlaps: overlaps.map(o => ({
                id: o._id,
                deedCode: o.deedCode,
                batchCode: (o.batchId as any)?.batchCode || 'Current',
                pageFrom: o.pageFrom,
                pageTo: o.pageTo,
                sequence: o.sequence
            }))
        };
    }
}

export const deedRecordService = new DeedRecordService();
