import { districtRepository } from '../repositories/DistrictRepository';
import { roRepository } from '../repositories/RORepository';
import dbConnect from '../lib/dbConnect';

export class DistrictService {
    async getAllDistricts() {
        await dbConnect();
        const districts = await districtRepository.findAll();

        // For each district, fetch its ROs from the new RO collection
        const enrichedDistricts = await Promise.all(
            districts.map(async (d) => {
                const ros = await roRepository.findByDistrictCode(d.districtCode);
                return {
                    ...d.toObject(),
                    ros: ros.map(ro => ({
                        _id: ro._id,
                        roName: ro.roName,
                        roCode: ro.roCode,
                        districtCode: ro.districtCode
                    }))
                };
            })
        );
        return enrichedDistricts;
    }
}

export const districtService = new DistrictService();

