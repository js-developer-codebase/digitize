import District, { IDistrict } from '../models/District';

export class DistrictRepository {
    async findAll(): Promise<IDistrict[]> {
        return District.find();
    }

    async findByCode(districtCode: string): Promise<IDistrict | null> {
        return District.findOne({ districtCode });
    }

    async create(districtData: Partial<IDistrict>): Promise<IDistrict> {
        const newDistrict = new District(districtData);
        return newDistrict.save();
    }

    async countDocuments(): Promise<number> {
        return District.countDocuments();
    }
}

export const districtRepository = new DistrictRepository();
