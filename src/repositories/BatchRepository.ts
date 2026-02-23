import Batch, { IBatch } from '../models/Batch';
import District from '../models/District';
import User from '../models/User';

export class BatchRepository {
    async findByCode(batchCode: string): Promise<IBatch | null> {
        return Batch.findOne({ batchCode })
            .populate('districtId')
            .populate('createdBy', 'name email userType');
    }

    async findById(id: string): Promise<IBatch | null> {
        return Batch.findById(id)
            .populate('districtId')
            .populate('createdBy', 'name email userType');
    }

    async create(batchData: Partial<IBatch>): Promise<IBatch> {
        const newBatch = new Batch(batchData);
        return newBatch.save();
    }

    async updateStage(id: string, stage: string): Promise<IBatch | null> {
        return Batch.findByIdAndUpdate(id, { stage }, { new: true });
    }
}

export const batchRepository = new BatchRepository();
