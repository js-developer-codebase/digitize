import { batchRepository } from '../repositories/BatchRepository';
import { districtRepository } from '../repositories/DistrictRepository';
import dbConnect from '../lib/dbConnect';

export class BatchService {
    async createBatch(data: {
        districtId: string;
        roCode: string;
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

        const districtCode2 = district.districtCode.padStart(2, '0').slice(-2);
        const roCode2 = data.roCode.padStart(2, '0').slice(-2);
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
            roCode: data.roCode,
            bookType: data.bookType,
            volumeYear: data.volumeYear,
            volumeCode: data.volumeCode,
            createdBy: data.createdBy,
            stage: 'init',
        });
    }
}

export const batchService = new BatchService();
