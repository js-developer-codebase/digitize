import { batchRepository } from '../repositories/BatchRepository';
import { districtRepository } from '../repositories/DistrictRepository';
import { roRepository } from '../repositories/RORepository';
import { deedRecordRepository } from '../repositories/DeedRecordRepository';
import dbConnect from '../lib/dbConnect';
import mongoose from 'mongoose';

export class BatchService {
    async createBatch(data: {
        districtId: string;
        roId: string;
        bookType: string;
        volumeYear: string;
        volumeCode: string;
        createdBy: string;
    }) {
        await dbConnect();

        const district = await districtRepository.findById(data.districtId);
        if (!district) {
            throw new Error('District not found');
        }

        const ro = await roRepository.findById(data.roId);
        if (!ro) {
            throw new Error('RO not found');
        }

        const districtCode2 = district.districtCode.padStart(2, '0').slice(-2);
        const roCode2 = ro.roCode.padStart(2, '0').slice(-2);
        const bookType1 = data.bookType.slice(0, 1);
        const volumeYear4 = data.volumeYear.padStart(4, '0').slice(-4);
        const volumeCode3 = data.volumeCode.padStart(3, '0').slice(-3);

        const batchCode = `${districtCode2}${roCode2}${bookType1}${volumeYear4}${volumeCode3}`;

        const existingBatch = await batchRepository.findByCode(batchCode);
        if (existingBatch) {
            throw new Error(`Batch code ${batchCode} already exists`);
        }

        return await batchRepository.create({
            batchCode,
            districtId: data.districtId,
            roId: data.roId,
            roCode: ro.roCode,
            bookType: data.bookType,
            volumeYear: data.volumeYear,
            volumeCode: data.volumeCode,
            createdBy: data.createdBy,
            stage: 'deedcontroll',
            isDeleted: false
        });
    }

    async getPaginatedBatches(params: {
        roId: string;
        search?: string;
        skip?: number;
        stage?: string;
    }) {
        await dbConnect();
        const { roId, search, skip = 0, stage } = params;

        // If no specific stage is requested, use default visible stages for deed creation.
        const visibleStages = stage ? undefined : ['init', 'deedcontroll', 'data entry'];

        return await batchRepository.findProcessingBatches({
            roId,
            visibleStages,
            stage,
            search,
            skip,
            limit: 20
        });
    }

    async lockBatch(batchId: string, userId: string) {
        await dbConnect();
        const batch = await batchRepository.findById(batchId);
        if (!batch) throw new Error('Batch not found');

        const lockExpiry = new Date(Date.now() - 24 * 60 * 60 * 1000);

        if (
            batch.lockedBy &&
            batch.lockedBy.toString() !== userId &&
            batch.lockedAt &&
            batch.lockedAt > lockExpiry
        ) {
            throw new Error('Batch is locked by another user');
        }

        return await batchRepository.updateLocking(batchId, userId, new Date());
    }

    async releaseBatch(batchId: string) {
        await dbConnect();
        return await batchRepository.updateLocking(batchId, null, null);
    }

    async getAllBatches(params: {
        search?: string;
        roId?: string;
        skip?: number;
    }) {
        await dbConnect();
        const { search, roId, skip = 0 } = params;

        return await batchRepository.findAllBatches({
            search,
            roId,
            skip,
            limit: 20
        });
    }

    async softDeleteBatch(batchId: string) {
        await dbConnect();
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const batch = await batchRepository.softDelete(batchId, session);
            if (!batch) {
                throw new Error('Batch not found');
            }

            await deedRecordRepository.softDeleteByBatchId(batchId, session);

            await session.commitTransaction();
            return batch;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async submitImageUploadBatch(
        batchId: string,
        assignments: { deedId: string; images: { imageUrl: string; imagePosition: string }[] }[]
    ) {
        await dbConnect();
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Update each deed record with its assigned images
            for (const assignment of assignments) {
                await deedRecordRepository.updateDocumentImages(
                    assignment.deedId,
                    assignment.images
                );
            }

            // 2. Update batch stage to 'image qc'
            await batchRepository.updateStage(batchId, 'image qc');

            // 3. Release batch lock
            await batchRepository.updateLocking(batchId, null, null);

            await session.commitTransaction();
            return { success: true };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

export const batchService = new BatchService();
