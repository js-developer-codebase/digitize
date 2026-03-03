import mongoose from 'mongoose';
import Batch, { IBatch } from '../models/Batch';
import District from '../models/District';
import User from '../models/User';

export class BatchRepository {
    async findByCode(batchCode: string): Promise<IBatch | null> {
        return Batch.findOne({ batchCode })
            .populate('districtId')
            .populate('roId')
            .populate('createdBy', 'name email userType');
    }

    async findById(id: string): Promise<IBatch | null> {
        return Batch.findById(id)
            .populate('districtId')
            .populate('roId')
            .populate('createdBy', 'name email userType');
    }

    async create(batchData: Partial<IBatch>): Promise<IBatch> {
        const newBatch = new Batch({
            ...batchData,
            isDeleted: batchData.isDeleted ?? false
        });
        return newBatch.save();
    }

    async updateStage(id: string, stage: string): Promise<IBatch | null> {
        return Batch.findByIdAndUpdate(id, { stage }, { new: true });
    }

    async findPaginated(
        query: any,
        skip: number,
        limit: number
    ): Promise<IBatch[]> {
        return Batch.find(query)
            .populate('districtId')
            .populate('createdBy', 'name email userType')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
    }

    async findProcessingBatches(params: {
        roId: string;
        visibleStages: string[];
        search?: string;
        skip: number;
        limit: number;
    }): Promise<IBatch[]> {
        const { roId, visibleStages, search, skip, limit } = params;

        const matchStage: any = {
            roId: new mongoose.Types.ObjectId(roId),
            stage: { $in: visibleStages },
            isDeleted: { $ne: true }
        };

        if (search) {
            matchStage.$and = [
                {
                    $or: [
                        { batchCode: { $regex: search, $options: 'i' } },
                        { volumeCode: { $regex: search, $options: 'i' } },
                    ]
                }
            ];
        }

        const pipeline: any[] = [
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'districts',
                    localField: 'districtId',
                    foreignField: '_id',
                    as: 'districtId'
                }
            },
            { $unwind: { path: '$districtId', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }
            },
            { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    'createdBy.password': 0,
                    'createdBy.otp': 0,
                    'createdBy.otpExpires': 0
                }
            }
        ];

        return Batch.aggregate(pipeline);
    }

    async updateLocking(
        id: string,
        lockedBy: string | null,
        lockedAt: Date | null
    ): Promise<IBatch | null> {
        return Batch.findByIdAndUpdate(id, { lockedBy, lockedAt }, { new: true });
    }

    async findAllBatches(params: {
        search?: string;
        roId?: string;
        skip: number;
        limit: number;
    }): Promise<IBatch[]> {
        const { search, roId, skip, limit } = params;
        const query: any = { isDeleted: { $ne: true } };

        if (roId) {
            query.roId = roId;
        }

        if (search) {
            query.$or = [
                { batchCode: { $regex: search, $options: 'i' } },
                { volumeCode: { $regex: search, $options: 'i' } },
            ];
        }

        return Batch.find(query)
            .populate('districtId')
            .populate('roId')
            .populate('createdBy', 'name email userType')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async softDelete(id: string, session?: mongoose.ClientSession): Promise<IBatch | null> {
        return Batch.findByIdAndUpdate(id, { isDeleted: true }, { new: true, session });
    }
}

export const batchRepository = new BatchRepository();
