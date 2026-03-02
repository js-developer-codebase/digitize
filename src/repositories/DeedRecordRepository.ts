import DeedRecord, { IDeedRecord } from '../models/DeedRecord';
import Batch from '../models/Batch';

export class DeedRecordRepository {
    async findByCode(deedCode: string): Promise<IDeedRecord | null> {
        return DeedRecord.findOne({ deedCode }).populate('batchId');
    }

    async findByBatch(batchId: string): Promise<IDeedRecord[]> {
        return DeedRecord.find({ batchId }).sort({ sequence: 1 });
    }

    async create(deedData: Partial<IDeedRecord>): Promise<IDeedRecord> {
        const newDeed = new DeedRecord(deedData);
        return newDeed.save();
    }

    async addDocumentImage(
        id: string,
        image: { imageUrl: string; imagePosition: string }
    ): Promise<IDeedRecord | null> {
        return DeedRecord.findByIdAndUpdate(
            id,
            { $push: { document: image } },
            { new: true }
        );
    }

    async updatePdfUrl(id: string, pdfUrl: string): Promise<IDeedRecord | null> {
        return DeedRecord.findByIdAndUpdate(id, { pdfUrl }, { new: true });
    }

    async findHighestSequence(deedCode: string): Promise<number> {
        const result = await DeedRecord.findOne({ deedCode })
            .sort({ sequence: -1 })
            .select('sequence');
        return result ? result.sequence : 0;
    }

    async findByCodeAndSequence(deedCode: string, sequence: number): Promise<IDeedRecord | null> {
        return DeedRecord.findOne({ deedCode, sequence });
    }
}

export const deedRecordRepository = new DeedRecordRepository();
