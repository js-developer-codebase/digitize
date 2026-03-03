import RO, { IRO } from '../models/RO';

export class RORepository {
    async findAll(): Promise<IRO[]> {
        return RO.find();
    }

    async findByDistrictId(districtId: string): Promise<IRO[]> {
        return RO.find({ districtId });
    }

    async findByCode(roCode: string): Promise<IRO | null> {
        return RO.findOne({ roCode });
    }

    async findById(id: string): Promise<IRO | null> {
        return RO.findById(id);
    }

    async create(roData: Partial<IRO>): Promise<IRO> {
        const newRO = new RO(roData);
        return newRO.save();
    }

    async countDocuments(): Promise<number> {
        return RO.countDocuments();
    }

    async findByIds(ids: string[]): Promise<IRO[]> {
        return RO.find({ _id: { $in: ids } });
    }
}

export const roRepository = new RORepository();
