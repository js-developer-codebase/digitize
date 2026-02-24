import { NextRequest } from 'next/server';
import { districtController } from '@/controllers/DistrictController';

export async function GET(req: NextRequest) {
    return districtController.getAllDistricts(req);
}
