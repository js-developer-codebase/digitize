import { districtRepository } from '../repositories/DistrictRepository';
import dbConnect from '../lib/dbConnect';

export class DistrictService {
    async getAllDistricts() {
        await dbConnect();
        return districtRepository.findAll();
    }
}

export const districtService = new DistrictService();
